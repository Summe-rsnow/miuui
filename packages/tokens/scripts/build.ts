import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { buildDtcg, buildTokenCss } from "../src/tokens"

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, "../src/generated")

mkdirSync(outDir, { recursive: true })
writeFileSync(resolve(outDir, "tokens.css"), buildTokenCss(), "utf8")
writeFileSync(
  resolve(outDir, "tokens.dtcg.json"),
  `${JSON.stringify(buildDtcg(), null, 2)}\n`,
  "utf8",
)

console.log("Generated src/generated/tokens.css")
console.log("Generated src/generated/tokens.dtcg.json")
