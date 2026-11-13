// 3 tracks. Agar public/music/song1.mp3, song2.mp3, song3.mp3 rakhoge to wo bajenge,
// nahi to neeche wali built-in music-box / romantic / party tunes bajengi.
const m2f = n => 440 * 2 ** ((n - 69) / 12)
let ctx, noise
const subs = new Set()

function tone(bus, n, t, d, { type = 'sine', v = .2 } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = type; o.frequency.value = m2f(n)
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + d)
  o.connect(g).connect(bus); o.start(t); o.stop(t + d + .05)
}
function drum(bus, t, k) {
  const g = ctx.createGain()
  if (k === 'k') {
    const o = ctx.createOscillator()
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + .12)
    g.gain.setValueAtTime(.8, t); g.gain.exponentialRampToValueAtTime(.001, t + .2)
    o.connect(g).connect(bus); o.start(t); o.stop(t + .22)
  } else {
    if (!noise) { noise = ctx.createBuffer(1, ctx.sampleRate * .06, ctx.sampleRate); noise.getChannelData(0).forEach((_, i, a) => a[i] = Math.random() * 2 - 1) }
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter()
    s.buffer = noise; f.type = 'highpass'; f.frequency.value = 7000
    g.gain.setValueAtTime(.18, t); g.gain.exponentialRampToValueAtTime(.001, t + .05)
    s.connect(f).connect(g).connect(bus); s.start(t)
  }
}

// 1) Happy Birthday, music box
const HB = [[67,.75],[67,.25],[69,1],[67,1],[72,1],[71,2],[67,.75],[67,.25],[69,1],[67,1],[74,1],[72,2],[67,.75],[67,.25],[79,1],[76,1],[72,1],[71,1],[69,2],[77,.75],[77,.25],[76,1],[72,1],[74,1],[72,2]]
const hb = (bus, t) => {
  const B = .62; let x = 0
  HB.forEach(([n, b]) => { tone(bus, n, t + x * B, b * B * 1.8, { type: 'triangle', v: .3 }); tone(bus, n + 12, t + x * B, b * B, { v: .07 }); x += b })
  ;[[0,[48,52,55]],[6,[43,50,55]],[12,[48,52,55]],[19,[41,48,53]]].forEach(([b, c]) => c.forEach(n => tone(bus, n - 12, t + b * B, 5 * B, { type: 'triangle', v: .09 })))
  return x * B + .8
}
// 2) Romantic, slow arpeggios
const CH = [[57,60,64],[53,57,60],[60,64,67],[55,59,62]]
const rom = (bus, t) => {
  const B = 60 / 72
  for (let r = 0; r < 8; r++) {
    const c = CH[r % 4], s = t + r * 4 * B
    c.forEach(n => tone(bus, n - 12, s, 4 * B, { type: 'triangle', v: .09 }))
    tone(bus, c[0] - 24, s, 4 * B, { v: .2 })
    for (let i = 0; i < 8; i++) tone(bus, c[[0,1,2,1][i % 4]] + 12, s + i * B / 2, B * 1.3, { v: .14 })
    if (r > 3) tone(bus, c[2] + 24, s + B * 2, B * 2, { v: .1 })
  }
  return 32 * B
}
// 3) Party, upbeat
const PC = [[48,0],[43,0],[45,1],[41,0]]
const par = (bus, t) => {
  const B = 60 / 118
  for (let bar = 0; bar < 8; bar++) {
    const [root, minor] = PC[bar % 4], s = t + bar * 4 * B, tri = [0, minor ? 3 : 4, 7]
    for (let b = 0; b < 4; b++) { drum(bus, s + b * B, 'k'); drum(bus, s + (b + .5) * B, 'h') }
    for (let i = 0; i < 8; i++) tone(bus, root - 12 + (i % 2 ? 12 : 0), s + i * B / 2, B * .4, { type: 'sawtooth', v: .1 })
    for (let i = 0; i < 16; i++) tone(bus, root + 24 + tri[i % 3] + (i % 8 > 4 ? 12 : 0), s + i * B / 4, B * .22, { type: 'square', v: .045 })
  }
  return 32 * B
}

export const TRACKS = [
  { name: 'Happy Birthday ✨', file: '/music/song1.mp3', synth: hb },
  { name: 'Dil se, romantic 💞', file: '/music/song2.mp3', synth: rom },
  { name: 'Party mode 🎉', file: '/music/song3.mp3', synth: par },
]
const S = { idx: 0, playing: false, paused: false, bus: null, timer: 0, audio: null, vol: 1 }
const emit = () => subs.forEach(f => f({ idx: S.idx, playing: S.playing }))
async function hasFile(f) { try { const r = await fetch(f, { method: 'HEAD' }); return r.ok && /audio|octet/.test(r.headers.get('content-type') || '') } catch { return false } }
function stopAll() {
  clearTimeout(S.timer); clearTimeout(S.rot)
  if (S.bus) { const b = S.bus; b.gain.setTargetAtTime(0, ctx.currentTime, .05); setTimeout(() => b.disconnect(), 400); S.bus = null }
  if (S.audio) { S.audio.pause(); S.audio = null }
}

export const player = {
  state: () => ({ idx: S.idx, playing: S.playing }),
  sub: f => (subs.add(f), () => subs.delete(f)),
  async play(i = S.idx) {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    stopAll(); S.idx = i; S.playing = true; S.paused = false; emit()
    S.rot = setTimeout(() => player.next(), 30000) // har 30 sec mein gaana badlo
    const tr = TRACKS[i]
    if (await hasFile(tr.file)) { if (S.idx !== i || !S.playing) return; const a = S.audio = new Audio(tr.file); a.loop = true; a.volume = .8 * S.vol; a.play().catch(() => {}); return }
    if (S.idx !== i || !S.playing) return
    const bus = S.bus = ctx.createGain(); bus.gain.value = 0; bus.gain.linearRampToValueAtTime(.5 * S.vol, ctx.currentTime + 1.5)
    const dl = ctx.createDelay(); dl.delayTime.value = .3; const fb = ctx.createGain(); fb.gain.value = .35; const wet = ctx.createGain(); wet.gain.value = .4
    bus.connect(ctx.destination); bus.connect(dl); dl.connect(fb).connect(dl); dl.connect(wet).connect(ctx.destination) // echo, music ko richer banata hai
    const loop = t => { const d = tr.synth(bus, t); S.timer = setTimeout(() => loop(t + d), (d - 1.5) * 1000) }
    loop(ctx.currentTime + .1)
  },
  toggle() { if (S.playing) { stopAll(); S.playing = false; S.paused = true; emit() } else player.play() },
  next() { player.play((S.idx + 1) % TRACKS.length) },
  auto() {},
  duck(v) { S.vol = v; if (S.bus) S.bus.gain.value = .5 * v; if (S.audio) S.audio.volume = .8 * v },
}
