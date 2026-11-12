import { formatOklch } from "./color"
import { BRAND_PALETTE, STATUS_SEEDS, type ColorScale, generateScale } from "./palette"
import {
  CONTROL_SIZE_VALUES,
  CONTROL_SIZES,
  DENSITY_VALUES,
  DENSITIES,
  DIALOG_WIDTH_VALUES,
  FOCUS_RING,
  ICON_SIZE_VALUES,
  ICON_SIZES,
  MOTION_VALUES,
  RADII,
  RADIUS_VALUES,
  SHADOW_VALUES,
  TYPOGRAPHY,
  Z_INDEX,
  shadowToCss,
} from "./dimensions"

export type ThemeName = "light" | "dark"
export type TokenMap = Record<string, string>

const scaleTokens = (prefix: string, scale: ColorScale): TokenMap =>
  Object.fromEntries(
    Object.entries(scale).map(([stop, value]) => [`--miu-${prefix}-${stop}`, value]),
  )

const statusScales = {
  danger: generateScale(STATUS_SEEDS.danger),
  success: generateScale(STATUS_SEEDS.success),
  warning: generateScale(STATUS_SEEDS.warning),
  info: generateScale(STATUS_SEEDS.info),
} satisfies Record<string, ColorScale>

export const PRIMITIVE_COLORS: TokenMap = {
  ...scaleTokens("violet", BRAND_PALETTE.primary),
  ...scaleTokens("gray", BRAND_PALETTE.neutral),
  ...Object.fromEntries(
    Object.entries(statusScales).flatMap(([name, scale]) =>
      Object.entries(scaleTokens(name, scale)),
    ),
  ),
  "--miu-white": "#FFFFFF",
  "--miu-ink": "#0B0B0F",
}

