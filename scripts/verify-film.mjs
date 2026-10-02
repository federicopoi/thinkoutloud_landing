import { chromium, webkit } from '@playwright/test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-of','json','public/videos/think-out-loud-film.mp4'],{encoding:'utf8'}))
const filmDuration=+JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','json','public/videos/think-out-loud-film.mp4'],{encoding:'utf8'})).format.duration
const audio=probe.streams.find(s=>s.codec_type==='audio')
assert.ok(audio, 'Film must contain music')
assert.equal(audio.channels,2)
assert.equal(audio.codec_name,'aac')
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]) {
 const browser=await engine.launch()
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}})
  const errors=[]
  page.on('pageerror',e=>errors.push(e.message))
  await page.goto('http://127.0.0.1:5174',{waitUntil:'networkidle'})
  await page.getByRole('button',{name:'See how it works'}).click()
  await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2)
  const metadata=await page.locator('video').evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight}))
  assert.ok(Math.abs(metadata.duration-filmDuration)<.05, 'AAC padding must stay below 50ms')
  assert.equal(metadata.width,1920)
  assert.equal(metadata.height,1080)
  await page.waitForFunction(()=>document.querySelector('video').currentTime>.1)
  assert.equal(await page.locator('video').evaluate(v=>v.muted),false)
  await page.locator('video').evaluate(v=>{v.pause();v.currentTime=7})
  await page.waitForTimeout(400)
  await page.screenshot({path:`artifacts/${name}-film-player.png`})
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('dialog').count(),0)
  assert.equal(await page.evaluate(()=>document.documentElement.style.overflow),'')
  await page.setViewportSize({width:390,height:844})
  await page.getByRole('button',{name:'See how it works'}).click()
  await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2)
  const box=await page.locator('dialog').boundingBox()
  assert.ok(box.x>=0 && box.x+box.width<=390)
  await page.getByRole('button',{name:'Close film'}).click()
  assert.equal(await page.locator('video').count(),0)
  assert.deepEqual(errors,[])
  console.log(`${name}: H.264 playback, 1080p metadata, Escape, close and mobile player passed`)
 }finally{await browser.close()}
}
