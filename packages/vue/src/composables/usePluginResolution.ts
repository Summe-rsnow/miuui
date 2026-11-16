import { computed, type ComputedRef, type StyleValue } from "vue"
import {
  registry,
  type MaterialName,
  type MotionTier,
  type ThemeContext,
} from "@xcmm1543/miuui-core"
import { useMiuTheme } from "./useMiu"

const BUILTIN_MATERIALS: Record<string, true> = {
  solid: true,
  mica: true,
  glass: true,
}

const BUILTIN_MOTIONS: Record<string, true> = {
  full: true,
  reduced: true,
  none: true,
}

export interface ResolvedPluginResult<T extends string> {
  name: T
  tokens: Record<string, string> | undefined
  fallbackUsed: boolean
}

/**
 * Resolves a material name through `MiuRegistry` first (for custom or overridden
 * JS plugins), then built-in CSS materials, and safely falls back to `"solid"`
 * with a DEV warning when an unknown material name is passed.
 */
export function resolveMaterialValue(
  requested: MaterialName | undefined,
  theme: ThemeContext,
  componentName: string,
): ResolvedPluginResult<MaterialName> {
  if (!requested) {
    return { name: theme.material, tokens: undefined, fallbackUsed: false }
  }

  const registered = registry.getMaterial(requested)
  if (registered) {
    const resolved = registry.resolveMaterial(requested)
    const plugin = resolved.plugin
    return {
      name: plugin?.name ?? "solid",
      tokens: plugin?.generateTokens(theme, theme.motionTier),
      fallbackUsed: resolved.fallbackUsed,
    }
  }

  if (Object.hasOwn(BUILTIN_MATERIALS, requested)) {
    return { name: requested, tokens: undefined, fallbackUsed: false }
  }

  const fallback = registry.resolveMaterial(requested)
  if (import.meta.env.DEV) {
    console.warn(
      `[μui] ${componentName}: unregistered material "${requested}", fell back to "${fallback.plugin?.name ?? "solid"}".`,
    )
  }
  const plugin = fallback.plugin
  return {
    name: plugin?.name ?? "solid",
    tokens: plugin?.generateTokens(theme, theme.motionTier),
    fallbackUsed: true,
  }
}

export function resolveMotionValue(
  requested: MotionTier | undefined,
  componentName: string,
): ResolvedPluginResult<MotionTier> {
  if (!requested) {
    return { name: "full", tokens: undefined, fallbackUsed: false }
  }

  const registered = registry.getMotionTier(requested)
  if (registered) {
    const resolved = registry.resolveMotionTier(requested)
    const plugin = resolved.plugin
    return {
      name: plugin?.name ?? "full",
      tokens: plugin?.getTokenOverrides(),
      fallbackUsed: resolved.fallbackUsed,
    }
  }

  if (Object.hasOwn(BUILTIN_MOTIONS, requested)) {
    return { name: requested, tokens: undefined, fallbackUsed: false }
  }

  const fallback = registry.resolveMotionTier(requested)
  if (import.meta.env.DEV) {
    console.warn(
      `[μui] ${componentName}: unregistered motionTier "${requested}", fell back to "${fallback.plugin?.name ?? "full"}".`,
    )
  }
  const plugin = fallback.plugin
  return {
    name: plugin?.name ?? "full",
    tokens: plugin?.getTokenOverrides(),
    fallbackUsed: true,
  }
}

/**
 * Component-level helper that resolves an optional `material` prop via
 * `MiuRegistry`, emits a DEV warning for unknown names, and returns both the
 * resolved `data-material` string and any plugin CSS variable overrides.
 */
export function useResolvedMaterial(
  material: () => MaterialName | undefined,
  componentName: string,
): {
  materialName: ComputedRef<MaterialName | undefined>
  materialTokens: ComputedRef<Record<string, string> | undefined>
} {
  const theme = useMiuTheme()
  const resolved = computed(() => {
    const requested = material()
    if (requested === undefined) return undefined
    const ctx: ThemeContext = {
      theme: theme.theme.value,
      density: theme.density.value,
      radius: theme.radius.value,
      material: theme.material.value,
      motionTier: theme.motionTier.value,
    }
    return resolveMaterialValue(requested, ctx, componentName)
  })

  return {
    materialName: computed(() => resolved.value?.name),
    materialTokens: computed(() => resolved.value?.tokens),
  }
}

export function mergeStyle(
  base: string | Record<string, string> | undefined,
  tokens: Record<string, string> | undefined,
): StyleValue | undefined {
  if (!tokens) return base
  if (!base) return tokens
  if (typeof base === "string") return [tokens, base]
  return { ...tokens, ...base }
}
