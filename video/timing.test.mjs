import test from 'node:test'
import assert from 'node:assert/strict'
import { timelineAt, durationInFrames, fps, scenes } from './timing.mjs'
test('film demonstrates recording, transcription, copy then a complete paste',()=>{
 assert.equal(durationInFrames / fps,24)
 assert.equal(timelineAt(scenes.record).state,'recording')
 assert.equal(timelineAt(scenes.stop+15).state,'transcribing')
 assert.equal(timelineAt(scenes.copied+10).state,'copied')
 assert.equal(timelineAt(scenes.copied+10).pasted,false)
 assert.equal(timelineAt(scenes.pasted+5).pasted,true)
 assert.equal(timelineAt(scenes.record).elapsed,0)
 assert.equal(timelineAt(scenes.record+90).elapsed,3)
})
test('re-rendering the same frame produces exactly the same waveform',()=>{
 assert.deepEqual(timelineAt(200),timelineAt(200))
 assert.equal(timelineAt(200).waveScales.length,12)
 assert.notDeepEqual(timelineAt(200).waveScales,timelineAt(210).waveScales)
})
