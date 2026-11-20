import { computed, inject, provide, type ComputedRef, type InjectionKey } from "vue"
import type { Density } from "@xcmm1543/miuui-core"

export const MIU_LIST_DENSITY_KEY: InjectionKey<ComputedRef<Density | undefined>> =
  Symbol("miu-list-density")

export function provideListDensity(density: () => Density | undefined): void {
  provide(
    MIU_LIST_DENSITY_KEY,
    computed(() => density()),
  )
}

export function useListDensity(): ComputedRef<Density | undefined> {
  return inject(
    MIU_LIST_DENSITY_KEY,
    computed(() => undefined),
  )
}
