import { describe, expect, it } from "vitest"
import {
  MiuRegistry,
  createMiuI18n,
  getThemeInitScript,
  mergeMessages,
  resolveControlSize,
  resolveIconSize,
  safeHref,
  themeAttributes,
  zhCN,
  type MaterialPlugin,
} from "./index"

const material = (name: string, fallback: string | null): MaterialPlugin => ({
  name,
  fallback,
  generateTokens: () => ({}),
})

describe("registry fallbacks", () => {
  it("walks the material fallback chain", () => {
    const registry = new MiuRegistry()
    registry.registerMaterial(material("solid", null))
    registry.registerMaterial(material("mica", "solid"))
    registry.registerMaterial(material("glass", "mica"))

    const resolved = registry.resolveMaterial("glass")
    expect(resolved.chain).toEqual(["glass", "mica", "solid"])
    expect(resolved.fallbackUsed).toBe(false)
    expect(registry.getMaterial("glass")?.name).toBe("glass")
  })

  it("falls back to solid for unknown materials", () => {
    const registry = new MiuRegistry()
    registry.registerMaterial(material("solid", null))
    const resolved = registry.resolveMaterial("unknown-material")
    expect(resolved.plugin?.name).toBe("solid")
    expect(resolved.fallbackUsed).toBe(true)
  })

  it("resolves custom plugin names, motion tiers, and adapters", () => {
    const registry = new MiuRegistry()
    registry.registerMaterial(material("solid", null))
    registry.registerMaterial(material("frosted-brand", "solid"))
    registry.registerMotionTier({
      name: "reduced",
      getTokenOverrides: () => ({ "--miu-motion-translate-sm": "0px" }),
      getLoopAnimationPolicy: () => "replace-static",
    })
    registry.registerMotionTier({
      name: "full",
      getTokenOverrides: () => ({}),
      getLoopAnimationPolicy: () => "play",
    })
    registry.registerAdapter({ name: "vue", version: "0.1.0", peerRange: { vue: "^3.5.0" } })

    expect(registry.resolveMaterial("frosted-brand").chain).toEqual(["frosted-brand", "solid"])
    expect(registry.resolveMotionTier("reduced").chain).toEqual(["reduced", "full"])
    expect(registry.resolveMotionTier("unknown").plugin?.name).toBe("full")
    expect(registry.getMotionTier("full")?.getLoopAnimationPolicy()).toBe("play")
    expect(registry.getAdapter("vue")?.version).toBe("0.1.0")
  })
})

describe("orthogonal sizing", () => {
  it("derives icon size from control size unless explicitly overridden", () => {
    expect(resolveIconSize("2xl")).toEqual({ size: "lg", derived: true })
    expect(resolveIconSize("2xl", "sm")).toEqual({ size: "sm", derived: false })
  })

  it("falls back to md for unsupported control sizes", () => {
    expect(resolveControlSize("huge", ["sm", "md", "lg"])).toEqual({
      size: "md",
      fallback: true,
    })
  })
})

describe("theme contracts", () => {
  it("serializes theme attributes for the DOM", () => {
    expect(themeAttributes({ theme: "dark", density: "compact", radius: "lg" })).toMatchObject({
      "data-theme": "dark",
      "data-density": "compact",
      "data-radius": "lg",
      "data-material": "solid",
      "data-motion-tier": "full",
    })
  })

  it("creates an SSR-first-paint script", () => {
    const script = getThemeInitScript({ theme: "dark" })
    expect(script.startsWith("<script>")).toBe(true)
    expect(script).toContain("data-theme")
    expect(script).toContain("dark")
  })
})

describe("i18n runtime", () => {
  it("switches locale and interpolates plural messages", () => {
    const i18n = createMiuI18n({ locale: "zh-CN" })
    expect(i18n.t("dialog.close")).toBe("关闭对话框")
    expect(i18n.t("table.selected", { count: 1 })).toBe("已选择 1 项")

    i18n.setLocale("en-US")
    expect(i18n.t("dialog.close")).toBe("Close dialog")
    expect(i18n.t("table.selected", { count: 1 })).toBe("1 item selected")
    expect(i18n.t("table.selected", { count: 3 })).toBe("3 items selected")
    expect(i18n.formatNumber(1234.5, { maximumFractionDigits: 0 })).toBe("1,235")
  })

  it("falls back through language, configured fallback and built-ins", () => {
    const i18n = createMiuI18n({
      locale: "fr-FR",
      fallbackLocale: "en-US",
      messages: { "fr-FR": { common: { close: "Fermer" } } },
    })
    expect(i18n.t("common.close")).toBe("Fermer")
    expect(i18n.t("common.cancel")).toBe("Cancel")
    expect(i18n.t("dialog.close")).toBe("Close dialog")
    expect(i18n.has("dialog.close")).toBe(true)
    expect(i18n.has("missing.key")).toBe(false)
    expect(i18n.t("missing.key")).toBe("missing.key")
    expect(
      i18n.formatDate(new Date("2024-01-01T00:00:00Z"), {
        timeZone: "UTC",
        year: "numeric",
      }),
    ).toContain("2024")
  })

  it("deep-merges message trees and keeps plural objects atomic", () => {
    const merged = mergeMessages(zhCN, { dialog: { close: "Close it" } })
    expect(merged.dialog).toMatchObject({ close: "Close it", title: "对话框" })
    expect(merged.common).toMatchObject(zhCN.common as Record<string, unknown>)
  })
})

describe("safeHref", () => {
  it("keeps relative, hash, and query targets", () => {
    expect(safeHref("/guide/start")).toBe("/guide/start")
    expect(safeHref("#api")).toBe("#api")
    expect(safeHref("?tab=2")).toBe("?tab=2")
    expect(safeHref("  ./relative  ")).toBe("./relative")
  })

  it("keeps http, https, mailto, and tel", () => {
    expect(safeHref("https://example.com/docs")).toBe("https://example.com/docs")
    expect(safeHref("HTTP://example.com")).toBe("HTTP://example.com")
    expect(safeHref("mailto:hi@example.com")).toBe("mailto:hi@example.com")
    expect(safeHref("tel:+10000000")).toBe("tel:+10000000")
  })

  it("drops executable and unknown schemes", () => {
    expect(safeHref("javascript:alert(1)")).toBeUndefined()
    expect(safeHref("JavaScript:alert(1)")).toBeUndefined()
    expect(safeHref("data:text/html,<script>")).toBeUndefined()
    expect(safeHref("vbscript:msgbox")).toBeUndefined()
  })

  it("returns undefined for empty input", () => {
    expect(safeHref(undefined)).toBeUndefined()
    expect(safeHref(null)).toBeUndefined()
    expect(safeHref("")).toBeUndefined()
    expect(safeHref("   ")).toBeUndefined()
  })
})
