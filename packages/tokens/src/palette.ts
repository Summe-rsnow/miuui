import { hexToOklch, normalizeHex, oklchToHex } from "./color"

export const SCALE_STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
export type ScaleStop = (typeof SCALE_STOPS)[number]
export type ColorScale = Record<ScaleStop, string>

export const VIOLET_SEED = "#9A49E0"

/** Canonical brand palette from design/brand/violet.json. */
export const VIOLET_SCALE: ColorScale = {
  50: "#F9F4FF",
  100: "#F2E8FF",
  200: "#E8D7FF",
  300: "#DBBDFF",
  400: "#CB9DFF",
  500: "#BC78FF",
  600: "#A758EF",
  700: "#8F43D0",
  800: "#7534AD",
  900: "#5A2687",
  950: "#401C5F",
}

export const STATUS_SEEDS = {
  danger: "#E5484D",
  success: "#30A46C",
  warning: "#F5A524",
  info: "#3B82F6",
} as const

export type StatusName = keyof typeof STATUS_SEEDS

const LIGHTNESS: Record<ScaleStop, number> = {
  50: 0.975,
  100: 0.948,
  200: 0.905,
  300: 0.842,
  400: 0.76,
  500: 0.675,
  600: 0.59,
  700: 0.515,
  800: 0.44,
  900: 0.365,
  950: 0.28,
}

const CHROMA_FACTOR: Record<ScaleStop, number> = {
  50: 0.07,
  100: 0.12,
  200: 0.2,
  300: 0.33,
  400: 0.52,
  500: 0.72,
  600: 0.9,
  700: 1,
  800: 0.92,
  900: 0.78,
  950: 0.62,
}

function scaleFromSeed(seed: string, lightness: Record<ScaleStop, number>): ColorScale {
  const base = hexToOklch(seed)
  const result = {} as ColorScale
  for (const stop of SCALE_STOPS) {
    const chroma = Math.min(0.37, base.c * CHROMA_FACTOR[stop])
    result[stop] = oklchToHex({ l: lightness[stop], c: chroma, h: base.h })
  }
  return result
}

/** Generate 11 perceptually spaced levels from one seed, with the hue locked. */
export function generateScale(seed: string): ColorScale {
  if (normalizeHex(seed) === VIOLET_SEED) {
    return { ...VIOLET_SCALE }
  }
  return scaleFromSeed(seed, LIGHTNESS)
}

/** Near-neutral scale tinted by the seed hue; never a pure gray. */
export function generateNeutralScale(seed: string): ColorScale {
  const hue = hexToOklch(seed).h
  const light: Record<ScaleStop, number> = {
    50: 0.989,
    100: 0.972,
    200: 0.939,
    300: 0.894,
    400: 0.827,
    500: 0.735,
    600: 0.625,
    700: 0.515,
    800: 0.26,
    900: 0.215,
    950: 0.176,
  }
  const chroma: Record<ScaleStop, number> = {
    50: 0.003,
    100: 0.004,
    200: 0.005,
    300: 0.006,
    400: 0.007,
    500: 0.008,
    600: 0.009,
    700: 0.01,
    800: 0.011,
    900: 0.012,
    950: 0.014,
  }
  const result = {} as ColorScale
  for (const stop of SCALE_STOPS) {
    result[stop] = oklchToHex({ l: light[stop], c: chroma[stop], h: hue })
  }
  return result
}

export interface Palette {
  seed: string
  hue: number
  primary: ColorScale
  neutral: ColorScale
  danger: ColorScale
  success: ColorScale
  warning: ColorScale
  info: ColorScale
}

export interface GeneratePaletteOptions {
  theme?: "light" | "dark"
}

/**
 * The public palette contract. `theme` is accepted because semantic token
 * derivation is theme-aware; primitive scales stay identical between themes.
 */
export function generatePalette(seed: string, _options: GeneratePaletteOptions = {}): Palette {
  const normalized = normalizeHex(seed)
  return {
    seed: normalized,
    hue: hexToOklch(normalized).h,
    primary: generateScale(normalized),
    neutral: generateNeutralScale(normalized),
    danger: scaleFromSeed(STATUS_SEEDS.danger, LIGHTNESS),
    success: scaleFromSeed(STATUS_SEEDS.success, LIGHTNESS),
    warning: scaleFromSeed(STATUS_SEEDS.warning, LIGHTNESS),
    info: scaleFromSeed(STATUS_SEEDS.info, LIGHTNESS),
  }
}

export const BRAND_PALETTE = generatePalette(VIOLET_SEED, { theme: "light" })
