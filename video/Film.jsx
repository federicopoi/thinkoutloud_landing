import React, { useEffect, useState } from 'react'
import { AbsoluteFill, Html5Audio, Img, interpolate, spring, useCurrentFrame, staticFile, delayRender, continueRender, cancelRender } from 'remotion'
import { Logo } from '../src/Logo'
import { ProductPreview } from '../src/ProductPreview'
import { timelineAt, fps } from './timing.mjs'
import '@fontsource-variable/dm-sans'
import '../src/styles.css'
import './film.css'

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
const range = (frame, input, output) => interpolate(frame, input, output, clamp)
const lift = (frame, start) => spring({ frame: frame-start, fps, config: { damping: 22, stiffness: 90, mass: .9 } })

export function Film() {
 const f=useCurrentFrame()
 const [fontHandle] = useState(()=>delayRender('Local font'))
 useEffect(()=>{document.fonts.ready.then(()=>continueRender(fontHandle)).catch(cancelRender)},[fontHandle])
 const title1=lift(f,8), title2=lift(f,25)
 const introOpacity=range(f,[76,100],[1,0])
 const macOpacity=range(f,[82,112,411,439],[0,1,1,0])
 const camera=range(f,[95,170,260,393,427],[.86,1,1.22,1.22,1.05])
 const cameraY=range(f,[95,170,260,393,427],[70,0,-16,-16,0])
 const outroOpacity=range(f,[420,448],[0,1])
 const endHeadline=lift(f,435), endBrand=lift(f,475)
 return <AbsoluteFill className="film">
  <Html5Audio src={staticFile('audio/soft-minimal-film.wav')} />
  <AbsoluteFill className="film-intro" style={{opacity:introOpacity}}>
   <div className="film-word-mask"><div style={{transform:`translateY(${(1-title1)*110}%)`}}>Your thoughts.</div></div>
   <div className="film-word-mask film-italic"><div style={{transform:`translateY(${(1-title2)*110}%)`}}>Out loud.</div></div>
   <div className="film-opening-logo" style={{opacity:range(f,[35,60],[0,1])}}><Logo /><span>Think Out Loud</span></div>
  </AbsoluteFill>
  {f>=80 && f<440 && <AbsoluteFill style={{opacity:macOpacity,overflow:'hidden'}}>
   <div className="film-mac" style={{transform:`translateY(${cameraY}px) scale(${camera})`}}>
    <ProductPreview timeline={timelineAt(f)} ImageComponent={Img} images={{macbook:staticFile('images/macbook-photo.png'),wallpaper:staticFile('images/el-capitan-wallpaper.png')}} />
   </div>
   {f>125 && f<174 && <div className="film-shortcut" style={{opacity:range(f,[126,137,160,173],[0,1,1,0])}}><kbd>⇧</kbd><kbd>Space</kbd></div>}
  </AbsoluteFill>}
  <AbsoluteFill className="film-outro" style={{opacity:outroOpacity}}>
   <div className="film-end-headline" style={{opacity:endHeadline,transform:`translateY(${(1-endHeadline)*35}px)`}}>Free. <em>Works offline.</em></div>
   <div className="film-end-note" style={{opacity:range(f,[450,470],[0,1])}}>After the initial model setup.</div>
   <div className="film-end-brand" style={{opacity:endBrand,transform:`translateY(${(1-endBrand)*25}px)`}}><Logo /><span>Think Out Loud</span></div>
  </AbsoluteFill>
 </AbsoluteFill>
}
