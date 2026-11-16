<script setup lang="ts">
import { computed } from "vue"
import { ProgressIndicator, ProgressRoot } from "reka-ui"
import { regionClass, regionStyle, resolveControlSize } from "@xcmm1543/miuui-core"
import type { ProgressProps } from "../types"
import { useMiuSizeHint } from "../composables/useSizeHint"

const props = withDefaults(defineProps<ProgressProps>(), {
  modelValue: 0,
  max: 100,
  variant: "primary",
  radius: "full",
  indeterminate: false,
  showValue: false,
})

const sizeHint = useMiuSizeHint()
const size = computed(() => props.size ?? sizeHint.value ?? "md")
const resolvedSize = computed(() => resolveControlSize(size.value, ["sm", "md", "lg"], "md"))

if (import.meta.env.DEV && resolvedSize.value.fallback) {
  console.warn(
    `[μui] Progress: unsupported size "${size.value}", fell back to "${resolvedSize.value.size}".`,
  )
}
const safeMax = computed(() => (props.max > 0 ? props.max : 100))
const clampedValue = computed(() => Math.min(safeMax.value, Math.max(0, props.modelValue ?? 0)))
const percentage = computed(() => {
  if (props.indeterminate) return 0
  return Math.min(100, Math.max(0, (clampedValue.value / safeMax.value) * 100))
})
const indicatorStyle = computed(() => {
  const base = regionStyle(props, "indicator")
  if (props.indeterminate) return base
  const offset = 100 - percentage.value
  const transform = { transform: offset <= 0 ? "translateX(0%)" : `translateX(-${offset}%)` }
  if (typeof base === "string") return [transform, base]
  return base ? { ...base, ...transform } : transform
})
</script>

<template>
  <div
    :class="
      regionClass(
        props,
        'root',
        'miu-progress',
        `miu-progress--${resolvedSize.size}`,
        `miu-progress--${variant}`,
      )
    "
    :style="regionStyle(props, 'root')"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-variant="variant"
  >
    <ProgressRoot
      :model-value="indeterminate ? null : clampedValue"
      :max="safeMax"
      :aria-label="ariaLabel"
      :class="regionClass(props, 'track', 'miu-progress__track')"
      :style="regionStyle(props, 'track')"
    >
      <ProgressIndicator
        :class="
          regionClass(props, 'indicator', 'miu-progress__indicator', {
            'miu-progress__indicator--indeterminate': indeterminate,
          })
        "
        :style="indicatorStyle"
      />
    </ProgressRoot>
    <span
      v-if="showValue && !indeterminate"
      :class="regionClass(props, 'label', 'miu-progress__label')"
      :style="regionStyle(props, 'label')"
    >
      {{ Math.round(percentage) }}%
    </span>
  </div>
</template>
