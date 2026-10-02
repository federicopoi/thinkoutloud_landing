import React, { useEffect, useState } from 'react'
import { AbsoluteFill, Html5Audio, Img, interpolate, spring, useCurrentFrame, staticFile, delayRender, continueRender, cancelRender } from 'remotion'
import { Logo, AppleIcon } from '../src/Logo'
import { ProductPreview } from '../src/ProductPreview'
import { timelineAt, fps, scenes } from './timing.mjs'
import '@fontsource-variable/dm-sans'
import '../src/styles.css'
import './film.css'

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
const range = (frame, input, output) => interpolate(frame, input, output, clamp)
const lift = (frame, start) => spring({ frame: Math.max(0, frame-start), fps, config: { damping: 24, stiffness: 105, mass: .9 } })

function AnimatedLogo({ frame, start = 0, className = '' }) {
 const assembled = lift(frame, start)
 const speaking = range(frame,[start+8,start+22,start+40,start+60],[0,1,1,0])
 return <div className={`film-symbol ${className}`} style={{
  opacity: range(frame,[start,start+10],[0,1]),
  transform:`translateY(${(1-assembled)*25}px) scale(${.9+assembled*.1})`,
  '--bar-one': .7 + .3*assembled + Math.sin((frame-start)*.38)*.1*speaking,
  '--bar-two': .7 + .3*assembled + Math.sin((frame-start)*.38+1.4)*.1*speaking,
  '--mic': assembled,
  '--caps': range(frame,[start+8,start+24],[0,1]),
  '--cursor': lift(frame,start+12),
 }}><Logo /></div>
}

function Letters({ text, frame, start, className = '', leave = 0 }) {
 return <div className={`film-letter-line ${className}`} aria-label={text}>
  {[...text].map((letter,i)=>{
   const enter=lift(frame,start+i*1.25)
   return <span key={i} className="film-letter-mask"><span style={{
    opacity: range(frame,[start+i*1.25,start+i*1.25+10],[0,1])*(1-leave),
    transform:`translateY(${(1-enter)*110-leave*35}%) rotateX(${(1-enter)*35}deg)`,
    filter:`blur(${(1-enter)*5}px)`,
   }}>{letter===' ' ? '\u00a0' : letter}</span></span>
  })}
 </div>
}

export function Film() {
 const f=useCurrentFrame()
 const [fontHandle] = useState(()=>delayRender('Local font'))
 useEffect(()=>{document.fonts.ready.then(()=>continueRender(fontHandle)).catch(cancelRender)},[fontHandle])
 const introOpacity=range(f,[66,96],[1,0])
 const macOpacity=range(f,[75,106,367,405],[0,1,1,0])
 const camera=range(f,[75,150,225,360],[.82,1,1.2,1.2])
 const cameraY=range(f,[75,150,225,360],[60,0,-16,-16])
 const benefits=[
  {start:scenes.free,end:scenes.source,text:'Free.',dark:false},
  {start:scenes.source,end:scenes.offline,text:'Open source.',dark:true},
  {start:scenes.offline,end:scenes.outro,text:'Offline.',dark:false},
 ]
 return <AbsoluteFill className="film">
  <Html5Audio src={staticFile('audio/soft-minimal-film-v2.wav')} volume={.32} />
  <Html5Audio src={staticFile('audio/film-voice-v2.wav')} />
  <AbsoluteFill className="film-intro" style={{opacity:introOpacity,pointerEvents:'none'}}>
   <AnimatedLogo frame={f} start={0} className="film-opening-symbol" />
   <Letters text="Your thoughts." frame={f} start={3} />
   <Letters text="Out loud." frame={f} start={14} className="film-italic" />
  </AbsoluteFill>
  {f>=75 && f<405 && <AbsoluteFill style={{opacity:macOpacity,overflow:'hidden'}}>
   <div className="film-mac" style={{transform:`translateY(${cameraY}px) scale(${camera})`}}>
    <ProductPreview timeline={timelineAt(f)} ImageComponent={Img} images={{macbook:staticFile('images/macbook-photo.png'),wallpaper:staticFile('images/el-capitan-wallpaper.png')}} />
   </div>
   {f>78 && f<122 && <div className="film-shortcut" style={{opacity:range(f,[79,89,109,121],[0,1,1,0]),transform:`translateY(${(1-lift(f,79))*15}px)`}}><kbd>⇧</kbd><kbd>Space</kbd></div>}
  </AbsoluteFill>}
  {benefits.map(({start,end,text,dark})=>{
   if(f<start || f>=end+18)return null
   const reveal=range(f,[start,start+18],[100,0])
   const leave=range(f,[end-12,end+8],[0,1])
   return <AbsoluteFill key={text} className={`film-benefit ${dark?'is-dark':''}`} style={{clipPath:`inset(${reveal}% 0 0 0)`}}>
    <Letters text={text} frame={f} start={start+5} leave={leave} />
    {text==='Offline.' && <div className="film-offline-note" style={{opacity:range(f,[start+24,start+40],[0,1])*(1-leave)}}>After setup. On your Mac.</div>}
   </AbsoluteFill>
  })}
  {f>=scenes.outro && <AbsoluteFill className="film-outro" style={{clipPath:`inset(${range(f,[scenes.outro,scenes.outro+22],[100,0])}% 0 0 0)`}}>
   <AnimatedLogo frame={f} start={scenes.outro+8} className="film-end-symbol" />
   <Letters text="Think Out Loud" frame={f} start={scenes.outro+18} className="film-brand-type" />
   <div className="film-cta" style={{opacity:range(f,[scenes.outro+48,scenes.outro+68],[0,1]),transform:`translateY(${(1-lift(f,scenes.outro+48))*20}px)`}}><AppleIcon /><span>Download for Mac.</span><span className="film-cta-arrow">↗</span></div>
  </AbsoluteFill>}
 </AbsoluteFill>
}
