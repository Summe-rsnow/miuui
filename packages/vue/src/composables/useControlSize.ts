import { computed, type ComputedRef } from "vue"
import {
  CONTROL_SIZES,
  DEFAULT_CONTROL_SIZE,
  resolveControlSize,
  resolveIconSize,
  type ControlSize,
  type IconSize,
  type ResolvedControlSize,
  type ResolvedIconSize,
} from "@xcmm1543/miuui-core"
import { useMiuSizeHint } from "./useSizeHint"

export interface UseControlSizeOptions<T extends ControlSize = ControlSize> {
  size: () => T | string | undefined
  supported?: readonly T[]
  defaultSize?: T
  iconSize?: () => IconSize | number | undefined
  componentName: string
}

export interface UseControlSizeReturn {
  size: ComputedRef<string>
  resolvedSize: ComputedRef<ResolvedControlSize>
  resolvedIconSize: ComputedRef<ResolvedIconSize>
}

export function useControlSize<T extends ControlSize = ControlSize>(
  options: UseControlSizeOptions<T>,
): UseControlSizeReturn {
  const sizeHint = useMiuSizeHint()
  const fallbackSize = (options.defaultSize ?? DEFAULT_CONTROL_SIZE) as T
  const supported = options.supported ?? (CONTROL_SIZES as readonly ControlSize[])
  const size = computed(() => options.size() ?? sizeHint.value ?? fallbackSize)
  const resolvedSize = computed(() => resolveControlSize(size.value, supported, fallbackSize))
  const resolvedIconSize = computed(() => {
    const rawIcon = options.iconSize?.()
    return resolveIconSize(
      resolvedSize.value.size,
      typeof rawIcon === "number" ? undefined : rawIcon,
    )
  })

  if (import.meta.env.DEV && resolvedSize.value.fallback) {
    console.warn(
      `[μui] ${options.componentName}: unsupported size "${size.value}", fell back to "${resolvedSize.value.size}".`,
    )
  }

  return { size, resolvedSize, resolvedIconSize }
}
