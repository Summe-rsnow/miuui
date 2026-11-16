import type { MaterialPlugin, ThemeContext } from "@xcmm1543/miuui-core"
import { semanticTokens } from "@xcmm1543/miuui-tokens"

function tokensFor(theme: ThemeContext, motionTier: string): Record<string, string> {
  const semantic = semanticTokens(theme.theme)
  return {
    "--miu-material-surface": semantic["--miu-color-surface-solid-bg"] ?? "",
    "--miu-material-border": semantic["--miu-color-border-subtle"] ?? "",
    "--miu-material-backdrop": "none",
    "--miu-material-highlight": "none",
    "--miu-material-gloss": motionTier === "full" ? "block" : "none",
  }
}

export const solidMaterial: MaterialPlugin = {
  name: "solid",
  fallback: null,
  generateTokens: tokensFor,
}

export const micaMaterial: MaterialPlugin = {
  name: "mica",
  fallback: "solid",
  fallbackCondition: "(prefers-reduced-transparency: reduce)",
  generateTokens(theme, motionTier) {
    const semantic = semanticTokens(theme.theme)
    return {
      "--miu-material-surface": semantic["--miu-color-surface-mica-bg"] ?? "",
      "--miu-material-border": semantic["--miu-color-surface-glass-border"] ?? "",
      "--miu-material-backdrop": "blur(18px) saturate(140%)",
      "--miu-material-highlight": semantic["--miu-color-surface-glass-highlight"] ?? "",
      "--miu-material-gloss": motionTier === "full" ? "block" : "none",
    }
  },
}

export const glassMaterial: MaterialPlugin = {
  name: "glass",
  fallback: "mica",
  fallbackCondition: "(prefers-reduced-transparency: reduce)",
  generateTokens(theme, motionTier) {
    const semantic = semanticTokens(theme.theme)
    return {
      "--miu-material-surface": semantic["--miu-color-surface-glass-bg"] ?? "",
      "--miu-material-border": semantic["--miu-color-surface-glass-border"] ?? "",
      "--miu-material-backdrop": "blur(22px) saturate(165%)",
      "--miu-material-highlight": semantic["--miu-color-surface-glass-highlight"] ?? "",
      "--miu-material-gloss": motionTier === "full" ? "block" : "none",
    }
  },
}

export const materialPlugins = {
  solid: solidMaterial,
  mica: micaMaterial,
  glass: glassMaterial,
} as const

export { tokensFor }
