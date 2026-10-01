import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
const browser = await chromium.launch()
try {
 const page = await browser.newPage({viewport:{width:1440,height:1100}})
 await page.goto('http://127.0.0.1:5174',{waitUntil:'networkidle'})
 assert.equal(await page.locator('.macbook-photo').count(),1,'generated MacBook photograph exists')
 assert.equal(await page.locator('.desktop-wallpaper').count(),1,'generated landscape exists')
 assert.equal(await page.locator('.notes-sidebar,.note-main,.mac-menu,.mac-dock,.copied-chip').count(),0,'only real transcription bar')
 const copy = await page.locator('.hero-copy').boundingBox()
 const laptop = await page.locator('.macbook').boundingBox()
 assert.ok(laptop.y > copy.y + copy.height,'laptop below centered copy')
 assert.ok(Math.abs(copy.x + copy.width/2 - 720) < 2,'copy centered')
 assert.equal(await page.locator('.benefit-topline,.benefit-bottomline,.card-index,.download-note,.shortcut').count(),0,'remove small extras')
 await page.getByRole('button',{name:'Replay dictation preview'}).click()
 await page.getByRole('button',{name:'Stop dictation preview'}).waitFor()
 assert.equal(await page.locator('.demo-note-text').count(),1,'notes document exists')
 assert.equal(await page.locator('.demo-note-text').textContent(),'','note blank while recording')

 await page.getByRole('button',{name:'Stop dictation preview'}).click()
 await page.getByText('Transcribing…',{exact:true}).waitFor()
 await page.getByText('Copied',{exact:true}).waitFor()
 await page.waitForFunction(()=>document.querySelector('.demo-note-text')?.textContent === 'What if the fastest way to write was simply to say it?')
 await page.locator('.photo-macbook').screenshot({path:'artifacts/macbook-notes-pasted.png'})
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}))
 await page.waitForTimeout(300)
 await page.screenshot({path:'artifacts/centered-macbook-hero.png',fullPage:false})
 for (const width of [320,390,768]) {
  await page.setViewportSize({width,height:844})
  await page.waitForTimeout(500)
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),true)
 }
 console.log('Centered laptop hero, recording/transcription sequence and mobile layout passed')
} finally {await browser.close()}
