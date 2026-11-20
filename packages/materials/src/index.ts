import type { MaterialPlugin, ThemeContext } from "@xcmm1543/miuui-core"
import { semanticTokens } from "@xcmm1543/miuui-tokens"

function solidTokens(theme: ThemeContext): Record<string, string> {
  const semantic = semanticTokens(theme.theme)
  return {
    "--miu-material-surface": semantic["--miu-color-surface-solid-bg"] ?? "",
    "--miu-material-border": semantic["--miu-color-border-subtle"] ?? "",
    "--miu-material-backdrop": "none",
    "--miu-material-highlight": "none",
    "--miu-material-gloss": "none",
  }
}

function glassBaseTokens(semantic: Record<string, string>): Record<string, string> {
  return {
    "--miu-glass-filter-micro": semantic["--miu-glass-filter-micro"] ?? "",
    "--miu-glass-filter-thin": semantic["--miu-glass-filter-thin"] ?? "",
    "--miu-glass-filter-regular": semantic["--miu-glass-filter-regular"] ?? "",
    "--miu-glass-filter-thick": semantic["--miu-glass-filter-thick"] ?? "",
    "--miu-glass-surface-ultra-thin": semantic["--miu-glass-surface-ultra-thin"] ?? "",
    "--miu-glass-surface-thin": semantic["--miu-glass-surface-thin"] ?? "",
    "--miu-glass-surface-regular": semantic["--miu-glass-surface-regular"] ?? "",
    "--miu-glass-surface-thick": semantic["--miu-glass-surface-thick"] ?? "",
    "--miu-glass-surface-elevated": semantic["--miu-glass-surface-elevated"] ?? "",
    "--miu-glass-hairline": semantic["--miu-glass-hairline"] ?? "",
    "--miu-glass-specular": semantic["--miu-glass-specular"] ?? "",
    "--miu-glass-sheen": semantic["--miu-glass-sheen"] ?? "",
  }
}

export const solidMaterial: MaterialPlugin = {
  name: "solid",
  fallback: null,
  generateTokens: solidTokens,
}

export const micaMaterial: MaterialPlugin = {
  name: "mica",
  fallback: "solid",
  fallbackCondition: "(prefers-reduced-transparency: reduce)",
  generateTokens(theme, motionTier) {
    const semantic = semanticTokens(theme.theme)
    return {
      ...glassBaseTokens(semantic),
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
      ...glassBaseTokens(semantic),
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
