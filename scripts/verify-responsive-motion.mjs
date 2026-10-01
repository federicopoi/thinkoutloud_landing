import { chromium, webkit } from '@playwright/test'
import assert from 'node:assert/strict'

for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch()
  try {
    for (const [width, height] of [[1440, 900], [768, 1024], [390, 844], [320, 568], [844, 390]]) {
      const page = await browser.newPage({ viewport: { width, height }, hasTouch: width < 1000 })
      const errors = []
      page.on('pageerror', e => errors.push(e.message))
      await page.goto('http://127.0.0.1:5174', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)
      const button = page.locator('.hero .download')
      await button.scrollIntoViewIfNeeded()
      await page.waitForTimeout(1000)
      const before = await button.boundingBox()
      await button.hover()
      await page.waitForTimeout(300)
      const after = await button.boundingBox()
      assert.ok(Math.abs(before.y - after.y) < .1 && Math.abs(before.width - after.width) < .1, 'download stays still on hover')
      assert.equal(await page.locator('.pin-spacer').count(), 2, 'same two pinned animations at every size')
      const scroll = async y => {
        await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y)
        await page.waitForTimeout(1000)
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'no sideways overflow')
      }
      const start = selector => page.locator(selector).evaluate(e => e.getBoundingClientRect().top + scrollY)
      const macStart = await start('.pin-spacer:has(> .mac-zoom)')
      const scale = () => page.locator('.mac-zoom-product').evaluate(e => new DOMMatrix(getComputedStyle(e).transform).a)
      await scroll(macStart)
      const initial = await scale()
      const macDistance = await page.locator('.pin-spacer:has(> .mac-zoom)').evaluate(e => e.clientHeight - e.querySelector('.mac-zoom').clientHeight)
      if (width <= 900) {
        assert.ok(await page.locator('.mac-zoom').evaluate(e => e.clientHeight) <= width * .86, 'mobile stage fits laptop')
        assert.ok(macDistance < height, 'mobile zoom has a shorter scroll runway')
      }
      await scroll(macStart + macDistance * .75)
      assert.ok(await scale() > initial + .15, 'same zoom on desktop and mobile')
      assert.ok(Math.abs(await page.locator('.mac-zoom').evaluate(e => e.getBoundingClientRect().top)) < 2, 'Mac pins')
      await page.screenshot({ path: `artifacts/${name}-${width}x${height}-zoom.png` })
      const benefitsStart = await start('.pin-spacer:has(> .sticky)')
      await scroll(benefitsStart + height * 5 * .22)
      const first = await page.locator('.card').first().boundingBox()
      assert.ok(first.x < width && first.x + first.width > 0, 'card flies through viewport')
      const forward = await page.locator('.sticky-header').evaluate(e => getComputedStyle(e).transform)
      for (const card of await page.locator('.card').all()) {
        assert.equal(await card.evaluate(e => e.scrollHeight <= e.clientHeight + 1), true, 'card copy fits')
      }
      await page.screenshot({ path: `artifacts/${name}-${width}x${height}-cards.png` })
      await scroll(benefitsStart + height * 5 * .6)
      assert.notEqual(await page.locator('.sticky-header').evaluate(e => getComputedStyle(e).transform), forward)
      await scroll(benefitsStart + height * 5 * .22)
      assert.equal(await page.locator('.sticky-header').evaluate(e => getComputedStyle(e).transform), forward, 'scroll reverses')
      await scroll(benefitsStart + height * 5)
      for (const right of await page.locator('.card').evaluateAll(nodes => nodes.map(e => e.getBoundingClientRect().right))) assert.ok(right < 0, 'all cards leave screen')
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.waitForTimeout(300)
      assert.equal(await page.locator('.pin-spacer').count(), 0, 'reduced motion removes both pins')
      assert.deepEqual(errors, [])
      console.log(`${name} ${width}×${height}: stationary buttons, zoom, flight, reversal, readable cards, reduced motion passed`)
      await page.close()
    }
  } finally { await browser.close() }
}
