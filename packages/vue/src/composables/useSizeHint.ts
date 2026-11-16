import { computed, inject, type ComputedRef, type InjectionKey } from "vue"
import type { ControlSize } from "@xcmm1543/miuui-core"

/**
 * Container-provided default control size.
 *
 * Containers such as `FormField` and `Table` map an orthogonal `density` value to a
 * size recommendation for descendants that do not pass `size` themselves:
 * `compact → sm`, everything else → `undefined` (keep the control default).
 * An explicit `size` on the child always wins.
 */
export const MIU_SIZE_HINT_KEY: InjectionKey<ComputedRef<ControlSize | undefined>> =
  Symbol("miu-size-hint")

export function useMiuSizeHint(): ComputedRef<ControlSize | undefined> {
  return inject(
    MIU_SIZE_HINT_KEY,
    computed(() => undefined),
  )
}
