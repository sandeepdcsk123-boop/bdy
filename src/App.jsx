import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Ring from './Ring'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import { PHOTOS, NAME, FULL, TYPED, REASONS, LETTER, COUPONS } from './data'
import { player, TRACKS } from './music'
import FX, { party } from './FX'
gsap.registerPlugin(ScrollTrigger)
const Bg3D = lazy(() => import('./Bg3D'))

function useTyped(s, delay = 0) {
  const [t, set] = useState('')
  useEffect(() => {
    let i = 0, id
    const st = setTimeout(() => { id = setInterval(() => { set(s.slice(0, ++i)); if (i >= s.length) clearInterval(id) }, 45) }, delay)
    return () => { clearTimeout(st); clearInterval(id) }
  }, [s])
  return t
}

// Har section ek full-screen moment; mood = us waqt kaunsa gaana bajna chahiye
const Sec = ({ children, mood, className = '' }) => (
  <motion.section onViewportEnter={() => mood != null && player.auto(mood)} viewport={{ amount: .5 }}
    className={`relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-5 py-16 text-center ${className}`}>
    <motion.div initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }}
      transition={{ duration: .7 }} className="flex w-full flex-col items-center">{children}</motion.div>
  </motion.section>
)

/* 1. GATE (GSAP: gift hilta hai, phat ke flash hota hai) */
function Gate({ onStart, onOpen }) {
  const open = () => {
    onStart()
    gsap.timeline({ onComplete: onOpen })
      .to('.gift', { scale: 1.4, rotate: 14, duration: .18, yoyo: true, repeat: 5, ease: 'power1.inOut' })
      .to('.gift', { scale: 10, opacity: 0, duration: .7, ease: 'power3.in' })
      .to('.flash', { opacity: 1, duration: .25 }, '-=.25')
  }
  return (
    <motion.section exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[radial-gradient(circle_at_50%_30%,#5a1f52,#2a0f2e_70%)] px-6 text-center">
      <div className="gift"><motion.div animate={{ y: [0, -14, 0], rotate: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} className="text-8xl">🎁</motion.div></div>
      <h1 className="font-display text-4xl font-bold leading-tight">{NAME}, tumhare liye<br />ek surprise hai</h1>
      <p className="text-sm text-pink-200">Volume on rakhna 🔊 aur phone seedha pakadna</p>
      <button onClick={open} className="btn">Surprise kholo 💝</button>
      <div className="flash pointer-events-none absolute inset-0 bg-white opacity-0" />
    </motion.section>
  )
}

/* 2. HERO (GSAP: letters 3D mein girte hain, photo parallax) */
const Letters = ({ text, cls = '' }) => text.split(' ').map((w, wi) => (
  <span key={wi} className="mr-3 inline-block whitespace-nowrap">{[...w].map((c, i) => <span key={i} className={`hl inline-block ${cls}`}>{c}</span>)}</span>
))
function Hero() {
  const t = useTyped(TYPED, 2600), r = useRef()
  useEffect(() => {
    const cx = gsap.context(() => {
      gsap.from('.himg', { scale: 1.5, filter: 'blur(14px)', duration: 3, ease: 'power2.out' })
      gsap.from('.hl', { rotateX: -100, y: 50, opacity: 0, stagger: .045, duration: 1.1, delay: .5, ease: 'back.out(2)', transformOrigin: '50% 100%' })
      gsap.from('.hsub', { opacity: 0, y: 20, duration: 1, delay: .2 })
      gsap.to('.hwrap', { yPercent: 12, scale: 1.12, ease: 'none', scrollTrigger: { trigger: r.current, start: 'top top', end: 'bottom top', scrub: true } })
    }, r)
    return () => cx.revert()
  }, [])
  return (
    <section ref={r} className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-end overflow-hidden px-5 pb-20 text-center">
      {PHOTOS[0] && <div className="hwrap absolute inset-0"><img src={PHOTOS[0].src} alt="" className="himg h-full w-full object-cover object-top" /></div>}
      <div className="absolute inset-0 bg-gradient-to-t from-plum via-plum/70 to-transparent" />
      <div className="relative" style={{ perspective: 600 }}>
        <p className="hsub text-sm text-gold">Aaj ka din sirf tumhara hai</p>
        <h2 className="font-display text-[2.75rem] font-bold italic leading-tight">
          <Letters text="Happy Birthday" /><br /><Letters text={FULL} cls="text-gold drop-shadow-[0_0_18px_rgba(246,201,120,.55)]" />
        </h2>
        <p className="mx-auto mt-4 min-h-[5rem] max-w-xs text-pink-100">{t}</p>
        <div className="mt-2 animate-bounce text-2xl text-gold">↓</div>
      </div>
    </section>
  )
}

/* 3. CAKE (phoonk maaro, mic se ya tap se) */
function blow() {
  return new Promise(async (res, rej) => {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true })
    const c = new AudioContext(), a = c.createAnalyser(); a.fftSize = 256
    c.createMediaStreamSource(s).connect(a)
    const d = new Uint8Array(a.frequencyBinCount); let n = 0, t0 = Date.now()
    const id = setInterval(() => {
      a.getByteTimeDomainData(d); let m = 0; d.forEach(v => m = Math.max(m, Math.abs(v - 128)))
      n = m > 55 ? n + 1 : 0
      const end = n >= 3, late = Date.now() - t0 > 15000
      if (end || late) { clearInterval(id); s.getTracks().forEach(t => t.stop()); c.close(); end ? res() : rej() }
    }, 80)
  })
}

function Cake() {
  const [lit, setLit] = useState([true, true, true]);
  const [celebrated, setCelebrated] = useState(false);

  const out = lit.every(v => !v);

  useEffect(() => {
    if (out && !celebrated) {
      setCelebrated(true);
      party(250);
    }
  }, [out]);

  const blowCandle = (index) => {
    if (!lit[index]) return;

    setLit(prev =>
      prev.map((v, i) => i === index ? false : v)
    );
  };

  const celebrateAgain = () => {
    setLit([true, true, true]);
    setCelebrated(false);
  };

  return (
    <Sec mood={0}>
      <div className="text-center">

        <div className="mb-3 text-4xl animate-bounce">
          🎂
        </div>

        <h3 className="h3">
          Make a Birthday Wish ✨
        </h3>

        <p className="sub">
          Close your eyes, make a beautiful wish,
          and tap all three candles to make it come true. 💖
        </p>

        {/* PREMIUM CAKE */}
        <div className="relative mx-auto mt-12 mb-10 h-64 w-72">

          {/* Sparkles */}
          <div className="absolute -left-2 top-12 text-2xl animate-pulse">
            ✨
          </div>

          <div className="absolute -right-1 top-20 text-xl animate-pulse">
            ⭐
          </div>

          {/* Candles */}
          <div className="absolute left-1/2 top-0 z-20 flex -translate-x-1/2 gap-8">

            {lit.map((isLit, i) => (
              <button
                key={i}
                onClick={() => blowCandle(i)}
                aria-label={`Blow out candle ${i + 1}`}
                className="group relative flex h-20 w-5 flex-col items-center cursor-pointer"
              >

                {/* Flame */}
                <span
                  className={`absolute -top-7 h-7 w-4 origin-bottom rounded-[50%_50%_40%_40%] bg-gradient-to-t from-orange-500 via-yellow-300 to-white shadow-[0_0_22px_8px_rgba(255,180,30,0.5)] transition-all duration-500 ${
                    isLit
                      ? 'scale-100 animate-pulse opacity-100'
                      : 'scale-0 opacity-0'
                  }`}
                />

                {/* Candle */}
                <span className="relative h-16 w-4 overflow-hidden rounded-md border border-white/40 bg-gradient-to-r from-pink-300 via-white to-pink-400 shadow-lg">

                  <span className="absolute inset-0 opacity-50"
                    style={{
                      background: 'repeating-linear-gradient(135deg, transparent 0px, transparent 7px, #fb7185 7px, #fb7185 10px)'
                    }}
                  />

                </span>

                {/* Wick */}
                <span className="absolute top-[-2px] h-2 w-[2px] bg-gray-800" />

              </button>
            ))}

          </div>

          {/* Top Cake Layer */}
          <div className="absolute left-1/2 top-[78px] z-10 h-12 w-44 -translate-x-1/2 rounded-xl border-b-4 border-pink-300 bg-gradient-to-b from-pink-100 to-pink-300 shadow-lg">

            <div className="absolute -top-1 left-0 h-4 w-full rounded-full bg-white shadow-sm" />

            <div className="absolute top-5 left-5 text-xs">🍓</div>
            <div className="absolute top-5 right-5 text-xs">🍒</div>

          </div>

          {/* Middle Layer */}
          <div className="absolute left-1/2 top-[124px] z-10 h-14 w-56 -translate-x-1/2 rounded-xl border-b-4 border-rose-400 bg-gradient-to-b from-rose-200 to-pink-400 shadow-lg">

            <div className="absolute -top-1 left-0 h-4 w-full rounded-full bg-pink-50" />

            <div className="absolute left-8 top-6 text-sm">🤍</div>
            <div className="absolute right-8 top-6 text-sm">🤍</div>

          </div>

          {/* Bottom Layer */}
          <div className="absolute left-1/2 top-[177px] z-10 h-16 w-64 -translate-x-1/2 rounded-xl border-b-4 border-rose-500 bg-gradient-to-b from-pink-300 to-rose-400 shadow-xl">

            <div className="absolute -top-1 left-0 h-5 w-full rounded-full bg-white" />

            <div className="absolute left-10 top-7 text-lg">🍓</div>
            <div className="absolute right-10 top-7 text-lg">🍓</div>

          </div>

          {/* Cake Plate */}
          <div className="absolute left-1/2 top-[232px] h-5 w-72 -translate-x-1/2 rounded-[50%] border-b-4 border-white/50 bg-gradient-to-b from-white to-pink-200 shadow-xl" />

        </div>

        {/* Candle Counter */}
        {!out && (
          <div className="mb-6">
            <p className="text-sm font-medium text-pink-100">
              Tap the candles to turn them off
            </p>

            <div className="mt-3 flex justify-center gap-3">
              {lit.map((v, i) => (
                <span key={i} className="text-2xl transition-all">
                  {v ? '🕯️' : '✨'}
                </span>
              ))}
            </div>

            <p className="mt-2 text-xs text-pink-200">
              {lit.filter(Boolean).length} candles remaining
            </p>
          </div>
        )}

        {/* Final Birthday Wish */}
        {out ? (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: .8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: .8 }}
            className="mx-auto max-w-sm"
          >

            <div className="mb-4 text-5xl animate-bounce">
              💖
            </div>

            <h2 className="font-display text-3xl font-bold italic text-gold">
              Happy Birthday, {NAME}! 🎉
            </h2>

            <p className="mt-4 text-lg leading-relaxed text-pink-100">
              Tumhari har wish poori ho,
              tumhari life khushiyon se bhari rahe.
              Hamesha haste raho aur chamakte raho! ✨
            </p>

            <p className="mt-4 text-2xl">
              💐 🥳 💝
            </p>

            <button
              onClick={celebrateAgain}
              className="btn mt-6"
            >
              🎉 Celebrate Again
            </button>

          </motion.div>
        ) : (
          <p className="text-sm italic text-pink-200">
            Three candles, three wishes, endless happiness. 💕
          </p>
        )}

      </div>
    </Sec>
  );
}


