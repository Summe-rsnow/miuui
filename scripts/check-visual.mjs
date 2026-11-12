import { createRequire } from "node:module"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import vue from "@vitejs/plugin-vue"
import { chromium } from "playwright-core"
import { PNG } from "pngjs"
import { createServer } from "vite"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const require = createRequire(import.meta.url)
const axePath = require.resolve("axe-core/axe.min.js")
const axeSource = readFileSync(axePath, "utf8")

const updateMode = process.argv.includes("--update")
const baselineDir = resolve(root, "visual-baselines", process.platform)

function resolveBrowserExecutable() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
  ].filter(Boolean)

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }
  return undefined
}

function comparePngBuffers(actualBuf, expectedBuf) {
  const actual = PNG.sync.read(actualBuf)
  const expected = PNG.sync.read(expectedBuf)
  if (actual.width !== expected.width || actual.height !== expected.height) {
    return {
      match: false,
      reason: `dimension mismatch ${actual.width}x${actual.height} vs ${expected.width}x${expected.height}`,
      diffRatio: 1,
    }
  }

  let diffPixels = 0
  const totalPixels = actual.width * actual.height
  for (let i = 0; i < actual.data.length; i += 4) {
    const dr = Math.abs(actual.data[i] - expected.data[i])
    const dg = Math.abs(actual.data[i + 1] - expected.data[i + 1])
    const db = Math.abs(actual.data[i + 2] - expected.data[i + 2])
    const da = Math.abs(actual.data[i + 3] - expected.data[i + 3])
    if (dr > 8 || dg > 8 || db > 8 || da > 8) {
      diffPixels += 1
    }
  }
  const diffRatio = diffPixels / totalPixels
  return {
    match: diffRatio <= 0.01,
    diffPixels,
    totalPixels,
    diffRatio,
  }
}

async function runAxe(page, label) {
  await page.addScriptTag({ content: axeSource })
  const results = await page.evaluate(async () => {
    return await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    })
  })
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  )
  if (serious.length > 0) {
    throw new Error(
      `axe-core real-browser violations (${label}):\n${JSON.stringify(
        serious.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
        })),
        null,
        2,
      )}`,
    )
  }
}

const executablePath = resolveBrowserExecutable()
const server = await createServer({
  configFile: false,
  logLevel: "warn",
  root: resolve(root, "scripts/visual"),
  plugins: [vue()],
  resolve: {
    alias: {
      "@miuui/vue/style.css": resolve(root, "packages/vue/dist/style.css"),
      "@miuui/vue/components.css": resolve(root, "packages/vue/dist/components.css"),
      "@miuui/vue": resolve(root, "packages/vue/dist/index.js"),
      "@miuui/tokens/style.css": resolve(root, "packages/tokens/dist/tokens.css"),
      "@miuui/tokens": resolve(root, "packages/tokens/dist/index.js"),
      "@miuui/materials/style.css": resolve(root, "packages/materials/dist/style.css"),
      "@miuui/materials": resolve(root, "packages/materials/dist/index.js"),
      "@miuui/motions/style.css": resolve(root, "packages/motions/dist/style.css"),
      "@miuui/motions": resolve(root, "packages/motions/dist/index.js"),
      "@miuui/core": resolve(root, "packages/core/dist/index.js"),
      "@miuui/icons": resolve(root, "packages/icons/dist/index.js"),
    },
  },
  server: {
    port: 0,
    host: "127.0.0.1",
    fs: { allow: [root] },
  },
})

await server.listen()
const address = server.httpServer?.address()
if (!address || typeof address === "string") {
  await server.close()
  throw new Error("Unable to resolve visual server port.")
}
const baseUrl = `http://127.0.0.1:${address.port}/`

