import type { ComponentSemanticProps } from "./types"

export type ClassValue = string | false | null | undefined | Record<string, boolean | undefined>

function toClassName(value: ClassValue): string {
  if (!value) return ""
  if (typeof value === "string") return value
  return Object.entries(value)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name)
    .join(" ")
}

export function cx(...values: ClassValue[]): string {
  return values.map(toClassName).filter(Boolean).join(" ")
}

export function regionClass<Region extends string>(
  props: ComponentSemanticProps<Region>,
  region: Region,
  ...base: ClassValue[]
): string {
  return cx(...base, props.classNames?.[region])
}

export function regionStyle<Region extends string>(
  props: ComponentSemanticProps<Region>,
  region: Region,
): string | Record<string, string> | undefined {
  return props.styles?.[region]
}
