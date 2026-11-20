import { computed, inject, type ComputedRef, type InjectionKey } from "vue"
import type { IconDefinition } from "@xcmm1543/miuui-icons"

export type IconOverride = IconDefinition | string
export type IconRegistry = Record<string, IconOverride>

export const MIU_ICONS_KEY: InjectionKey<ComputedRef<IconRegistry | undefined>> =
  Symbol("miu-icons")

const emptyIcons = computed<IconRegistry | undefined>(() => undefined)

export function useMiuIcons(): ComputedRef<IconRegistry | undefined> {
  return inject(MIU_ICONS_KEY, emptyIcons)
}