let browser
try {
  browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  })
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  const pageErrors = []
  page.on("pageerror", (err) => {
    pageErrors.push(err.message)
    console.error("[pageerror]", err.message)
  })
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      pageErrors.push(msg.text())
      console.error("[console.error]", msg.text())
    }
  })

  // 1. Matrix screenshots + real browser axe-core (with color-contrast enabled!)
  const matrix = [
    { name: "light-solid-md", query: "theme=light&material=solid&size=md&radius=md", axe: true },
    { name: "dark-solid-xl", query: "theme=dark&material=solid&size=xl&radius=full", axe: true },
    { name: "light-mica-md", query: "theme=light&material=mica&size=md&radius=md", axe: true },
    { name: "dark-glass-md", query: "theme=dark&material=glass&size=md&radius=md", axe: true },
    {
      name: "light-dialog-open",
      query: "theme=light&material=solid&size=md&radius=md&dialog=1",
      axe: true,
    },
  ]

  // Pixel comparison is per-platform. Platforms without committed baselines still run the
  // behavioural gates (axe-core contrast + keyboard E2E); only the screenshot diff is skipped.
  const platformBaselines = existsSync(baselineDir)
  if (!platformBaselines) {
    console.log(
      `No visual baselines for ${process.platform}; running axe + keyboard gates only. ` +
        `Run "pnpm visual:seed" to add them.`,
    )
  }

  const seedAllowed = process.env.VISUAL_SEED === "1" || process.argv.includes("--seed")
  if (updateMode || seedAllowed) {
    mkdirSync(baselineDir, { recursive: true })
  }
  for (const entry of matrix) {
    await page.goto(`${baseUrl}?${entry.query}`, { waitUntil: "networkidle" })
    await page.waitForSelector(".matrix-root")

    if (entry.axe) {
      await runAxe(page, entry.name)
    }

    if (!platformBaselines && !updateMode && !seedAllowed) continue

    const shot = await page.screenshot({ fullPage: true, animations: "disabled" })
    const baselinePath = resolve(baselineDir, `${entry.name}.png`)
    if (updateMode || (seedAllowed && !existsSync(baselinePath))) {
      writeFileSync(baselinePath, shot)
      console.log(`Saved visual baseline: visual-baselines/${process.platform}/${entry.name}.png`)
      continue
    }
    if (!existsSync(baselinePath)) {
      throw new Error(
        `Missing visual baseline: visual-baselines/${process.platform}/${entry.name}.png. ` +
          `Commit baselines for this platform, or set VISUAL_SEED=1 once to generate them.`,
      )
    }
    {
      const expected = readFileSync(baselinePath)
      const cmp = comparePngBuffers(shot, expected)
      if (!cmp.match) {
        throw new Error(
          `Visual regression in ${entry.name}: diff ${(cmp.diffRatio * 100).toFixed(2)}% (${cmp.reason ?? `${cmp.diffPixels} px`})`,
        )
      }
    }
  }

  // 2. Orthogonal geometry, motion=none 0.01ms, hover/focus-visible & real keyboard E2E
  await page.goto(`${baseUrl}?theme=light&material=solid&motionTier=none&size=md&radius=md`, {
    waitUntil: "networkidle",
  })
  const geometry = await page.evaluate(() => {
    const primary = document.getElementById("btn-primary")?.getBoundingClientRect()
    const glass = document.getElementById("btn-glass")?.getBoundingClientRect()
    const provider = document.querySelector(".miu-theme-provider")
    const durationFast = provider
      ? getComputedStyle(provider).getPropertyValue("--miu-motion-duration-fast").trim()
      : ""
    return {
      primaryH: primary?.height,
      glassH: glass?.height,
      durationFast,
    }
  })

  if (!geometry.primaryH || geometry.primaryH !== geometry.glassH) {
    throw new Error(
      `Material changed control height: solid=${geometry.primaryH}, glass=${geometry.glassH}`,
    )
  }
  if (geometry.durationFast !== "0.01ms") {
    throw new Error(`motionTier=none expected 0.01ms, got "${geometry.durationFast}"`)
  }

  // Keyboard: Tab focus ring visibility + hover state
  await page.locator("#btn-primary").hover()
  await page.locator("#btn-primary").focus()
  await page.keyboard.press("Tab")
  const focusCheck = await page.evaluate(() => {
    const active = document.activeElement
    const style = active ? getComputedStyle(active) : null
    return {
      id: active?.id,
      outlineStyle: style?.outlineStyle,
      outlineWidth: parseFloat(style?.outlineWidth || "0"),
    }
  })
  if (
    focusCheck.id !== "btn-secondary" ||
    focusCheck.outlineStyle === "none" ||
    focusCheck.outlineWidth < 2
  ) {
    throw new Error(`Focus ring check failed: ${JSON.stringify(focusCheck)}`)
  }

  // Keyboard: Tabs ArrowRight skips disabled tab
  const firstTab = page.locator('[role="tab"]').first()
  await firstTab.focus()
  await page.keyboard.press("ArrowRight")
  const thirdTabSelected = await page.locator('[role="tab"]').nth(2).getAttribute("aria-selected")
  if (thirdTabSelected !== "true") {
    throw new Error(`Tabs ArrowRight did not skip disabled tab: aria-selected=${thirdTabSelected}`)
  }

  // Keyboard: Dialog opens, Escape closes and restores focus to trigger
  await page.locator("#open-dialog-btn").click()
  await page.waitForSelector(".miu-dialog__content")
  await page.keyboard.press("Escape")
  await page.waitForSelector(".miu-dialog__content", { state: "detached" })
  const restoredId = await page.evaluate(() => document.activeElement?.id)
  if (restoredId !== "open-dialog-btn") {
    throw new Error(`Dialog Escape did not restore focus to trigger; activeElement=${restoredId}`)
  }

  if (pageErrors.length > 0) {
    throw new Error(`Console/page errors in visual check:\n${pageErrors.join("\n")}`)
  }

  console.log(
    "Visual matrix, real contrast axe-core, orthogonal geometry, and keyboard E2E passed.",
  )
} finally {
  if (browser) await browser.close()
  await server.close()
}
