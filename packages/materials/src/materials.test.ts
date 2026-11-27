import { describe, expect, it } from "vitest"
import type { ThemeContext } from "@xcmm1543/miuui-core"
import { glassMaterial, materialPlugins, micaMaterial, solidMaterial } from "./index"

const ctx: ThemeContext = {
  theme: "dark",
  density: "default",
  radius: "md",
  material: "solid",
  motionTier: "full",
}

describe("material plugins", () => {
  it("isolates generated tokens to --miu-material-* without leaking --miu-glass-*", () => {
    for (const plugin of [solidMaterial, micaMaterial, glassMaterial]) {
      const tokens = plugin.generateTokens(ctx, "full")
      const keys = Object.keys(tokens)
      expect(keys.length).toBeGreaterThan(0)
      for (const key of keys) {
        expect(key.startsWith("--miu-material-")).toBe(true)
        expect(key).not.toBe("--miu-material-gloss")
      }
      expect(keys.some((k) => k.startsWith("--miu-glass-"))).toBe(false)
    }
  })

  it("preserves fallback chain and expected backdrop values", () => {
    expect(materialPlugins).toEqual({
      solid: solidMaterial,
      mica: micaMaterial,
      glass: glassMaterial,
    })
    expect(solidMaterial.fallback).toBeNull()
    expect(micaMaterial.fallback).toBe("solid")
    expect(glassMaterial.fallback).toBe("mica")
    expect(solidMaterial.generateTokens(ctx, "full")["--miu-material-backdrop"]).toBe("none")
    expect(micaMaterial.generateTokens(ctx, "full")["--miu-material-backdrop"]).toContain("blur(")
    expect(glassMaterial.generateTokens(ctx, "full")["--miu-material-backdrop"]).toContain("blur(")
  })
})