export function semanticTokens(theme: ThemeName): TokenMap {
  if (theme === "dark") {
    return {
      "--miu-color-bg-canvas": "var(--miu-gray-950)",
      "--miu-color-bg-surface": "var(--miu-gray-900)",
      "--miu-color-bg-elevated": "var(--miu-gray-800)",
      "--miu-color-bg-overlay": "var(--miu-gray-800)",
      "--miu-color-bg-muted": "var(--miu-gray-800)",
      "--miu-color-bg-inverse": "var(--miu-gray-50)",
      "--miu-color-text-primary": "var(--miu-gray-50)",
      "--miu-color-text-secondary": "var(--miu-gray-300)",
      "--miu-color-text-muted": "var(--miu-gray-400)",
      "--miu-color-text-inverse": "var(--miu-gray-950)",
      "--miu-color-text-on-primary": "#0B0B0F",
      "--miu-color-border-subtle": "oklch(1 0 0 / 0.1)",
      "--miu-color-border-default": "oklch(1 0 0 / 0.18)",
      "--miu-color-border-strong": "var(--miu-gray-600)",
      "--miu-color-primary": "var(--miu-violet-500)",
      "--miu-color-primary-hover": "var(--miu-violet-400)",
      "--miu-color-primary-active": "var(--miu-violet-300)",
      "--miu-color-primary-subtle": "var(--miu-violet-900)",
      "--miu-color-primary-text": "var(--miu-violet-300)",
      "--miu-color-primary-contrast": "var(--miu-violet-500)",
      "--miu-color-on-primary-subtle": "var(--miu-gray-50)",
      "--miu-color-danger": "var(--miu-danger-500)",
      "--miu-color-danger-hover": "var(--miu-danger-400)",
      "--miu-color-danger-text": "var(--miu-danger-300)",
      "--miu-color-danger-on": "var(--miu-ink)",
      "--miu-color-danger-subtle": "var(--miu-danger-950)",
      "--miu-color-success": "var(--miu-success-400)",
      "--miu-color-success-text": "var(--miu-success-400)",
      "--miu-color-success-subtle": "var(--miu-success-950)",
      "--miu-color-warning": "var(--miu-warning-400)",
      "--miu-color-warning-text": "var(--miu-warning-400)",
      "--miu-color-warning-subtle": "var(--miu-warning-950)",
      "--miu-color-info": "var(--miu-info-400)",
      "--miu-color-info-text": "var(--miu-info-400)",
      "--miu-color-info-subtle": "var(--miu-info-950)",
      "--miu-color-focus-ring": "var(--miu-violet-400)",
      "--miu-color-selection": "var(--miu-violet-800)",
      "--miu-color-overlay": "oklch(0 0 0 / 0.68)",
      "--miu-color-surface-solid-bg": "var(--miu-gray-900)",
      "--miu-color-surface-mica-bg": "oklch(0.21 0.014 305 / 0.82)",
      "--miu-color-surface-glass-bg": "oklch(0.21 0.014 305 / 0.56)",
      "--miu-color-surface-glass-border": "oklch(1 0 0 / 0.14)",
      "--miu-color-surface-glass-highlight": "oklch(1 0 0 / 0.16)",
      "--miu-color-shadow": "oklch(0 0 0 / 0.5)",
      "--miu-scrollbar-thumb": "oklch(0.85 0.02 305 / 0.6)",
      "--miu-scrollbar-thumb-hover": "oklch(0.85 0.02 305 / 0.85)",
      "--miu-scrollbar-track": "transparent",
    }
  }

  return {
    "--miu-color-bg-canvas": "var(--miu-gray-50)",
    "--miu-color-bg-surface": "var(--miu-white)",
    "--miu-color-bg-elevated": "var(--miu-white)",
    "--miu-color-bg-overlay": "var(--miu-white)",
    "--miu-color-bg-muted": "var(--miu-gray-100)",
    "--miu-color-bg-inverse": "var(--miu-gray-950)",
    "--miu-color-text-primary": "var(--miu-gray-950)",
    "--miu-color-text-secondary": "var(--miu-gray-700)",
    "--miu-color-text-muted": "var(--miu-gray-700)",
    "--miu-color-text-inverse": "var(--miu-white)",
    "--miu-color-text-on-primary": "#FFFFFF",
    "--miu-color-border-subtle": "var(--miu-gray-200)",
    "--miu-color-border-default": "var(--miu-gray-300)",
    "--miu-color-border-strong": "var(--miu-gray-600)",
    "--miu-color-primary": "var(--miu-violet-700)",
    "--miu-color-primary-hover": "var(--miu-violet-800)",
    "--miu-color-primary-active": "var(--miu-violet-900)",
    "--miu-color-primary-subtle": "var(--miu-violet-100)",
    "--miu-color-primary-text": "var(--miu-violet-700)",
    "--miu-color-primary-contrast": "var(--miu-violet-700)",
    "--miu-color-on-primary-subtle": "var(--miu-violet-900)",
    "--miu-color-danger": "var(--miu-danger-700)",
    "--miu-color-danger-hover": "var(--miu-danger-800)",
    "--miu-color-danger-text": "var(--miu-danger-700)",
    "--miu-color-danger-on": "var(--miu-white)",
    "--miu-color-danger-subtle": "var(--miu-danger-100)",
    "--miu-color-success": "var(--miu-success-700)",
    "--miu-color-success-text": "var(--miu-success-700)",
    "--miu-color-success-subtle": "var(--miu-success-100)",
    "--miu-color-warning": "var(--miu-warning-700)",
    "--miu-color-warning-text": "var(--miu-warning-700)",
    "--miu-color-warning-subtle": "var(--miu-warning-100)",
    "--miu-color-info": "var(--miu-info-700)",
    "--miu-color-info-text": "var(--miu-info-700)",
    "--miu-color-info-subtle": "var(--miu-info-100)",
    "--miu-color-focus-ring": "var(--miu-violet-600)",
    "--miu-color-selection": "var(--miu-violet-200)",
    "--miu-color-overlay": "oklch(0 0 0 / 0.56)",
    "--miu-color-surface-solid-bg": "var(--miu-white)",
    "--miu-color-surface-mica-bg": `${formatOklch({ l: 0.99, c: 0.004, h: 305 }, 0.82)}`,
    "--miu-color-surface-glass-bg": `${formatOklch({ l: 0.99, c: 0.004, h: 305 }, 0.58)}`,
    "--miu-color-surface-glass-border": "oklch(1 0 0 / 0.6)",
    "--miu-color-surface-glass-highlight": "oklch(1 0 0 / 0.78)",
    "--miu-color-shadow": "oklch(0 0 0 / 0.1)",
    "--miu-scrollbar-thumb": "oklch(0.42 0.02 305 / 0.6)",
    "--miu-scrollbar-thumb-hover": "oklch(0.42 0.02 305 / 0.85)",
    "--miu-scrollbar-track": "transparent",
  }
}

