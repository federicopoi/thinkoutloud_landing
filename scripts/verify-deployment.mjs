import { chromium, webkit } from '@playwright/test'
import assert from 'node:assert/strict'

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4174/thinkoutloud_landing/'
for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch()
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 844 } })
      const errors = []
      const failedAssets = []
      page.on('pageerror', e => errors.push(e.message))
      page.on('response', r => { if (r.status() >= 400 && r.url().startsWith(base)) failedAssets.push(`${r.status()} ${r.url()}`) })
      await page.goto(base, { waitUntil: 'networkidle' })
      assert.equal(await page.locator('h1').textContent(), 'Your thoughts.Out loud.')
      for (const image of await page.locator('img').all()) assert.ok(await image.evaluate(e => e.complete && e.naturalWidth > 0), 'images loaded under Pages path')
      assert.equal(await page.locator('.pin-spacer').count(), width > 900 ? 2 : 1, 'responsive scroll effects initialized')
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal overflow')
      const github = page.getByRole('link', { name: 'View on GitHub' })
      assert.equal(await github.getAttribute('href'), 'https://github.com/federicopoi/thinkoutloud')
      assert.equal(await github.getAttribute('target'), '_blank')
      assert.match(await github.getAttribute('rel'), /noopener/)
      const [tab] = await Promise.all([page.waitForEvent('popup'), github.click()])
      await tab.waitForURL('https://github.com/federicopoi/thinkoutloud')
      await tab.close()
      assert.equal(page.url(), base, 'landing stays open')
      await page.getByRole('button', { name: 'See how it works' }).click()
      await page.waitForFunction(() => document.querySelector('video')?.currentTime > .1)
      assert.equal(await page.locator('video').evaluate(e => e.videoWidth), 1920)
      await page.getByRole('button', { name: 'Close film' }).click()
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('.hero .download').click(),
      ])
      assert.equal(download.suggestedFilename(), 'Think-Out-Loud.dmg')
      assert.equal(await download.failure(), null)
      assert.deepEqual(failedAssets, [])
      assert.deepEqual(errors, [])
      console.log(`${name} ${width}: images, animations, film, download, GitHub new tab, and asset paths passed`)
      await page.close()
    }
  } finally { await browser.close() }
}
