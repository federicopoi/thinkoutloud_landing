import React from 'react'
import { registerRoot, Composition } from 'remotion'
import { Film } from './Film'
import { durationInFrames, fps } from './timing.mjs'
function Root(){return <Composition id="ThinkOutLoud" component={Film} durationInFrames={durationInFrames} fps={fps} width={1920} height={1080} />}
registerRoot(Root)
