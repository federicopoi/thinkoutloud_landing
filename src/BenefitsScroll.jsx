import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(ScrollTrigger)

const tracks = [
  [[10, 50, -10, 10], [20, -10, -45, 20]],
  [[0, 47.5, -10, 15], [-25, 15, -45, 30]],
  [[0, 52.5, -10, 5], [15, -5, -40, 60]],
  [[0, 50, 30, -80], [20, -10, 60, 5]],
  [[0, 55, -15, 30], [25, -15, 60, 95]],
]
const benefits = [
  ['free', 'Free.', 'No subscription. No per-minute charges. Your ideas don’t need a payment plan.'],
  ['source', 'Open source.', 'Powered by Whisper and whisper.cpp. Open-source speech recognition, right on your Mac.'],
  ['offline', 'Offline.', 'Download the engine and model once. Then dictate anywhere, even without an internet connection.'],
  ['private', 'Private.', 'Recording and transcription happen on your computer. Your voice never needs a trip to the cloud.'],
  ['shortcut', 'One shortcut.', 'Shift + Space to speak. Space to stop. Your words are copied and ready for ⌘V.'],
]

export function BenefitsScroll() {
  const root = useRef(null)
  useEffect(() => {
    const section = root.current
    const header = section.querySelector('.sticky-header')
    const cards = [...section.querySelectorAll('.card')]
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const lenis = new Lenis({ anchors: true })
      const tick = time => lenis.raf(time * 1000)
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
      section.classList.add('is-pinned')
      const render = progress => {
        gsap.set(header, { x: -progress * (header.offsetWidth - window.innerWidth) })
        section.style.setProperty('--scroll-progress', progress)
        cards.forEach((card, index) => {
          const p = Math.max(0, Math.min((progress - index * .1125) * 2, 1))
          const segment = Math.min(Math.floor(p * 3), 2)
          const fraction = p * 3 - segment
          const [heights, angles] = tracks[index]
          // Scale the crossing to the viewport so phone cards do not rush past.
          // Two card widths of overshoot keep even the rotated cards offscreen.
          const end = -(window.innerWidth + card.offsetWidth * 2) / card.offsetWidth * 100
          gsap.set(card, {
            xPercent: gsap.utils.interpolate(25, end, p),
            yPercent: gsap.utils.interpolate(heights[segment], heights[segment + 1], fraction),
            rotation: gsap.utils.interpolate(angles[segment], angles[segment + 1], fraction),
            opacity: p > 0 ? 1 : 0,
          })
        })
      }
      const trigger = ScrollTrigger.create({
        trigger: section, start: 'top top', end: () => `+=${window.innerHeight * 5}`,
        pin: true, pinSpacing: true, invalidateOnRefresh: true,
        onUpdate: self => render(self.progress), onRefresh: self => render(self.progress),
      })
      render(trigger.progress)
      document.fonts.ready.then(() => { if (root.current === section && section.classList.contains('is-pinned')) ScrollTrigger.refresh() })
      return () => {
        trigger.kill(true)
        gsap.ticker.remove(tick)
        lenis.off('scroll', ScrollTrigger.update)
        lenis.destroy()
        gsap.set([header, ...cards], { clearProps: 'transform,opacity' })
        section.classList.remove('is-pinned')
        section.style.removeProperty('--scroll-progress')
      }
    }, root)
    return () => media.revert()
  }, [])

  return <section ref={root} id="free-and-local" className="sticky freedom-section" aria-labelledby="freedom-title">
    <div className="paper-grain" aria-hidden="true" />
    <div className="sticky-header"><h2 id="freedom-title">Speak freely. <em>Even offline.</em></h2></div>
    <div className="benefit-deck">
      {benefits.map(([key, title, description]) => <article className="card" key={key}>
        <h3 className="benefit-title">{title}</h3>
        <div className="benefit-detail"><p>{description}</p>{key === 'source' && <a href="https://github.com/ggml-org/whisper.cpp" target="_blank" rel="noreferrer">Explore the engine ↗</a>}</div>
      </article>)}
    </div>
    <div className="benefit-progress" aria-hidden="true"><span /></div>
  </section>
}
