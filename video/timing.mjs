export const fps = 30
export const durationInFrames = 720
export const scenes = { introEnd: 72, record: 90, stop: 240, copied: 276, pasted: 309, free: 390, source: 456, offline: 522, outro: 588 }
export function timelineAt(frame) {
 const state = frame < scenes.stop ? 'recording' : frame < scenes.copied ? 'transcribing' : 'copied'
 return {
  state, visible: frame >= scenes.record,
  elapsed: Math.max(0, Math.min(5, Math.floor((frame - scenes.record) / fps))),
  pasted: frame >= scenes.pasted,
  spinnerRotation: frame * 12,
  cursorOpacity: frame % 30 < 15 ? 1 : 0,
  waveScales: Array.from({length:12},(_,i)=> .3 + .7 * (Math.sin(frame * .42 + i * 1.7) + 1) / 2),
 }
}
