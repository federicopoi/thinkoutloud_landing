import { chromium, webkit } from '@playwright/test'
import assert from 'node:assert/strict'
const base = 'http://127.0.0.1:5174'
for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    await page.goto(base, { waitUntil: 'networkidle' })
    assert.equal(await page.locator('.sticky .card').count(), 5, 'five benefit cards')
    assert.equal(await page.locator('.pin-spacer:has(> .sticky)').count(), 1, 'StrictMode leaves exactly one pin')
    const start = await page.locator('.pin-spacer:has(> .sticky)').evaluate(e => e.getBoundingClientRect().top + scrollY)
    const jump = async progress => {
      await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), start + 4500 * progress)
      await page.waitForTimeout(300)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    }
    await jump(.22)
    assert.ok(Math.abs(await page.locator('.sticky').evaluate(e => e.getBoundingClientRect().top)) < 2, 'section pinned')
    const first = await page.locator('.card').first().boundingBox()
    assert.ok(first.x < 1440 && first.x + first.width > 0, 'card crosses viewport')
    const forward = await page.locator('.sticky-header').evaluate(e => getComputedStyle(e).transform)
    await page.screenshot({ path: `artifacts/${name}-scroll-22.png` })
    await jump(.60)
    assert.notEqual(await page.locator('.sticky-header').evaluate(e => getComputedStyle(e).transform), forward)
    await page.screenshot({ path: `artifacts/${name}-scroll-60.png` })
    await jump(.22)
    assert.equal(await page.locator('.sticky-header').evaluate(e => getComputedStyle(e).transform), forward, 'scroll reverses exactly')
    await jump(1)
    for (const box of await page.locator('.card').evaluateAll(nodes => nodes.map(e => e.getBoundingClientRect().right))) assert.ok(box < 0, 'cards exit left')
    await page.setViewportSize({ width: 2200, height: 1000 })
    await page.waitForTimeout(500)
    const wideStart = await page.locator('.pin-spacer:has(> .sticky)').evaluate(e => e.getBoundingClientRect().top + scrollY)
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), wideStart + 5000)
    await page.waitForTimeout(300)
    for (const right of await page.locator('.card').evaluateAll(nodes => nodes.map(e => e.getBoundingClientRect().right))) assert.ok(right < 0, 'cards exit on wide screens')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForTimeout(300)
    assert.equal(await page.locator('.pin-spacer:has(> .sticky)').count(), 0, 'reduced motion removes pin')
    assert.equal(await page.locator('.card').count(), 5)
    for (const width of [320, 390, 768]) {
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await page.setViewportSize({ width, height: 844 })
      await page.waitForTimeout(300)
      assert.equal(await page.locator('.pin-spacer:has(> .sticky)').count(), 1, 'small screens retain pinned cards')
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    }
    assert.deepEqual(errors, [])
    console.log(`${name}: pinned scroll, reversal, wide-screen exit, StrictMode, responsive and reduced motion passed`)
  } finally { await browser.close() }
}