export function dimensionTokens(): TokenMap {
  const tokens: TokenMap = {}

  for (const size of CONTROL_SIZES) {
    const values = CONTROL_SIZE_VALUES[size]
    tokens[`--miu-control-${size}-height`] = values.height
    tokens[`--miu-control-${size}-padding-x`] = values.paddingX
    tokens[`--miu-control-${size}-font-size`] = values.fontSize
    tokens[`--miu-control-${size}-gap`] = values.gap
  }

  for (const density of DENSITIES) {
    const values = DENSITY_VALUES[density]
    tokens[`--miu-density-${density}-gap`] = values.gap
    tokens[`--miu-density-${density}-row-height`] = values.rowHeight
    tokens[`--miu-density-${density}-padding`] = values.padding
  }

  for (const radius of RADII) {
    tokens[`--miu-radius-${radius}`] = RADIUS_VALUES[radius]
  }

  for (const iconSize of ICON_SIZES) {
    tokens[`--miu-icon-size-${iconSize}`] = ICON_SIZE_VALUES[iconSize]
  }

  for (const [size, width] of Object.entries(DIALOG_WIDTH_VALUES)) {
    tokens[`--miu-dialog-width-${size}`] = width
  }

  return tokens
}

export function foundationTokens(): TokenMap {
  return {
    "--miu-font-family": TYPOGRAPHY.fontFamily,
    "--miu-font-mono": TYPOGRAPHY.monoFamily,
    "--miu-text-xs": TYPOGRAPHY.xs,
    "--miu-text-sm": TYPOGRAPHY.sm,
    "--miu-text-base": TYPOGRAPHY.base,
    "--miu-text-md": TYPOGRAPHY.md,
    "--miu-text-lg": TYPOGRAPHY.lg,
    "--miu-text-xl": TYPOGRAPHY.xl,
    "--miu-text-2xl": TYPOGRAPHY["2xl"],
    "--miu-text-3xl": TYPOGRAPHY["3xl"],
    "--miu-text-4xl": TYPOGRAPHY["4xl"],
    "--miu-text-caption-size": TYPOGRAPHY.xs,
    "--miu-text-caption-line": TYPOGRAPHY.captionLine,
    "--miu-text-small-size": TYPOGRAPHY.sm,
    "--miu-text-small-line": TYPOGRAPHY.smallLine,
    "--miu-text-body-size": TYPOGRAPHY.base,
    "--miu-text-body-line": TYPOGRAPHY.bodyLine,
    "--miu-text-h4-size": TYPOGRAPHY.lg,
    "--miu-text-h4-line": TYPOGRAPHY.h4Line,
    "--miu-text-h3-size": TYPOGRAPHY.xl,
    "--miu-text-h3-line": TYPOGRAPHY.h3Line,
    "--miu-text-h2-size": TYPOGRAPHY["2xl"],
    "--miu-text-h2-line": TYPOGRAPHY.h2Line,
    "--miu-text-h1-size": TYPOGRAPHY["3xl"],
    "--miu-text-h1-line": TYPOGRAPHY.h1Line,
    "--miu-text-display-size": TYPOGRAPHY["4xl"],
    "--miu-text-display-line": TYPOGRAPHY.displayLine,
    "--miu-text-code-size": TYPOGRAPHY.code,
    "--miu-text-code-line": TYPOGRAPHY.codeLine,
    "--miu-font-weight-regular": TYPOGRAPHY.weightRegular,
    "--miu-font-weight-medium": TYPOGRAPHY.weightMedium,
    "--miu-font-weight-semibold": TYPOGRAPHY.weightSemibold,
    "--miu-font-weight-bold": TYPOGRAPHY.weightBold,
    "--miu-border-width": "1px",
    "--miu-border-width-strong": "3px",
    "--miu-spinner-stroke-width": "2px",
    "--miu-dialog-max-height": "85vh",
    "--miu-scrollbar-size": "6px",
    "--miu-space-1": "4px",
    "--miu-space-2": "8px",
    "--miu-space-3": "12px",
    "--miu-space-4": "16px",
    "--miu-space-5": "20px",
    "--miu-space-6": "24px",
    "--miu-space-8": "32px",
    "--miu-space-12": "48px",
    "--miu-space-16": "64px",
    "--miu-space-24": "96px",
    "--miu-motion-duration-fast": MOTION_VALUES.durationFast,
    "--miu-motion-duration-base": MOTION_VALUES.durationBase,
    "--miu-motion-duration-slow": MOTION_VALUES.durationSlow,
    "--miu-motion-ease-out": MOTION_VALUES.easeOut,
    "--miu-motion-ease-in": MOTION_VALUES.easeIn,
    "--miu-motion-ease-in-out": MOTION_VALUES.easeInOut,
    "--miu-motion-translate-sm": MOTION_VALUES.translateSm,
    "--miu-motion-translate-md": MOTION_VALUES.translateMd,
    "--miu-motion-scale-active": MOTION_VALUES.scaleActive,
    "--miu-motion-loop-duration": MOTION_VALUES.loopDuration,
    "--miu-focus-ring-width": FOCUS_RING.width,
    "--miu-focus-ring-offset": FOCUS_RING.offset,
    "--miu-z-dropdown": String(Z_INDEX.dropdown),
    "--miu-z-sticky": String(Z_INDEX.sticky),
    "--miu-z-modal-backdrop": String(Z_INDEX.modalBackdrop),
    "--miu-z-modal": String(Z_INDEX.modal),
    "--miu-z-popover": String(Z_INDEX.popover),
    "--miu-z-tooltip": String(Z_INDEX.tooltip),
    "--miu-z-toast": String(Z_INDEX.toast),
    ...Object.fromEntries(
      Object.entries(SHADOW_VALUES).map(([level, spec]) => [
        `--miu-shadow-${level}`,
        shadowToCss(spec),
      ]),
    ),
  }
}

