import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Poore page ke peeche 3D hearts, phone tilt / touch / scroll ke saath hilte hain
export default function Bg3D() {
  const ref = useRef()
  useEffect(() => {
    const el = ref.current
    const r = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.setSize(innerWidth, innerHeight); el.appendChild(r.domElement)
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, .1, 100); cam.position.z = 12
    sc.add(new THREE.AmbientLight(0xffffff, .9))
    const L = new THREE.PointLight(0xffd6e0, 120, 60); L.position.set(4, 6, 10); sc.add(L)
    const s = new THREE.Shape()
    s.moveTo(0, -1); s.bezierCurveTo(-.2, -.7, -1.2, -.2, -1.2, .5); s.bezierCurveTo(-1.2, 1.2, -.3, 1.4, 0, .8)
    s.bezierCurveTo(.3, 1.4, 1.2, 1.2, 1.2, .5); s.bezierCurveTo(1.2, -.2, .2, -.7, 0, -1)
    const geo = new THREE.ExtrudeGeometry(s, { depth: .45, bevelEnabled: true, bevelSize: .12, bevelThickness: .15, bevelSegments: 3, curveSegments: 12 }); geo.center()
    const cols = [0xff5e8a, 0xff8fb1, 0xf6c978, 0xffffff, 0xc084fc]
    const g = new THREE.Group(); sc.add(g)
    const hw = 6.9 * innerWidth / innerHeight + 1
    const hs = Array.from({ length: 34 }, (_, i) => {
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: cols[i % 5], metalness: .35, roughness: .3, emissive: cols[i % 5], emissiveIntensity: .12 }))
      m.scale.setScalar(.18 + Math.random() * .4)
      m.position.set((Math.random() - .5) * 2 * hw, (Math.random() - .5) * 32, -4 + Math.random() * 8)
      m.userData = { v: .004 + Math.random() * .012, rs: .004 + Math.random() * .014, ph: Math.random() * 6 }
      g.add(m); return m
    })
    let mx = 0, my = 0, raf
    const onMove = e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5 }
    const onTilt = e => { if (e.gamma != null) { mx = Math.max(-1, Math.min(1, e.gamma / 30)) * .5; my = Math.max(-1, Math.min(1, (e.beta - 45) / 30)) * .5 } }
    const onSize = () => { r.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix() }
    addEventListener('pointermove', onMove); addEventListener('deviceorientation', onTilt); addEventListener('resize', onSize)
    const loop = t => {
      hs.forEach(m => {
        const u = m.userData
        m.rotation.y += u.rs; m.rotation.x = Math.sin(t / 1500 + u.ph) * .3
        m.position.y += u.v * 10; if (m.position.y > 16) m.position.y = -16
      })
      cam.position.x += (mx * 3 - cam.position.x) * .05; cam.position.y += (-my * 3 - cam.position.y) * .05; cam.lookAt(0, 0, 0)
      g.rotation.y = scrollY * .0006
      r.render(sc, cam); raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf); removeEventListener('pointermove', onMove); removeEventListener('deviceorientation', onTilt); removeEventListener('resize', onSize)
      geo.dispose(); r.dispose(); r.domElement.remove()
    }
  }, [])
  return <div ref={ref} className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,#5a1f52,#2a0f2e_65%)]" />
}
