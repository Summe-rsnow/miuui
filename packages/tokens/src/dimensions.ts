export const CONTROL_SIZES = ["xs", "sm", "md", "lg", "xl", "2xl"] as const
export type ControlSize = (typeof CONTROL_SIZES)[number]
export const DEFAULT_CONTROL_SIZE: ControlSize = "md"

export const DENSITIES = ["compact", "default", "comfortable"] as const
export type Density = (typeof DENSITIES)[number]
export const DEFAULT_DENSITY: Density = "default"

export const RADII = ["none", "sm", "md", "lg", "full"] as const
export type Radius = (typeof RADII)[number]
export const DEFAULT_RADIUS: Radius = "md"

export const ICON_SIZES = ["xs", "sm", "md", "lg", "xl"] as const
export type IconSize = (typeof ICON_SIZES)[number]
export const DEFAULT_ICON_SIZE: IconSize = "md"

export const MATERIALS = ["solid", "mica", "glass"] as const
export type MaterialName = (typeof MATERIALS)[number] | (string & {})
export const DEFAULT_MATERIAL: MaterialName = "solid"

export const MOTION_TIERS = ["full", "reduced", "none"] as const
export type MotionTier = (typeof MOTION_TIERS)[number] | (string & {})
export const DEFAULT_MOTION_TIER: MotionTier = "full"

export interface ControlSizeValues {
  height: string
  paddingX: string
  fontSize: string
  gap: string
}

export const CONTROL_SIZE_VALUES: Record<ControlSize, ControlSizeValues> = {
  xs: { height: "24px", paddingX: "8px", fontSize: "11px", gap: "4px" },
  sm: { height: "28px", paddingX: "10px", fontSize: "12px", gap: "6px" },
  md: { height: "32px", paddingX: "12px", fontSize: "13px", gap: "6px" },
  lg: { height: "38px", paddingX: "14px", fontSize: "14px", gap: "8px" },
  xl: { height: "44px", paddingX: "18px", fontSize: "15px", gap: "8px" },
  "2xl": { height: "52px", paddingX: "22px", fontSize: "18px", gap: "10px" },
}

export interface DensityValues {
  gap: string
  rowHeight: string
  padding: string
}

export const DENSITY_VALUES: Record<Density, DensityValues> = {
  compact: { gap: "4px", rowHeight: "32px", padding: "6px" },
  default: { gap: "8px", rowHeight: "40px", padding: "10px" },
  comfortable: { gap: "12px", rowHeight: "48px", padding: "14px" },
}

export const RADIUS_VALUES: Record<Radius, string> = {
  none: "0px",
  sm: "6px",
  md: "10px",
  lg: "16px",
  full: "9999px",
}

export const ICON_SIZE_VALUES: Record<IconSize, string> = {
  xs: "12px",
  sm: "14px",
  md: "16px",
  lg: "20px",
  xl: "24px",
}

/** Icon size defaults derived from control size; explicit `iconSize` wins. */
export const ICON_SIZE_BY_CONTROL: Record<ControlSize, IconSize> = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "md",
  xl: "lg",
  "2xl": "lg",
}

export const CONTROL_HEIGHT_BY_DENSITY: Record<Density, ControlSize> = {
  compact: "sm",
  default: "md",
  comfortable: "lg",
}

export const DIALOG_WIDTH_VALUES = {
  sm: "360px",
  md: "480px",
  lg: "640px",
  xl: "800px",
} as const
export type DialogSize = keyof typeof DIALOG_WIDTH_VALUES

export const MOTION_VALUES = {
  durationFast: "150ms",
  durationBase: "260ms",
  durationSlow: "380ms",
  easeOut: "cubic-bezier(0.22, 1, 0.36, 1)",
  easeIn: "cubic-bezier(0.7, 0, 0.84, 0)",
  easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  easeSpring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  translateSm: "8px",
  translateMd: "16px",
  scaleActive: "0.95",
  scaleSubtle: "0.98",
  scaleHover: "1.12",
  scaleEnter: "0.84",
  scalePop: "0.35",
  drawerOffset: "100%",
  loopDuration: "1200ms",
} as const

export const FOCUS_RING = {
  width: "2px",
  offset: "2px",
} as const

export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const

export interface ShadowSpec {
  color: string
  offsetX: string
  offsetY: string
  blur: string
  spread: string
}

export const SHADOW_VALUES: Record<1 | 2 | 3 | 4 | 5, ShadowSpec> = {
  1: { color: "oklch(0 0 0 / 0.06)", offsetX: "0px", offsetY: "1px", blur: "2px", spread: "0px" },
  2: { color: "oklch(0 0 0 / 0.08)", offsetX: "0px", offsetY: "2px", blur: "8px", spread: "0px" },
  3: { color: "oklch(0 0 0 / 0.1)", offsetX: "0px", offsetY: "8px", blur: "24px", spread: "0px" },
  4: { color: "oklch(0 0 0 / 0.14)", offsetX: "0px", offsetY: "16px", blur: "40px", spread: "0px" },
  5: { color: "oklch(0 0 0 / 0.18)", offsetX: "0px", offsetY: "24px", blur: "64px", spread: "0px" },
}

export function shadowToCss(shadow: ShadowSpec): string {
  return `${shadow.offsetX} ${shadow.offsetY} ${shadow.blur} ${shadow.spread} ${shadow.color}`
}

export const TYPOGRAPHY = {
  fontFamily:
    "'OPPO Sans', 'OPPO Sans 4.0', 'Sarasa UI SC', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  monoFamily:
    "'SFMono-Regular', 'Cascadia Code', 'Segoe UI Mono', Consolas, 'Liberation Mono', monospace",
  xs: "12px",
  sm: "14px",
  base: "16px",
  md: "16px",
  lg: "20px",
  xl: "24px",
  "2xl": "32px",
  "3xl": "40px",
  "4xl": "48px",
  code: "13px",
  captionLine: "16px",
  smallLine: "20px",
  bodyLine: "24px",
  h4Line: "28px",
  h3Line: "32px",
  h2Line: "40px",
  h1Line: "48px",
  displayLine: "56px",
  codeLine: "20px",
  weightRegular: "400",
  weightMedium: "500",
  weightSemibold: "600",
  weightBold: "700",
} as const
