import {
  DEFAULT_CONTROL_SIZE,
  DEFAULT_ICON_SIZE,
  ICON_SIZE_BY_CONTROL,
  type ControlSize,
  type Density,
  type IconSize,
  type MaterialName,
  type MotionTier,
  type Radius,
} from "@xcmm1543/miuui-tokens"

export {
  CONTROL_SIZES,
  DENSITIES,
  RADII,
  ICON_SIZES,
  MATERIALS,
  MOTION_TIERS,
  DEFAULT_CONTROL_SIZE,
  DEFAULT_DENSITY,
  DEFAULT_RADIUS,
  DEFAULT_ICON_SIZE,
  DEFAULT_MATERIAL,
  DEFAULT_MOTION_TIER,
  CONTROL_SIZE_VALUES,
  DENSITY_VALUES,
  RADIUS_VALUES,
  ICON_SIZE_VALUES,
  ICON_SIZE_BY_CONTROL,
  DIALOG_WIDTH_VALUES,
  MOTION_VALUES,
  FOCUS_RING,
  Z_INDEX,
  SHADOW_VALUES,
  TYPOGRAPHY,
} from "@xcmm1543/miuui-tokens"

export type { ControlSize, Density, IconSize, MaterialName, MotionTier, Radius }

export interface SemanticRegionMap {
  [region: string]: string | undefined
}

export interface ComponentSemanticProps<Region extends string> {
  classNames?: Partial<Record<Region, string>>
  styles?: Partial<Record<Region, string | Record<string, string>>>
}

export interface SizeContext {
  size?: ControlSize
  density?: Density
  radius?: Radius | "default"
  iconSize?: IconSize
}

export interface ResolvedIconSize {
  size: IconSize
  derived: boolean
}

/**
 * Explicit `iconSize` always wins. Otherwise the theme mapping derives it from
 * the control size, so components never hard-code icon pixels.
 */
export function resolveIconSize(
  size: ControlSize = DEFAULT_CONTROL_SIZE,
  iconSize?: IconSize,
): ResolvedIconSize {
  if (iconSize) return { size: iconSize, derived: false }
  return {
    size: ICON_SIZE_BY_CONTROL[size] ?? DEFAULT_ICON_SIZE,
    derived: true,
  }
}

export interface ResolvedControlSize {
  size: ControlSize
  fallback: boolean
}

export function resolveControlSize(
  value: string | undefined,
  supported: readonly ControlSize[],
  fallback: ControlSize = DEFAULT_CONTROL_SIZE,
): ResolvedControlSize {
  if (!value) return { size: fallback, fallback: false }
  if (supported.includes(value as ControlSize)) {
    return { size: value as ControlSize, fallback: false }
  }
  return { size: fallback, fallback: true }
}
