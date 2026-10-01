import { useEffect, useState } from 'react'
import { assetUrl } from './assets'
import { motion, useReducedMotion } from 'motion/react'
import { Check, Square, X, LoaderCircle, PanelLeft, Folder, Trash2, SquarePen, ListChecks, Table2, Paperclip, Share, Search } from 'lucide-react'
import { Logo } from './Logo'

const sentence = 'What if the fastest way to write was simply to say it?'
const bars = [4, 10, 19, 25, 13, 8, 16, 23, 12, 9, 5, 3]

export function ProductPreview({ timeline, images = {}, ImageComponent = 'img' }) {
  const reduced = useReducedMotion()
  const [run, setRun] = useState(0)
  const [phase, setPhase] = useState('recording')
  const [elapsed, setElapsed] = useState(0)
  const [visible, setVisible] = useState(true)
  const [pasted, setPasted] = useState(false)

  useEffect(() => {
    if (timeline || reduced || phase === 'copied' || !visible) return
    if (phase === 'recording') {
      const clock = setInterval(() => setElapsed(n => n + 1), 1000)
      const stop = setTimeout(() => setPhase('transcribing'), 6000)
      return () => { clearInterval(clock); clearTimeout(stop) }
    }
    const timer = setTimeout(() => setPhase('copied'), 1200)
    return () => clearTimeout(timer)
  }, [run, reduced, phase, visible, timeline])

  useEffect(() => {
    if (timeline || reduced || phase !== 'copied' || !visible) return
    const timer = setTimeout(() => setPasted(true), 1100)
    return () => clearTimeout(timer)
  }, [phase, reduced, visible, run, timeline])

  const state = timeline?.state ?? (reduced ? 'copied' : phase)
  const hasPasted = timeline?.pasted ?? (reduced || pasted)
  const shown = timeline?.visible ?? visible
  const seconds = timeline?.elapsed ?? elapsed
  const Cue = timeline ? 'div' : motion.div
  const replay = () => { setElapsed(0); setPasted(false); setVisible(true); setPhase('recording'); setRun(n => n + 1) }

  return <div className="laptop-demo" aria-label="Animated preview: record, transcribe, copy, then paste into Notes with Command V. No microphone or clipboard access.">
    <div className="macbook photo-macbook">
      <ImageComponent className="macbook-photo" src={images.macbook ?? assetUrl('images/macbook-photo.png')} width="1536" height="1024" alt="Silver MacBook displaying a Yosemite desktop and Think Out Loud's small dictation bar" fetchPriority="high" />
      <div className="macbook-screen photo-screen">
        <ImageComponent className="desktop-wallpaper" src={images.wallpaper ?? assetUrl('images/el-capitan-wallpaper.png')} width="1536" height="1024" alt="" />
        {!reduced && !timeline && <button className="photo-replay" onClick={replay} aria-label="Replay dictation preview" />}
        <div className="demo-notes" aria-label="Notes document in the demonstration">
          <div className="apple-notes-toolbar" aria-hidden="true">
            <div className="apple-window-controls"><div className="apple-traffic-lights"><i /><i /><i /></div><PanelLeft /></div>
            <div className="apple-note-list-tools"><div><strong>Notes</strong><span>2 notes</span></div><Trash2 /><SquarePen /></div>
            <div className="apple-editor-tools"><span>Aa</span><ListChecks /><Table2 /><Paperclip /><span className="apple-toolbar-space" /><Share /><Search /></div>
          </div>
          <div className="apple-notes-body">
            <aside className="apple-folders" aria-hidden="true"><p>On My Mac</p><div><Folder /><span>Notes</span><span>2</span></div></aside>
            <div className="apple-note-list" aria-hidden="true"><div className="apple-selected-note"><strong>A thought, captured.</strong><p><span>9:41 AM</span> {hasPasted ? 'What if the fastest way…' : 'No additional text'}</p></div><div className="apple-other-note"><strong>Weekend ideas</strong><p><span>Yesterday</span> A fresh start.</p></div></div>
            <div className="demo-note-paper"><div className="apple-note-date">October 1, 2026 at 9:41 AM</div><h3>A thought, captured.</h3><p className="demo-note-text">{hasPasted ? sentence : ''}</p>{!hasPasted && (!reduced || timeline) && <span className="demo-note-caret" aria-hidden="true" style={timeline ? { animation: 'none', opacity: timeline.cursorOpacity } : undefined} />}</div>
          </div>
          {state === 'copied' && !hasPasted && (!reduced || timeline) && <Cue className="demo-paste-key" {...(timeline ? {} : { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 } })}><kbd>⌘ V</kbd></Cue>}
        </div>
        {shown && <div className={`native-dictation-bar state-${state}`}>
          {state === 'recording' ? <>
            <Logo className="native-bar-logo" />
            <span className="native-timer">00:{String(seconds).padStart(2, '0')}</span>
            <div className="native-waveform" aria-hidden="true">{bars.map((h, i) => timeline ? <i key={i} style={{ height: `${h / 5}cqw`, transform: `scaleY(${timeline.waveScales[i]})` }} /> : <motion.i key={i} style={{ height: `${h / 5}cqw` }} animate={{ scaleY: [.4, 1, .6, .4] }} transition={{ duration: .55 + i * .045, repeat: Infinity, delay: i * .07 }} />)}</div>
            <button className="native-stop" onClick={() => setPhase('transcribing')} aria-label="Stop dictation preview"><Square fill="currentColor" /></button>
          </> : state === 'transcribing' ? <><LoaderCircle className="native-spinner" style={timeline ? { animation: 'none', transform: `rotate(${timeline.spinnerRotation}deg)` } : undefined} /><span className="native-result">Transcribing…</span></> : <><Check className="native-check" /><span className="native-result">Copied</span></>}
          <button className="native-dismiss" onClick={() => setVisible(false)} aria-label={state === 'recording' ? 'Cancel dictation preview' : 'Dismiss dictation preview'}><X /></button>
        </div>}
      </div>
    </div>
  </div>
}
