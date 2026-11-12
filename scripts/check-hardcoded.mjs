import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const root = process.cwd()
const targets = ["packages/vue/src"]
const errors = []

const rules = [
  { pattern: /#[0-9a-fA-F]{3,8}\b/, label: "hard-coded hex color" },
  { pattern: /\brgba?\(/, label: "hard-coded rgb color" },
  { pattern: /\bhsla?\(/, label: "hard-coded hsl color" },
  { pattern: /\boklch\(/, label: "hard-coded oklch color" },
  { pattern: /(?:^|[^-\w])(?:\d*\.)?\d+px\b/, label: "hard-coded pixel value" },
  { pattern: /(?:^|[^-\w])(?:\d*\.)?\d+m?s\b/, label: "hard-coded duration" },
  { pattern: /z-index\s*:\s*\d+/, label: "hard-coded z-index" },
]

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    const stats = statSync(path)
    if (stats.isDirectory()) {
      walk(path)
      continue
    }
    if (!/\.(vue|css)$/.test(path)) continue
    const source = readFileSync(path, "utf8")
    for (const rule of rules) {
      if (rule.pattern.test(source)) {
        errors.push(`${relative(root, path)}: ${rule.label}`)
      }
    }
  }
}

for (const target of targets) walk(join(root, target))

if (errors.length > 0) {
  console.error("Hard-coded style values found:")
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log("No hard-coded style values in the Vue adapter.")
