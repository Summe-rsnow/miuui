import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const root = process.cwd()
const errors = []

const colorRules = [
  { pattern: /#[0-9a-fA-F]{3,8}\b/, label: "hard-coded hex color" },
  { pattern: /\brgba?\(/, label: "hard-coded rgb color" },
  { pattern: /\bhsla?\(/, label: "hard-coded hsl color" },
  { pattern: /\boklch\(/, label: "hard-coded oklch color" },
]

const vueLiteralRules = [
  ...colorRules,
  { pattern: /(?:^|[^-\w])(?:\d*\.)?\d+px\b/, label: "hard-coded pixel value" },
  { pattern: /(?:^|[^-\w])(?:\d*\.)?\d+m?s\b/, label: "hard-coded duration" },
  { pattern: /z-index\s*:\s*\d+/, label: "hard-coded z-index" },
]

const logicalRules = [
  {
    pattern: /\b(?:border|padding|margin)-(?:top|bottom|left|right)(?:-color|-width|-style)?\s*:/,
    label: "physical directional box property (use logical block/inline properties)",
  },
]

function walk(dir, rules, checkLogical) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    const stats = statSync(path)
    if (stats.isDirectory()) {
      walk(path, rules, checkLogical)
      continue
    }
    if (!/\.(vue|css)$/.test(path)) continue
    const source = readFileSync(path, "utf8")
    for (const rule of rules) {
      if (rule.pattern.test(source)) {
        errors.push(`${relative(root, path)}: ${rule.label}`)
      }
    }
    if (checkLogical && path.endsWith(".css")) {
      for (const rule of logicalRules) {
        if (rule.pattern.test(source)) {
          errors.push(`${relative(root, path)}: ${rule.label}`)
        }
      }
    }
  }
}

walk(join(root, "packages/vue/src"), vueLiteralRules, true)
walk(join(root, "packages/materials/src"), colorRules, true)
walk(join(root, "packages/motions/src"), colorRules, true)

if (errors.length > 0) {
  console.error("Style lint violations found:")
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log("No hard-coded or physical directional style values found.")
