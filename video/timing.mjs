export const fps = 30
export const durationInFrames = 540
export function timelineAt(frame) {
 const state = frame < 300 ? 'recording' : frame < 342 ? 'transcribing' : 'copied'
 return {
  state, visible: frame >= 150,
  elapsed: Math.max(0, Math.min(5, Math.floor((frame - 150) / fps))),
  pasted: frame >= 375,
  spinnerRotation: frame * 12,
  cursorOpacity: frame % 30 < 15 ? 1 : 0,
  waveScales: Array.from({length:12},(_,i)=> .3 + .7 * (Math.sin(frame * .42 + i * 1.7) + 1) / 2),
 }
}