export function buildTokenCss(): string {
  const light = semanticTokens("light")
  const dark = semanticTokens("dark")
  const dimensions = dimensionTokens()
  const foundation = foundationTokens()

  const lines: string[] = []
  lines.push("@layer miu-reset, miu-tokens, miu-base, miu-material, miu-motion, miu-override;")
  lines.push("")
  lines.push("@layer miu-tokens {")
  lines.push("  :root {")
  lines.push("    color-scheme: light;")
  for (const [name, value] of Object.entries(PRIMITIVE_COLORS)) {
    lines.push(`    ${name}: ${value};`)
  }
  for (const [name, value] of Object.entries(dimensions)) {
    lines.push(`    ${name}: ${value};`)
  }
  for (const [name, value] of Object.entries(foundation)) {
    lines.push(`    ${name}: ${value};`)
  }
  lines.push("    --miu-radius-default: var(--miu-radius-md);")
  lines.push("  }")
  lines.push("")
  lines.push("  :root,")
  lines.push('  [data-theme="light"] {')
  for (const [name, value] of Object.entries(light)) {
    lines.push(`    ${name}: ${value};`)
  }
  lines.push("  }")
  lines.push("")
  lines.push('  [data-theme="dark"] {')
  lines.push("    color-scheme: dark;")
  for (const [name, value] of Object.entries(dark)) {
    lines.push(`    ${name}: ${value};`)
  }
  lines.push("  }")
  lines.push("")

  for (const radius of ["none", "sm", "md", "lg", "full"] as const) {
    lines.push(`  [data-radius="${radius}"] {`)
    lines.push(`    --miu-radius-default: var(--miu-radius-${radius});`)
    lines.push("  }")
  }

  lines.push("")
  for (const density of DENSITIES) {
    lines.push(`  [data-density="${density}"] {`)
    lines.push(`    --miu-density-gap-current: var(--miu-density-${density}-gap);`)
    lines.push(`    --miu-density-row-height-current: var(--miu-density-${density}-row-height);`)
    lines.push(`    --miu-density-padding-current: var(--miu-density-${density}-padding);`)
    lines.push("  }")
  }
  lines.push("}")

  return `${lines.join("\n")}\n`
}

