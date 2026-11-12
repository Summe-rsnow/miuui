/**
 * OKLCH <-> sRGB conversion with a deterministic chroma-reduction gamut map.
 * Pure functions only: safe for SSR, workers and build-time generation.
 */

export interface Oklch {
  l: number
  c: number
  h: number
}

type Rgb = readonly [number, number, number]

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

const round = (value: number, digits: number): number => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function normalizeHex(input: string): string {
  const raw = input.trim().replace(/^#/, "")
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(raw)) {
    throw new Error(`Invalid hex color: ${input}`)
  }
  const expanded =
    raw.length === 3
      ? raw
          .split("")
          .map((part) => part + part)
          .join("")
      : raw
  return `#${expanded.toUpperCase()}`
}

function hexToRgb(input: string): Rgb {
  const hex = normalizeHex(input).slice(1)
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ]
}

function srgbToLinear(value: number): number {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function linearToSrgb(value: number): number {
  return value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055
}

function rgbToHex(rgb: Rgb): string {
  const parts = rgb.map((channel) =>
    Math.round(clamp(channel, 0, 1) * 255)
      .toString(16)
      .padStart(2, "0"),
  )
  return `#${parts.join("").toUpperCase()}`
}

function linearRgbToOklab([r, g, b]: Rgb): Rgb {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

  const lRoot = Math.cbrt(l)
  const mRoot = Math.cbrt(m)
  const sRoot = Math.cbrt(s)

  return [
    0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot,
    1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot,
    0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot,
  ]
}

function oklabToLinearRgb([l, a, b]: Rgb): Rgb {
  const lRoot = l + 0.3963377774 * a + 0.2158037573 * b
  const mRoot = l - 0.1055613458 * a - 0.0638541728 * b
  const sRoot = l - 0.0894841775 * a - 1.291485548 * b

  const l3 = lRoot ** 3
  const m3 = mRoot ** 3
  const s3 = sRoot ** 3

  return [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ]
}

export function hexToOklch(input: string): Oklch {
  const linear = hexToRgb(input).map(srgbToLinear) as unknown as Rgb
  const [l, a, b] = linearRgbToOklab(linear)
  const c = Math.sqrt(a ** 2 + b ** 2)
  const h = c < 1e-7 ? 0 : ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360
  return { l, c, h }
}

function oklchToRgb(color: Oklch): Rgb {
  const hue = (color.h * Math.PI) / 180
  const a = color.c * Math.cos(hue)
  const b = color.c * Math.sin(hue)
  return oklabToLinearRgb([color.l, a, b]).map(linearToSrgb) as unknown as Rgb
}

function inGamut(rgb: Rgb): boolean {
  return rgb.every((channel) => channel >= -1e-5 && channel <= 1 + 1e-5)
}

/** Convert OKLCH to hex, reducing chroma until the color fits sRGB. */
export function oklchToHex(input: Oklch): string {
  const color: Oklch = {
    l: clamp(input.l, 0, 1),
    c: Math.max(0, input.c),
    h: ((input.h % 360) + 360) % 360,
  }

  let chroma = color.c
  let rgb = oklchToRgb({ ...color, c: chroma })
  let guard = 0

  while (!inGamut(rgb) && chroma > 0 && guard < 256) {
    chroma = Math.max(0, chroma - 0.002)
    rgb = oklchToRgb({ ...color, c: chroma })
    guard += 1
  }

  return rgbToHex(rgb)
}

export function formatOklch(color: Oklch, alpha?: number): string {
  const l = round(clamp(color.l, 0, 1), 4)
  const c = round(Math.max(0, color.c), 4)
  const h = round(((color.h % 360) + 360) % 360, 2)
  const base = `oklch(${l} ${c} ${h}`
  return alpha === undefined ? `${base})` : `${base} / ${alpha})`
}

export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)} / ${alpha})`
}
