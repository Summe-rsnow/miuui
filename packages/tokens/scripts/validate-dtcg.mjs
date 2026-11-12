import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import Ajv from "ajv"

const here = dirname(fileURLToPath(import.meta.url))
const schema = JSON.parse(readFileSync(resolve(here, "../dtcg.schema.json"), "utf8"))
const tokens = JSON.parse(readFileSync(resolve(here, "../src/generated/tokens.dtcg.json"), "utf8"))

const ajv = new Ajv({ allErrors: true, strict: false })
const validate = ajv.compile(schema)

if (!validate(tokens)) {
  console.error(validate.errors)
  process.exit(1)
}

const dimensionPrefixes = ["control.", "density.", "radius.", "iconSize.", "focus.", "font.size."]
const errors = []

function walk(node, path) {
  if (node && typeof node === "object" && "$type" in node) {
    if (dimensionPrefixes.some((prefix) => path.startsWith(prefix)) && node.$type !== "dimension") {
      errors.push(`${path}: expected $type=dimension, received ${node.$type}`)
    }
    if (path.startsWith("motion.duration.") && node.$type !== "duration") {
      errors.push(`${path}: expected $type=duration, received ${node.$type}`)
    }
    if (path.startsWith("z.") && node.$type !== "number") {
      errors.push(`${path}: expected $type=number, received ${node.$type}`)
    }
    if (node.$type === "dimension" && !/^-?\d*\.?\d+(px|rem|em|%)$/.test(String(node.$value))) {
      errors.push(`${path}: dimension $value must carry a unit, received ${node.$value}`)
    }
    if (node.$type === "duration" && !/^\d*\.?\d+m?s$/.test(String(node.$value))) {
      errors.push(`${path}: duration $value must be ms or s, received ${node.$value}`)
    }
    if (node.$type === "number" && typeof node.$value !== "number") {
      errors.push(`${path}: number $value must be a number, received ${node.$value}`)
    }
    if (typeof node.$value === "string" && /^\{[^}]+\}$/.test(node.$value)) {
      const target = node.$value.slice(1, -1)
      if (resolveDotted(tokens, target) === undefined) {
        errors.push(`${path}: alias ${node.$value} does not resolve`)
      }
    }
    if ((path.split(".").pop() ?? "").startsWith("--")) {
      errors.push(`${path}: raw CSS custom property leaked into DTCG keys`)
    }
    return
  }
  if (node && typeof node === "object") {
    for (const [key, child] of Object.entries(node)) {
      walk(child, path ? `${path}.${key}` : key)
    }
  }
}

function resolveDotted(root, dotted) {
  let current = root
  for (const part of dotted.split(".")) {
    if (!current || typeof current !== "object" || !(part in current)) return undefined
    current = current[part]
  }
  return current
}

walk(tokens, "")

if (errors.length > 0) {
  console.error(errors.join("\n"))
  process.exit(1)
}

console.log("DTCG export is valid.")
