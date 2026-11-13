
// ==========================================
// HAPPY BIRTHDAY MUSIC BOX PLAYER
// Only One Track - No Romantic / Party
// ==========================================

const m2f = n => 440 * 2 ** ((n - 69) / 12);

let ctx;
const subs = new Set();

// ==========================================
// SOUND GENERATOR
// ==========================================

function tone(bus, n, t, d, { type = 'sine', v = .2 } = {}) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();

  o.type = type;
  o.frequency.value = m2f(n);

  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + .015);
  g.gain.exponentialRampToValueAtTime(.0001, t + d);

  o.connect(g).connect(bus);
  o.start(t);
  o.stop(t + d + .05);
}

// ==========================================
// HAPPY BIRTHDAY MUSIC BOX
// ==========================================

const HB = [
  [67,.75],[67,.25],[69,1],[67,1],[72,1],[71,2],
  [67,.75],[67,.25],[69,1],[67,1],[74,1],[72,2],
  [67,.75],[67,.25],[79,1],[76,1],[72,1],[71,1],[69,2],
  [77,.75],[77,.25],[76,1],[72,1],[74,1],[72,2]
];

const hb = (bus, t) => {
  const B = .62;
  let x = 0;

  HB.forEach(([n, b]) => {
    // Main music box melody
    tone(bus, n, t + x * B, b * B * 1.8, {
      type: 'triangle',
      v: .42
    });

    // Sweet high notes
    tone(bus, n + 12, t + x * B, b * B, {
      v: .12
    });

    x += b;
  });

  // Soft background chords
  [
    [0,[48,52,55]],
    [6,[43,50,55]],
    [12,[48,52,55]],
    [19,[41,48,53]]
  ].forEach(([b, c]) => {
    c.forEach(n => {
      tone(bus, n - 12, t + b * B, 5 * B, {
        type: 'triangle',
        v: .13
      });
    });
  });

  return x * B + .8;
};

// ==========================================
// SINGLE TRACK
// ==========================================

export const TRACKS = [
  {
    name: 'Happy Birthday ✨',
    file: '/music/song1.mp3',
    synth: hb
  }
];

// ==========================================
// PLAYER STATE
// ==========================================

const S = {
  idx: 0,
  playing: false,
  paused: false,
  bus: null,
  timer: 0,
  audio: null,
  vol: 1
};

const emit = () =>
  subs.forEach(f =>
    f({
      idx: S.idx,
      playing: S.playing
    })
  );

// ==========================================
// CHECK MP3
// ==========================================

async function hasFile(f) {
  try {
    const r = await fetch(f, { method: 'HEAD' });

    return r.ok &&
      /audio|octet/.test(
        r.headers.get('content-type') || ''
      );
  } catch {
    return false;
  }
}

// ==========================================
// STOP MUSIC
// ==========================================

function stopAll() {
  clearTimeout(S.timer);

  if (S.bus && ctx) {
    const b = S.bus;

    b.gain.setTargetAtTime(
      0,
      ctx.currentTime,
      .05
    );

    setTimeout(() => b.disconnect(), 400);
    S.bus = null;
  }

  if (S.audio) {
    S.audio.pause();
    S.audio.currentTime = 0;
    S.audio = null;
  }
}

// ==========================================
// MAIN PLAYER
// ==========================================

export const player = {

  state: () => ({
    idx: S.idx,
    playing: S.playing
  }),

  sub: f => (
    subs.add(f),
    () => subs.delete(f)
  ),

  async play() {

    ctx ||= new (
      window.AudioContext ||
      window.webkitAudioContext
    )();

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    stopAll();

    S.idx = 0;
    S.playing = true;
    S.paused = false;

    emit();

    const tr = TRACKS[0];

    // Use MP3 if available
    if (await hasFile(tr.file)) {

      if (!S.playing) return;

      const a = S.audio = new Audio(tr.file);

      a.loop = true;
      a.volume = S.vol;

      a.play().catch(() => {});

      return;
    }

    // Built-in Happy Birthday Music Box
    if (!S.playing) return;

    const bus = S.bus = ctx.createGain();

    bus.gain.setValueAtTime(0, ctx.currentTime);

    bus.gain.linearRampToValueAtTime(
      .9 * S.vol,
      ctx.currentTime + .3
    );

    // Soft echo
    const dl = ctx.createDelay();
    dl.delayTime.value = .3;

    const fb = ctx.createGain();
    fb.gain.value = .25;

    const wet = ctx.createGain();
    wet.gain.value = .3;

    bus.connect(ctx.destination);
    bus.connect(dl);

    dl.connect(fb).connect(dl);
    dl.connect(wet).connect(ctx.destination);

    // Repeat Happy Birthday melody
    const loop = t => {
      if (!S.playing || S.bus !== bus) return;

      const d = tr.synth(bus, t);

      S.timer = setTimeout(
        () => loop(t + d),
        Math.max(100, (d - 1.5) * 1000)
      );
    };

    loop(ctx.currentTime + .1);
  },

  // Play / Pause
  toggle() {
    if (S.playing) {
      stopAll();

      S.playing = false;
      S.paused = true;

      emit();
    } else {
      player.play();
    }
  },

  // No other tracks
  next() {
    player.play();
  },

  auto() {},

  // Volume
  duck(v) {
    S.vol = Math.max(0, Math.min(1, v));

    if (S.bus && ctx) {
      S.bus.gain.setTargetAtTime(
        .9 * S.vol,
        ctx.currentTime,
        .03
      );
    }

    if (S.audio) {
      S.audio.volume = S.vol;
    }
  }
};
