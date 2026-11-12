import type { Density, MaterialName, MotionTier, Radius } from "./types"

export type ThemeMode = "light" | "dark" | "system"

export interface ThemeContext {
  theme: "light" | "dark"
  density: Density
  radius: Radius
  material: MaterialName
  motionTier: MotionTier
}

export const defaultThemeContext: ThemeContext = {
  theme: "light",
  density: "default",
  radius: "md",
  material: "solid",
  motionTier: "full",
}

export type ThemeAttributes = Record<
  "data-theme" | "data-density" | "data-radius" | "data-material" | "data-motion-tier",
  string
>

export function themeAttributes(context: Partial<ThemeContext> = {}): ThemeAttributes {
  return {
    "data-theme": context.theme ?? defaultThemeContext.theme,
    "data-density": context.density ?? defaultThemeContext.density,
    "data-radius": context.radius ?? defaultThemeContext.radius,
    "data-material": context.material ?? defaultThemeContext.material,
    "data-motion-tier": context.motionTier ?? defaultThemeContext.motionTier,
  }
}

/**
 * SSR-safe first-paint theme injection. Returns a complete `<script>` tag that
 * writes the theme attributes before Vue hydrates, preventing FOUC.
 */
export function getThemeInitScript(context: Partial<ThemeContext> = {}): string {
  const attributes = themeAttributes(context)
  const statements = Object.entries(attributes)
    .map(([name, value]) => {
      const safeName = JSON.stringify(name)
      const safeValue = JSON.stringify(value)
      return `r.setAttribute(${safeName},${safeValue})`
    })
    .join(";")
  const script = `(function(){var r=document.documentElement;${statements}})();`
  return `<script>${script.replaceAll("<", "\\u003c")}</script>`
}

export const THEME_STORAGE_KEY = "miuui-theme"
