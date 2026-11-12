import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { migrateFormRowDense, transformSource } from "./index"
import { runCli } from "./cli"

describe("@miuui/codemod", () => {
  it("migrates boolean and bound dense attributes to density='compact'", () => {
    const input = `<template>
  <FormRow label="A" dense />
  <MiuFormRow label="B" :dense="true" clickable />
  <form-row label="C" dense density="comfortable" />
  <FormRow label="D" :dense="false" />
</template>`

    const result = transformSource(input)
    expect(result.changed).toBe(true)
    expect(result.changes).toHaveLength(3)
    expect(result.code).toContain('<FormRow label="A" density="compact" />')
    expect(result.code).toContain('<MiuFormRow label="B" density="compact" clickable />')
    expect(result.code).toContain('<form-row label="C" density="comfortable" />')
    expect(result.code).toContain('<FormRow label="D" :dense="false" />')
  })

  it("leaves already migrated templates untouched", () => {
    const input = `<FormRow label="Ready" density="compact" />`
    const result = migrateFormRowDense(input)
    expect(result.changed).toBe(false)
    expect(result.code).toBe(input)
  })

  it("supports dry-run and write modes in runCli", () => {
    const dir = mkdtempSync(join(tmpdir(), "miuui-codemod-"))
    try {
      const file = join(dir, "Sample.vue")
      writeFileSync(file, `<template><FormRow label="X" dense /></template>`, "utf8")
      expect(runCli(["--dry-run", file])).toBe(1)
      expect(readFileSync(file, "utf8")).toContain("dense")

      expect(runCli([file])).toBe(1)
      expect(readFileSync(file, "utf8")).toContain('density="compact"')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