/* 4. SCRATCH CARD */
function Scratch() {
  const ref = useRef(); const [done, setDone] = useState(false)
  const p = PHOTOS[2] || PHOTOS[0]
  useEffect(() => {
    const c = ref.current; if (!c) return
    const w = c.width = c.offsetWidth, h = c.height = c.offsetHeight, x = c.getContext('2d')
    const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#f6c978'); g.addColorStop(.5, '#ff8fb1'); g.addColorStop(1, '#c084fc')
    x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = '700 28px "Cormorant Garamond",serif'; x.textAlign = 'center'
    x.fillText('Scratch✨', w / 2, h / 2)
    let down = false, n = 0
    const sc = e => {
      if (!down) return
      const r = c.getBoundingClientRect(); x.globalCompositeOperation = 'destination-out'
      x.beginPath(); x.arc(e.clientX - r.left, e.clientY - r.top, 30, 0, 7); x.fill()
      if (++n % 10 === 0) { const d = x.getImageData(0, 0, w, h).data; let k = 0; for (let i = 3; i < d.length; i += 160) if (!d[i]) k++; if (k / (d.length / 160) > .4) { setDone(true); party() } }
    }
    c.onpointerdown = e => { down = true; sc(e) }; c.onpointermove = sc; c.onpointerup = c.onpointerleave = () => (down = false)
  }, [])
  return (
    <Sec>
      <h3 className="h3">Ek chhupa hua surprise 🎁</h3>
      <p className="sub">Is card ko Scratch, dekho neeche kya hai.</p>
      <div className="relative aspect-[3/4] w-72 overflow-hidden rounded-3xl border-2 border-gold shadow-2xl">
        {p && <img src={p.src} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        <canvas ref={ref} style={{ touchAction: 'none' }} className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${done ? 'pointer-events-none opacity-0' : ''}`} />
      </div>
      <p className="mt-4 h-8 font-display text-2xl italic text-gold">{done ? 'Meri sabse pyaari 💖' : ''}</p>
    </Sec>
  )
}

/* 6. REASONS */
function Reasons() {
  const [o, setO] = useState({})
  return (
    <Sec>
      <h3 className="h3">Tumse pyaar kyun hai 💌</h3>
      <p className="sub">Har card pe tap karo.</p>
      <div className="grid w-full max-w-sm grid-cols-2 gap-3">
        {REASONS.map((r, i) => (
          <motion.button key={i} whileTap={{ scale: .94 }} onClick={() => { setO(s => ({ ...s, [i]: !s[i] })); party(40) }}
            className={`flex min-h-[110px] items-center justify-center rounded-2xl border border-white/20 p-3 text-sm font-semibold ${o[i] ? 'bg-gradient-to-br from-rose to-orange-400' : 'bg-white/10 backdrop-blur'}`}>
            {o[i] ? r : `💌 Card ${i + 1}`}
          </motion.button>
        ))}
      </div>
    </Sec>
  )
}

/* 7. LETTER */
function Letter() {
  const [open, setOpen] = useState(false)
  return (
    <Sec mood={1}>
      <h3 className="h3">Ek khat, tumhare naam</h3>
      {!open ? (
        <>
          <motion.button onClick={() => { setOpen(true); party(60) }} animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} className="my-8 text-8xl">💌</motion.button>
          <p className="sub">Tap karke kholo</p>
        </>
      ) : (
        <motion.article initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 1.1 } } }}
          className="mt-4 w-full max-w-sm rounded-2xl bg-blush p-6 text-left text-plum shadow-2xl">
          {LETTER.map((l, i) => <motion.p key={i} variants={{ h: { opacity: 0, y: 14 }, s: { opacity: 1, y: 0 } }}
            className={i === LETTER.length - 1 ? 'text-right font-display text-2xl font-bold italic' : 'mb-3'}>{l}</motion.p>)}
        </motion.article>
      )}
    </Sec>
  )
}

/* 8. FINALE */
function Finale() {
  const [done, setDone] = useState({})
  const strip = [...PHOTOS, ...PHOTOS]
  return (
    <Sec mood={2}>
      <h3 className="h3 text-5xl">Janamdin mubarak,<br /><span className="shimmer">{NAME}!</span> 🎉</h3>
      <p className="sub">Ye saal tumhare liye khushiyon se bhara ho. Aakhri surprise: tumhare coupons 👇</p>
      <div className="w-full max-w-sm space-y-3">
        {COUPONS.map((c, i) => (
          <button key={i} onClick={() => { setDone(d => ({ ...d, [i]: 1 })); party(120) }} className="w-full rounded-2xl border border-gold/50 bg-white/10 p-4 text-left">
            <div className="font-display text-2xl font-bold text-gold">{c.t}</div>
            <div className="text-sm">{done[i] ? '✅ Redeem ho gaya! Ab mujhse maang lo 😄' : c.d}</div>
          </button>
        ))}
      </div>
      <div className="mt-10 w-screen overflow-hidden">
        <motion.div className="flex w-max" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 35, ease: 'linear', repeat: Infinity }}>
          {strip.map((p, i) => <img key={i} src={p.src} alt="" className="mr-3 h-24 w-24 rounded-full border-2 border-gold object-cover" />)}
        </motion.div>
      </div>
      <button className="btn mt-10" onClick={() => { party(300); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Phir se dekho 💖</button>
      <p className="mt-6 text-xs text-pink-200">Sirf tumhare liye, pyaar se banaya gaya ❤️</p>
    </Sec>
  )
}

/* MUSIC PLAYER */
function PlayerUI() {
  const [s, set] = useState(player.state())
  useEffect(() => player.sub(set), [])
  return (
    <div className="fixed bottom-3 right-3 z-[70] flex items-center gap-1 rounded-full border border-white/20 bg-black/50 py-1 pl-3 pr-1 text-xs backdrop-blur" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
      <span className="max-w-[120px] truncate">{s.playing ? '♪ ' : ''}{TRACKS[s.idx].name}</span>
      <button aria-label="play pause" onClick={() => player.toggle()} className="h-9 w-9 rounded-full bg-rose">{s.playing ? '❚❚' : '▶'}</button>
      <button aria-label="next song" onClick={() => player.next()} className="h-9 w-9 rounded-full bg-white/20">⏭</button>
    </div>
  )
}

export default function App() {
  const [open, setOpen] = useState(false)
  // Gate pe tap = user gesture, isi mein music + phone tilt ki permission chahiye
  const start = () => { player.play(0); window.DeviceOrientationEvent?.requestPermission?.().catch(() => {}) }
  const go = () => { setOpen(true); party(300) }
  return (
    <div className="overflow-x-hidden font-sans text-pink-50">
      <Suspense fallback={null}><Bg3D /></Suspense>
      <FX />
      <AnimatePresence>{!open && <Gate onStart={start} onOpen={go} />}</AnimatePresence>
      {open && <><Hero /><Cake /><Scratch /><Ring Sec={Sec} /><Reasons /><Letter /><Finale /><PlayerUI /></>}
    </div>
  )
}
