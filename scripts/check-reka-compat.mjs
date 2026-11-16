import { createRequire } from "node:module"
import { readFileSync, readdirSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const vueDir = resolve(root, "packages/vue")
const vuePkg = JSON.parse(readFileSync(join(vueDir, "package.json"), "utf8"))
const require = createRequire(join(vueDir, "package.json"))

const rekaPkgPath = require.resolve("reka-ui/package.json")
const rekaPkg = JSON.parse(readFileSync(rekaPkgPath, "utf8"))
const rekaExports = await import(
  new URL(`file:///${require.resolve("reka-ui").replace(/\\/g, "/")}`).href
)

const errors = []

// 1. Peer dependency range check
const peerRange = vuePkg.peerDependencies?.["reka-ui"] ?? ""
if (!peerRange.includes("2.11.0") || !peerRange.includes("<3.0.0")) {
  errors.push(`packages/vue peerDependencies["reka-ui"]="${peerRange}" must lock >=2.11.0 <3.0.0`)
}
if (vuePkg.peerDependencies?.vue !== "^3.5.0") {
  errors.push(
    `packages/vue peerDependencies["vue"]="${vuePkg.peerDependencies?.vue}" must stay "^3.5.0"`,
  )
}

// 2. Installed version must be 2.x (>= 2.11.0, < 3.0.0)
const [major, minor] = String(rekaPkg.version)
  .split(".")
  .map((n) => Number.parseInt(n, 10))
if (major !== 2 || Number.isNaN(minor) || minor < 11) {
  errors.push(`Installed reka-ui@${rekaPkg.version} is outside supported >=2.11.0 <3.0.0 range`)
}

// 3. Every named import from "reka-ui" in @xcmm1543/miuui-vue must resolve at runtime
const componentsDir = join(vueDir, "src/components")
const importedSymbols = new Set()
const importRe = /import\s*\{([^}]+)\}\s*from\s*["']reka-ui["']/g

for (const file of readdirSync(componentsDir)) {
  if (!file.endsWith(".vue")) continue
  const source = readFileSync(join(componentsDir, file), "utf8")
  let match
  while ((match = importRe.exec(source))) {
    const names = match[1]
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) =>
        part
          .replace(/^type\s+/, "")
          .split(/\s+as\s+/)[0]
          ?.trim(),
      )
      .filter(Boolean)
    for (const name of names) {
      importedSymbols.add(name)
      if (!(name in rekaExports)) {
        errors.push(`${file}: missing Reka UI export "${name}" in reka-ui@${rekaPkg.version}`)
      }
    }
  }
}

// 4. Non-adapter packages must not depend on reka-ui
for (const pkgName of ["core", "tokens", "icons", "materials", "motions"]) {
  const manifest = JSON.parse(
    readFileSync(resolve(root, "packages", pkgName, "package.json"), "utf8"),
  )
  const allDeps = {
    ...manifest.dependencies,
    ...manifest.peerDependencies,
    ...manifest.devDependencies,
  }
  if ("reka-ui" in allDeps) {
    errors.push(`@xcmm1543/miuui-${pkgName} must not depend on reka-ui`)
  }
}

if (errors.length > 0) {
  console.error("Reka UI compatibility matrix check failed:")
  for (const err of errors) console.error(`- ${err}`)
  process.exit(1)
}

console.log(
  `Reka UI compat matrix passed: reka-ui@${rekaPkg.version} (${peerRange}), ` +
    `${importedSymbols.size} primitives verified.`,
)
