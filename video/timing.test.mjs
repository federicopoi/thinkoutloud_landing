import test from 'node:test'
import assert from 'node:assert/strict'
import { timelineAt, durationInFrames, fps } from './timing.mjs'
test('film demonstrates recording, transcription, copy then a complete paste',()=>{
 assert.equal(durationInFrames / fps,18)
 assert.equal(timelineAt(150).state,'recording')
 assert.equal(timelineAt(315).state,'transcribing')
 assert.equal(timelineAt(360).state,'copied')
 assert.equal(timelineAt(360).pasted,false)
 assert.equal(timelineAt(390).pasted,true)
 assert.equal(timelineAt(150).elapsed,0)
 assert.equal(timelineAt(240).elapsed,3)
})
test('re-rendering the same frame produces exactly the same waveform',()=>{
 assert.deepEqual(timelineAt(200),timelineAt(200))
 assert.equal(timelineAt(200).waveScales.length,12)
 assert.notDeepEqual(timelineAt(200).waveScales,timelineAt(210).waveScales)
})
