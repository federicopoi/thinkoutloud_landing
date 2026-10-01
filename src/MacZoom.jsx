import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ProductPreview } from './ProductPreview'

gsap.registerPlugin(ScrollTrigger)

export function MacZoom() {
  const root = useRef(null)
  useLayoutEffect(() => {
    const section = root.current
    const product = section.querySelector('.mac-zoom-product')
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      section.classList.add('is-zooming')
      const animation = gsap.timeline({
        scrollTrigger: {
          trigger: section, start: 'top top', end: () => `+=${window.innerWidth <= 900 ? section.clientHeight * .9 : window.innerHeight * 1.2}`,
          pin: true, pinSpacing: true, scrub: .65, invalidateOnRefresh: true,
        },
      })
      animation.fromTo(product, { scale: 1, y: 0 }, { scale: 1.3, duration: .75, ease: 'none' })
        .to(product, { scale: 1.06, y: -10, duration: .25, ease: 'sine.inOut' })
      return () => {
        animation.scrollTrigger?.kill(true)
        animation.kill()
        gsap.set(product, { clearProps: 'transform' })
        section.classList.remove('is-zooming')
      }
    }, root)
    return () => media.revert()
  }, [])

  return <section className="mac-zoom" ref={root} aria-label="See Think Out Loud on a Mac">
    <div className="mac-zoom-stage"><div className="mac-zoom-product"><ProductPreview /></div></div>
  </section>
}
