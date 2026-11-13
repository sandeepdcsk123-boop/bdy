import { useEffect, useRef } from 'react'
export const party = (n = 180) => { navigator.vibrate?.([25, 30, 25]); window.dispatchEvent(new CustomEvent('party', { detail: n })) }

export default function FX() {
  const ref = useRef()
  useEffect(() => {
    const c = ref.current, x = c.getContext('2d')
    let W, H, bits = [], raf
    const fit = () => { W = c.width = innerWidth; H = c.height = innerHeight }
    fit(); addEventListener('resize', fit)
    const hearts = Array.from({ length: 0 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: 10 + Math.random() * 16, v: .25 + Math.random() * .6, o: .1 + Math.random() * .22 }))
    const cols = ['#ff5e8a', '#f6c978', '#ffffff', '#ff8a5e', '#c084fc']
    const burst = e => { for (let i = 0; i < (e.detail || 180); i++) bits.push({ x: W / 2, y: H * .65, vx: (Math.random() - .5) * 18, vy: -9 - Math.random() * 13, w: 6 + Math.random() * 7, c: cols[i % 5], r: Math.random() * 6, l: 140 }) }
    addEventListener('party', burst)
    const loop = () => {
      x.clearRect(0, 0, W, H)
      hearts.forEach(h => { x.globalAlpha = h.o; x.font = h.s + 'px serif'; x.fillText('❤', h.x, h.y); h.y -= h.v; h.x += Math.sin(h.y / 40) * .4; if (h.y < -30) { h.y = H + 20; h.x = Math.random() * W } })
      x.globalAlpha = 1
      bits = bits.filter(b => b.l > 0)
      bits.forEach(b => { b.x += b.vx; b.y += b.vy; b.vy += .35; b.vx *= .99; b.r += .2; b.l--; x.save(); x.translate(b.x, b.y); x.rotate(b.r); x.fillStyle = b.c; x.fillRect(-b.w / 2, -b.w / 4, b.w, b.w / 2); x.restore() })
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', fit); removeEventListener('party', burst) }
  }, [])
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[60]" />
}
