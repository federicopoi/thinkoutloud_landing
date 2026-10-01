import { chromium, webkit } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5173'
await mkdir('artifacts', { recursive: true })
const results = []
for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch({ headless: true })
  try {
    const errors = []
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(base, { waitUntil: 'networkidle' })
    await page.getByText('Copied', { exact: true }).waitFor()
    await page.evaluate(() => document.fonts.ready)
    assert.equal(await page.locator('h1').textContent(), 'Your thoughts.Out loud.')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    await page.screenshot({ path: `artifacts/${name}-desktop.png` })

    await page.getByRole('button', { name: 'Replay dictation preview' }).click()
    await page.getByRole('button', { name: 'Stop dictation preview' }).waitFor()
    await page.getByRole('button', { name: 'Stop dictation preview' }).click()
    await page.getByText('Copied', { exact: true }).waitFor()
    assert.equal(await page.getByRole('button', { name: 'Stop dictation preview' }).count(), 0)
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: 'Download for Mac' }).last().click()])
    assert.equal(download.suggestedFilename(), 'Think-Out-Loud.zip')
    await download.saveAs(`artifacts/${name}-download.zip`)

    await page.getByRole('link', { name: 'Why Think Out Loud', exact: true }).click()
    await page.waitForFunction(() => location.hash === '#free-and-local')
    assert.equal(await page.locator('.sticky .card').count(), 5)
    assert.equal(await page.locator('.pin-spacer:has(> .sticky)').count(), 1)
    assert.equal(await page.locator('.benefits, .how-section, .privacy-section, .site-footer').count(), 0)
    await page.locator('.closing-section').scrollIntoViewIfNeeded()
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.closing-section > div')).opacity === '1')
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await page.screenshot({ path: `artifacts/${name}-full-page.png`, fullPage: true })

    for (const width of [390, 320, 768]) {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(base, { waitUntil: 'networkidle' })
      await page.getByText('Copied', { exact: true }).waitFor()
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${name}: overflow at ${width}px`)
      await page.screenshot({ path: `artifacts/${name}-${width}.png`, fullPage: true })
    }

    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(base, { waitUntil: 'networkidle' })
    await page.getByText('Copied', { exact: true }).waitFor()
    assert.equal(await page.getByRole('button', { name: 'Stop dictation preview' }).count(), 0)
    assert.equal(await page.locator('.blinking').count(), 0)
    assert.equal(await page.getByRole('button', { name: 'Replay dictation preview' }).count(), 0)
    assert.equal(await page.locator('h1').isVisible(), true)
    assert.deepEqual(errors, [])
    results.push({ engine: name, status: 'passed', checks: ['desktop/mobile/tablet layout', 'Stop and Replay', 'ZIP download', 'new sections and navigation', 'reduced motion', 'no JS errors'] })
  } finally { await browser.close() }
}
await writeFile('artifacts/verification.json', JSON.stringify(results, null, 2))
console.log(JSON.stringify(results, null, 2))
