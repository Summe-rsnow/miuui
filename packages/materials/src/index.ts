import type { MaterialPlugin, ThemeContext } from "@xcmm1543/miuui-core"
import { semanticTokens } from "@xcmm1543/miuui-tokens"

function tokensFor(theme: ThemeContext, _motionTier: string): Record<string, string> {
  const semantic = semanticTokens(theme.theme)
  return {
    "--miu-material-surface": semantic["--miu-color-surface-solid-bg"] ?? "",
    "--miu-material-border": semantic["--miu-color-border-subtle"] ?? "",
    "--miu-material-backdrop": "none",
    "--miu-material-highlight": "none",
    "--miu-material-gloss": "none",
    "--miu-glass-filter-micro": "none",
    "--miu-glass-filter-thin": "none",
    "--miu-glass-filter-regular": "none",
    "--miu-glass-filter-thick": "none",
    "--miu-glass-surface-ultra-thin": semantic["--miu-color-bg-muted"] ?? "",
    "--miu-glass-surface-thin": semantic["--miu-color-bg-surface"] ?? "",
    "--miu-glass-surface-regular": semantic["--miu-color-surface-solid-bg"] ?? "",
    "--miu-glass-surface-thick": semantic["--miu-color-bg-elevated"] ?? "",
    "--miu-glass-surface-elevated": semantic["--miu-color-bg-overlay"] ?? "",
    "--miu-glass-hairline": semantic["--miu-color-border-subtle"] ?? "",
    "--miu-glass-specular": "none",
    "--miu-glass-sheen": "none",
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
      "--miu-material-border": semantic["--miu-glass-hairline"] ?? "",
      "--miu-material-backdrop": semantic["--miu-glass-filter-thin"] ?? "",
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
      "--miu-material-surface": semantic["--miu-glass-surface-regular"] ?? "",
      "--miu-material-border": semantic["--miu-glass-hairline"] ?? "",
      "--miu-material-backdrop": semantic["--miu-glass-filter-regular"] ?? "",
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
