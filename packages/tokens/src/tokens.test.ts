import { describe, expect, it } from "vitest"
import {
  BRAND_PALETTE,
  VIOLET_SCALE,
  VIOLET_SEED,
  buildDtcg,
  buildTokenCss,
  contrastRatio,
  generatePalette,
  hexToOklch,
  oklchToHex,
  semanticTokensForSeed,
} from "./index"

const isHex = (value: string): boolean => /^#[0-9A-F]{6}$/.test(value)

describe("OKLCH palette", () => {
  it("uses the canonical violet scale for the brand seed", () => {
    expect(generatePalette(VIOLET_SEED).primary).toEqual(VIOLET_SCALE)
  })

  it("round-trips sRGB through OKLCH", () => {
    const converted = oklchToHex(hexToOklch("#9A49E0"))
    expect(converted).toBe("#9A49E0")
  })

  it("keeps all neutral and status levels inside sRGB", () => {
    for (const scale of [
      BRAND_PALETTE.neutral,
      BRAND_PALETTE.danger,
      BRAND_PALETTE.success,
      BRAND_PALETTE.warning,
      BRAND_PALETTE.info,
    ]) {
      for (const value of Object.values(scale)) expect(isHex(value)).toBe(true)
    }
  })
})

describe("token artefacts", () => {
  it("emits the layer contract and all orthogonal dimensions", () => {
    const css = buildTokenCss()
    expect(css).toContain(
      "@layer miu-reset, miu-tokens, miu-base, miu-material, miu-motion, miu-override;",
    )
    expect(css).toContain("--miu-control-2xl-height: 52px;")
    expect(css).toContain("--miu-radius-default: var(--miu-radius-md);")
    expect(css).toContain("--miu-icon-size-xl: 24px;")
    expect(css).toContain("--miu-text-body-size: 16px;")
    expect(css).toContain("--miu-space-24: 96px;")
    expect(css).toContain("--miu-focus-ring-width: 2px;")
    expect(css).toContain("--miu-motion-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);")
    expect(css).toContain("--miu-scrollbar-inset: 2px;")
    expect(css).toContain("--miu-color-danger-text: var(--miu-danger-700);")
    expect(css).toContain('[data-theme="dark"]')
  })

  it("exports dimension tokens with the DTCG dimension type", () => {
    const dtcg = buildDtcg() as {
      control: Record<string, { height: { $type: string; $value: string } }>
      radius: Record<string, { $type: string; $value: string }>
      font: { size: Record<string, { $type: string; $value: string }> }
      color: { semantic: Record<string, { $value: string }> }
    }
    expect(dtcg.control.md?.height).toEqual({ $type: "dimension", $value: "32px" })
    expect(dtcg.radius.full).toEqual({ $type: "dimension", $value: "9999px" })
    expect(dtcg.font.size.base).toEqual({ $type: "dimension", $value: "16px" })
    expect(dtcg.color.semantic.primary?.$value).toBe("{color.violet.700}")
    expect(dtcg.color.semantic["text-secondary"]?.$value).toBe("{color.gray.700}")
  })
})

it("generates WCAG-compliant runtime semantic tokens for arbitrary cover seeds", () => {
  for (const seed of ["#9A49E0", "#FACC15", "#06B6D4", "#888888", "#EF4444"]) {
    for (const theme of ["light", "dark"] as const) {
      const tokens = semanticTokensForSeed(seed, theme)
      const primary = tokens["--miu-color-primary"]!
      const onPrimary = tokens["--miu-color-text-on-primary"]!
      const primaryText = tokens["--miu-color-primary-text"]!
      const mutedBg = tokens["--miu-color-bg-muted"]!
      expect(contrastRatio(primary, onPrimary)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(primaryText, mutedBg)).toBeGreaterThanOrEqual(4.5)
    }
  }
})
