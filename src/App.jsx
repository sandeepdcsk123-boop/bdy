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
  const [lit, setLit] = useState([1, 1, 1]); const [msg, setMsg] = useState('')
  const out = lit.every(v => !v)
  useEffect(() => { if (out) party(250) }, [out])
  const mic = async () => {
    try { player.duck(.15); setMsg('Ab zor se phoonk maaro... 🌬️'); await blow(); setLit([0, 0, 0]) }
    catch { setMsg('Mic nahi chala, candles pe tap karo 👆') }
    finally { player.duck(1) }
  }
  return (
    <Sec mood={0}>
      <h3 className="h3">Pehle ek wish maango 🕯️</h3>
      <p className="sub">Aankhein band karo, dil mein kuch maango, phir candles bujha do.</p>
      <div className="relative mb-6 mt-8 h-56 w-56">
        <div className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 gap-7">
          {lit.map((l, i) => (
            <button key={i} aria-label="candle" onClick={() => setLit(a => a.map((v, j) => j === i ? 0 : v))}
              className="relative h-11 w-3 rounded bg-[repeating-linear-gradient(45deg,#fff_0_6px,#ff5e8a_6px_12px)] before:absolute before:-inset-3 before:content-['']">
              <span className={`absolute -top-6 left-1/2 -ml-[7px] h-6 w-3.5 animate-pulse rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-[radial-gradient(#fff,#ffd54a_50%,#ff8a00)] shadow-[0_0_22px_8px_#ffb30080] transition-all duration-300 ${l ? '' : 'scale-0 opacity-0'}`} />
            </button>
          ))}
        </div>
        <div className="absolute left-1/2 top-12 h-11 w-28 -translate-x-1/2 rounded-xl bg-gradient-to-b from-white to-pink-200" />
        <div className="absolute left-1/2 top-[92px] h-12 w-40 -translate-x-1/2 rounded-xl bg-gradient-to-b from-amber-100 to-gold" />
        <div className="absolute left-1/2 top-[140px] h-14 w-56 -translate-x-1/2 rounded-xl bg-gradient-to-b from-pink-300 to-rose" />
        <div className="absolute -inset-x-2 top-[196px] h-6 rounded-[50%] bg-white/20" />
      </div>
      {!out ? <button onClick={mic} className="btn">🎤 Phoonk maaro</button>
        : <motion.p initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xs font-display text-3xl font-bold italic text-gold">Tumhari har wish poori ho, {NAME}. Ye mera wada hai 💖</motion.p>}
      {!out && <p className="mt-3 h-5 text-sm text-pink-200">{msg}</p>}
    </Sec>
  )
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
    x.fillText('Ungli se ragdo ✨', w / 2, h / 2)
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
      <p className="sub">Is card ko ungli se ragdo, dekho neeche kya hai.</p>
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
