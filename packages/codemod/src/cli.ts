import { readFileSync, writeFileSync } from "node:fs"
import { transformSource } from "./index"

export function runCli(argv: readonly string[]): number {
  const dryRun = argv.includes("--dry-run")
  const files = argv.filter((arg) => !arg.startsWith("--"))
  let touched = 0

  for (const file of files) {
    const source = readFileSync(file, "utf8")
    const result = transformSource(source)
    if (!result.changed) continue
    touched += 1
    if (!dryRun) writeFileSync(file, result.code, "utf8")
  }

  return touched
}
