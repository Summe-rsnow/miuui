import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { gzipSync } from "node:zlib"
import { build } from "vite"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const tempDir = mkdtempSync(join(tmpdir(), "miuui-size-gate-"))

const MAX_BUTTON_GZIP_BYTES = 25 * 1024
const MAX_ICON_GZIP_BYTES = 2 * 1024

try {
  const buttonEntry = join(tempDir, "button-entry.mjs")
  writeFileSync(buttonEntry, 'import { Button } from "@miuui/vue"; export { Button };\n', "utf8")

  await build({
    configFile: false,
    logLevel: "silent",
    resolve: {
      alias: {
        "@miuui/vue": resolve(root, "packages/vue/dist/index.js"),
        "@miuui/core": resolve(root, "packages/core/dist/index.js"),
        "@miuui/icons": resolve(root, "packages/icons/dist/index.js"),
        "@miuui/tokens": resolve(root, "packages/tokens/dist/index.js"),
      },
    },
    build: {
      outDir: join(tempDir, "out-button"),
      emptyOutDir: true,
      minify: "esbuild",
      lib: {
        entry: buttonEntry,
        formats: ["es"],
        fileName: () => "button.js",
      },
      rollupOptions: {
        external: ["vue", "reka-ui", /^reka-ui\//],
      },
    },
  })

  const buttonCode = readFileSync(join(tempDir, "out-button/button.js"), "utf8")
  const buttonGzip = gzipSync(buttonCode).byteLength

  const forbidden = ["miu-table", "miu-dialog", "miu-command-palette", "miu-select__trigger"]
  for (const marker of forbidden) {
    if (buttonCode.includes(marker)) {
      throw new Error(`Tree-shaking failure: single Button bundle includes "${marker}".`)
    }
  }

  if (buttonGzip > MAX_BUTTON_GZIP_BYTES) {
    throw new Error(
      `Single Button bundle gzipped (${buttonGzip} B) exceeds limit (${MAX_BUTTON_GZIP_BYTES} B).`,
    )
  }

  const iconEntry = join(tempDir, "icon-entry.mjs")
  writeFileSync(
    iconEntry,
    'import { PlusIcon } from "@miuui/icons"; export { PlusIcon };\n',
    "utf8",
  )

  await build({
    configFile: false,
    logLevel: "silent",
    resolve: {
      alias: {
        "@miuui/icons": resolve(root, "packages/icons/dist/index.js"),
      },
    },
    build: {
      outDir: join(tempDir, "out-icon"),
      emptyOutDir: true,
      minify: "esbuild",
      lib: {
        entry: iconEntry,
        formats: ["es"],
        fileName: () => "icon.js",
      },
    },
  })

  const iconCode = readFileSync(join(tempDir, "out-icon/icon.js"), "utf8")
  const iconGzip = gzipSync(iconCode).byteLength

  if (iconCode.includes('"bell"') || iconCode.includes('"settings"')) {
    throw new Error("Tree-shaking failure: single PlusIcon bundle includes unused icons.")
  }

  if (iconGzip > MAX_ICON_GZIP_BYTES) {
    throw new Error(
      `Single PlusIcon bundle gzipped (${iconGzip} B) exceeds limit (${MAX_ICON_GZIP_BYTES} B).`,
    )
  }

  console.log(
    `Bundle size gate passed: Button=${buttonCode.length} B raw / ${buttonGzip} B gzip; PlusIcon=${iconCode.length} B raw / ${iconGzip} B gzip`,
  )
} finally {
  rmSync(tempDir, { recursive: true, force: true })
}
