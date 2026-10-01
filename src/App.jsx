import { useState } from 'react'
import { assetUrl } from './assets'
import { Play } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { AppleIcon, GitHubIcon, Logo } from './Logo'
import { MacZoom } from './MacZoom'
import { FilmModal } from './FilmModal'
import { BenefitsScroll } from './BenefitsScroll'

const download = assetUrl('downloads/Think-Out-Loud.zip')
const ease = [0.22, 1, 0.36, 1]

function DownloadButton({ compact = false }) {
  return <a className={`button download ${compact ? 'compact' : ''}`} href={download} download="Think-Out-Loud.zip"><AppleIcon /><span>Download for Mac</span></a>
}

function Reveal({ children, delay = 0, className = '' }) {
  const reduced = useReducedMotion()
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, delay, ease }}>{children}</motion.div>
}

export default function App() {
  const [filmOpen, setFilmOpen] = useState(false)
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header shell">
        <a className="brand" href="#" aria-label="Think Out Loud home"><Logo /><span>Think Out Loud</span></a>
        <nav aria-label="Main navigation"><a href="#free-and-local">Why Think Out Loud</a><a className="button compact github-link" href="https://github.com/federicopoi/thinkoutloud" target="_blank" rel="noopener noreferrer"><GitHubIcon /><span>View on GitHub</span></a></nav>
      </header>

      <main id="main">
        <section className="hero shell" aria-labelledby="hero-title">
          <div className="hero-copy">
            <Reveal><p className="eyebrow">Local dictation for Mac</p></Reveal>
            <Reveal delay={0.08}><h1 id="hero-title">Your thoughts.<br /><em>Out loud.</em></h1></Reveal>
            <Reveal delay={0.16}><p className="hero-description">Speak naturally. Turn your voice into text.<br className="desktop-break" /> Free. Works offline after setup.</p></Reveal>
            <Reveal delay={0.24}>
              <div className="hero-actions"><DownloadButton /><button className="watch-film" onClick={() => setFilmOpen(true)}><Play size={17} fill="currentColor" />See how it works</button></div>
            </Reveal>
          </div>

        </section>

        <MacZoom />
        <div className="section-transition" aria-hidden="true"><div className="paper-grain" /></div>
        <BenefitsScroll />
        <section id="download-section" className="closing-section shell" aria-label="Download Think Out Loud">
          <Reveal><Logo /><h2>A voice.<br /><em>Not a subscription.</em></h2><DownloadButton /></Reveal>
        </section>
      </main>
      {filmOpen && <FilmModal onClose={() => setFilmOpen(false)} />}
    </>
  )
}
