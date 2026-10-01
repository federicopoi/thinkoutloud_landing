import { useEffect, useRef } from 'react'
import { assetUrl } from './assets'
import { X } from 'lucide-react'

export function FilmModal({ onClose }) {
 const dialog = useRef(null)
 const video = useRef(null)
 useEffect(() => {
  const element = dialog.current
  const previous = document.documentElement.style.overflow
  document.documentElement.style.overflow = 'hidden'
  element.showModal()
  video.current.play().catch(() => {})
  return () => {
   video.current?.pause()
   if(element.open) element.close()
   document.documentElement.style.overflow = previous
  }
 }, [])
 return <dialog className="film-dialog" ref={dialog} data-lenis-prevent aria-label="Think Out Loud product film" onCancel={event => { event.preventDefault(); onClose() }} onClick={event => { if(event.target === dialog.current) onClose() }}>
  <button className="film-close" onClick={onClose} aria-label="Close film"><X size={24} /></button>
  <video ref={video} controls playsInline preload="metadata" poster={assetUrl('videos/think-out-loud-poster.png')} aria-label="18-second film showing recording, local transcription and pasting into Notes"><source src={assetUrl('videos/think-out-loud-film.mp4?v=soft-minimal-1')} type="video/mp4" />Your browser cannot play this video. <a href={assetUrl('videos/think-out-loud-film.mp4')}>Download the film</a>.</video>
 </dialog>
}
