import type { MaterialPlugin, ThemeContext } from "@xcmm1543/miuui-core"
import { semanticTokens } from "@xcmm1543/miuui-tokens"

function solidTokens(theme: ThemeContext): Record<string, string> {
  const semantic = semanticTokens(theme.theme)
  return {
    "--miu-material-surface": semantic["--miu-color-surface-solid-bg"] ?? "",
    "--miu-material-border": semantic["--miu-color-border-subtle"] ?? "",
    "--miu-material-backdrop": "none",
    "--miu-material-highlight": "none",
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
  generateTokens(theme) {
    const semantic = semanticTokens(theme.theme)
    return {
      "--miu-material-surface": semantic["--miu-color-surface-mica-bg"] ?? "",
      "--miu-material-border": semantic["--miu-glass-hairline"] ?? "",
      "--miu-material-backdrop": semantic["--miu-glass-filter-thin"] ?? "",
      "--miu-material-highlight": semantic["--miu-color-surface-glass-highlight"] ?? "",
    }
  },
}

export const glassMaterial: MaterialPlugin = {
  name: "glass",
  fallback: "mica",
  fallbackCondition: "(prefers-reduced-transparency: reduce)",
  generateTokens(theme) {
    const semantic = semanticTokens(theme.theme)
    return {
      "--miu-material-surface": semantic["--miu-glass-surface-regular"] ?? "",
      "--miu-material-border": semantic["--miu-glass-hairline"] ?? "",
      "--miu-material-backdrop": semantic["--miu-glass-filter-regular"] ?? "",
      "--miu-material-highlight": semantic["--miu-color-surface-glass-highlight"] ?? "",
    }
  },
}

export const materialPlugins = {
  solid: solidMaterial,
  mica: micaMaterial,
  glass: glassMaterial,
} as const