export function buildDtcg(): Record<string, unknown> {
  const colorGroup = (scale: ColorScale): Record<string, unknown> =>
    Object.fromEntries(
      Object.entries(scale).map(([stop, value]) => [stop, { $type: "color", $value: value }]),
    )

  const colorSemantic = Object.fromEntries(
    Object.entries(semanticTokens("light"))
      .filter(([name]) => name.startsWith("--miu-color-"))
      .map(([name, value]) => {
        const key = name.replace("--miu-color-", "")
        const alias = value.match(/^var\(--miu-(.+)\)$/)
        const aliasName = alias?.[1]
        const resolved = aliasName ? `{color.${aliasName.replaceAll("-", ".")}}` : value
        return [key, { $type: "color", $value: resolved }]
      }),
  )

  const scrollbar = {
    size: {
      $type: "dimension",
      $value: foundationTokens()["--miu-scrollbar-size"] ?? "6px",
    },
    ...Object.fromEntries(
      Object.entries(semanticTokens("light"))
        .filter(([name]) => name.startsWith("--miu-scrollbar-") && name !== "--miu-scrollbar-size")
        .map(([name, value]) => [
          name.replace("--miu-scrollbar-", ""),
          { $type: "color", $value: value },
        ]),
    ),
  }

  const control = Object.fromEntries(
    CONTROL_SIZES.map((size) => {
      const values = CONTROL_SIZE_VALUES[size]
      return [
        size,
        {
          height: { $type: "dimension", $value: values.height },
          paddingX: { $type: "dimension", $value: values.paddingX },
          fontSize: { $type: "dimension", $value: values.fontSize },
          gap: { $type: "dimension", $value: values.gap },
        },
      ]
    }),
  )

  const density = Object.fromEntries(
    DENSITIES.map((name) => {
      const values = DENSITY_VALUES[name]
      return [
        name,
        {
          gap: { $type: "dimension", $value: values.gap },
          rowHeight: { $type: "dimension", $value: values.rowHeight },
          padding: { $type: "dimension", $value: values.padding },
        },
      ]
    }),
  )

  const radius = Object.fromEntries(
    RADII.map((name) => [name, { $type: "dimension", $value: RADIUS_VALUES[name] }]),
  )

  const iconSize = Object.fromEntries(
    ICON_SIZES.map((name) => [name, { $type: "dimension", $value: ICON_SIZE_VALUES[name] }]),
  )

  const shadow = Object.fromEntries(
    Object.entries(SHADOW_VALUES).map(([level, spec]) => [
      level,
      {
        $type: "shadow",
        $value: {
          color: spec.color,
          offsetX: spec.offsetX,
          offsetY: spec.offsetY,
          blur: spec.blur,
          spread: spec.spread,
        },
      },
    ]),
  )

  return {
    color: {
      violet: colorGroup(BRAND_PALETTE.primary),
      gray: colorGroup(BRAND_PALETTE.neutral),
      danger: colorGroup(statusScales.danger),
      success: colorGroup(statusScales.success),
      warning: colorGroup(statusScales.warning),
      info: colorGroup(statusScales.info),
      white: { $type: "color", $value: PRIMITIVE_COLORS["--miu-white"] },
      ink: { $type: "color", $value: PRIMITIVE_COLORS["--miu-ink"] },
      semantic: colorSemantic,
    },
    scrollbar,
    control,
    density,
    radius,
    iconSize,
    shadow,
    z: Object.fromEntries(
      Object.entries(Z_INDEX).map(([name, value]) => [name, { $type: "number", $value: value }]),
    ),
    motion: {
      duration: {
        fast: { $type: "duration", $value: MOTION_VALUES.durationFast },
        base: { $type: "duration", $value: MOTION_VALUES.durationBase },
        slow: { $type: "duration", $value: MOTION_VALUES.durationSlow },
      },
      easing: {
        out: { $type: "cubicBezier", $value: [0.16, 1, 0.3, 1] },
        in: { $type: "cubicBezier", $value: [0.7, 0, 0.84, 0] },
        inOut: { $type: "cubicBezier", $value: [0.65, 0, 0.35, 1] },
      },
    },
    font: {
      family: { $type: "fontFamily", $value: TYPOGRAPHY.fontFamily },
      size: {
        xs: { $type: "dimension", $value: TYPOGRAPHY.xs },
        sm: { $type: "dimension", $value: TYPOGRAPHY.sm },
        base: { $type: "dimension", $value: TYPOGRAPHY.base },
        md: { $type: "dimension", $value: TYPOGRAPHY.md },
        lg: { $type: "dimension", $value: TYPOGRAPHY.lg },
        xl: { $type: "dimension", $value: TYPOGRAPHY.xl },
        "2xl": { $type: "dimension", $value: TYPOGRAPHY["2xl"] },
        "3xl": { $type: "dimension", $value: TYPOGRAPHY["3xl"] },
        "4xl": { $type: "dimension", $value: TYPOGRAPHY["4xl"] },
        code: { $type: "dimension", $value: TYPOGRAPHY.code },
      },
    },
    focus: {
      width: { $type: "dimension", $value: FOCUS_RING.width },
      offset: { $type: "dimension", $value: FOCUS_RING.offset },
    },
  }
}
