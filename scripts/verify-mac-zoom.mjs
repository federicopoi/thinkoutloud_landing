import { chromium, webkit } from '@playwright/test'
import assert from 'node:assert/strict'
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch()
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}})
  await page.goto('http://127.0.0.1:5174',{waitUntil:'networkidle'})
  assert.equal(await page.locator('.mac-zoom-stage').count(),1,'centered Mac zoom stage exists')
  assert.equal(await page.locator('.pin-spacer:has(> .mac-zoom)').count(),1,'one Mac pin after StrictMode')
  const start=await page.locator('.pin-spacer:has(> .mac-zoom)').evaluate(e=>e.getBoundingClientRect().top+scrollY)
  const scale=()=>page.locator('.mac-zoom-product').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a)
  await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),start)
  await page.waitForTimeout(1300)
  const initial=await scale()
  await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),start+900)
  await page.waitForTimeout(1300)
  assert.ok(await scale()>initial+.15,'Mac zooms with scroll')
  assert.ok(Math.abs(await page.locator('.mac-zoom').evaluate(e=>e.getBoundingClientRect().top))<2,'Mac centered while pinned')
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
  await page.screenshot({path:`artifacts/${name}-mac-zoom.png`})
  await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),start)
  await page.waitForTimeout(1300)
  assert.ok(Math.abs(await scale()-initial)<.01,'zoom reverses')
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.waitForTimeout(500)
  assert.equal(await page.locator('.pin-spacer').count(),0,'reduced motion has no pins')
  await page.emulateMedia({reducedMotion:'no-preference'})
  await page.setViewportSize({width:390,height:844})
  await page.waitForTimeout(500)
  assert.equal(await page.locator('.pin-spacer').count(),1,'mobile retains benefits pin without a Mac spacer')
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
  console.log(`${name}: zoom, centering, reversal, responsive and reduced motion passed`)
 }finally{await browser.close()}
}
