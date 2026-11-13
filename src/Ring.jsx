import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { PHOTOS } from './data'

// 3D photo ring: ungli se ghumao, chhodo to apne aap ghoomta rehta hai (GSAP)
export default function Ring({ Sec }) {
  const wrap = useRef(), el = useRef(), n = PHOTOS.length, [cur, setCur] = useState(0)
  const W = 190, H = 270, R = Math.max(240, Math.round(W / 2 / Math.tan(Math.PI / Math.max(n, 3))) + 24)
  useEffect(() => {
    if (!n) return
    const s = { a: 0, v: 0, d: false, x: 0, last: 0 }, w = wrap.current, node = el.current
    const tick = () => {
      if (!s.d) { s.v += (.25 - s.v) * .04; s.a += s.v }
      gsap.set(node, { rotationY: s.a })
      const i = ((Math.round(-s.a / (360 / n)) % n) + n) % n
      if (i !== s.last) { s.last = i; setCur(i) }
    }
    gsap.ticker.add(tick)
    const dn = e => { s.d = true; s.x = e.clientX; w.setPointerCapture?.(e.pointerId) }
    const mv = e => { if (!s.d) return; const dx = e.clientX - s.x; s.x = e.clientX; s.a += dx * .45; s.v = dx * .45 }
    const up = () => { s.d = false }
    w.addEventListener('pointerdown', dn); w.addEventListener('pointermove', mv); w.addEventListener('pointerup', up); w.addEventListener('pointercancel', up)
    return () => { gsap.ticker.remove(tick); w.removeEventListener('pointerdown', dn); w.removeEventListener('pointermove', mv); w.removeEventListener('pointerup', up); w.removeEventListener('pointercancel', up) }
  }, [n])
  if (!n) return null
  return (
    <Sec>
      <h3 className="h3">Hamari yaadein 📸</h3>
      <p className="sub">Photos ko ungli se ghumao ✨</p>
      <div ref={wrap} style={{ perspective: 1000, touchAction: 'pan-y' }} className="flex h-[340px] w-full items-center justify-center">
        <div style={{ transformStyle: 'preserve-3d', transform: `translateZ(${-R}px)` }}>
          <div ref={el} style={{ transformStyle: 'preserve-3d', width: W, height: H }} className="relative">
            {PHOTOS.map((p, i) => (
              <div key={i} style={{ width: W, height: H, transform: `rotateY(${i * 360 / n}deg) translateZ(${R}px)`, backfaceVisibility: 'hidden' }}
                className="absolute inset-0 overflow-hidden rounded-2xl border border-gold/60 shadow-[0_20px_50px_rgba(0,0,0,.5)]">
                <img src={p.src} alt="" draggable={false} className="h-full w-full select-none object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-6 h-10 font-display text-3xl italic text-gold">{PHOTOS[cur]?.cap}</p>
    </Sec>
  )
}
