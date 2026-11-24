<script setup lang="ts">
import { computed } from "vue"
import { ProgressIndicator, ProgressRoot } from "reka-ui"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { ProgressProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<ProgressProps>(), {
  modelValue: 0,
  max: 100,
  shape: "line",
  variant: "primary",
  radius: "full",
  indeterminate: false,
  showValue: false,
})

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Progress")
const { resolvedSize } = useControlSize({
  size: () => props.size,
  supported: ["sm", "md", "lg"],
  defaultSize: "md",
  componentName: "Progress",
})
const safeMax = computed(() => (props.max > 0 ? props.max : 100))
const clampedValue = computed(() => Math.min(safeMax.value, Math.max(0, props.modelValue ?? 0)))
const percentage = computed(() => {
  if (props.indeterminate) return 0
  return Math.min(100, Math.max(0, (clampedValue.value / safeMax.value) * 100))
})
const resolvedThickness = computed(() => {
  if (props.thickness !== undefined && props.thickness > 0) {
    return Math.min(20, Math.max(2, props.thickness))
  }
  return resolvedSize.value.size === "sm" ? 6 : resolvedSize.value.size === "lg" ? 10 : 8
})
const circleRadius = computed(() => 50 - resolvedThickness.value / 2)
const circumference = computed(() => 2 * Math.PI * circleRadius.value)
const dashOffset = computed(() => {
  if (props.indeterminate) return circumference.value * 0.65
  return circumference.value * (1 - percentage.value / 100)
})
const indicatorStyle = computed(() => {
  const base = regionStyle(props, "indicator")
  if (props.indeterminate) return base
  const offset = 100 - percentage.value
  return mergeStyle(base, {
    transform: offset <= 0 ? "translateX(0%)" : `translateX(-${offset}%)`,
  })
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
        `miu-progress--${shape}`,
      )
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-material="materialName"
    :data-variant="variant"
    :data-shape="shape"
  >
    <ProgressRoot
      v-if="shape === 'line'"
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
    <template v-else>
      <ProgressRoot
        :model-value="indeterminate ? null : clampedValue"
        :max="safeMax"
        :aria-label="ariaLabel"
        class="miu-progress__ring"
      >
        <svg class="miu-progress__svg" viewBox="0 0 100 100" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            :r="circleRadius"
            fill="none"
            :stroke-width="resolvedThickness"
            :class="regionClass(props, 'track', 'miu-progress__circle-track')"
            :style="regionStyle(props, 'track')"
          />
          <circle
            cx="50"
            cy="50"
            :r="circleRadius"
            fill="none"
            stroke-linecap="round"
            :stroke-width="resolvedThickness"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            :stroke-opacity="!indeterminate && percentage <= 0 ? 0 : undefined"
            :class="
              regionClass(props, 'indicator', 'miu-progress__circle-indicator', {
                'miu-progress__circle-indicator--indeterminate': indeterminate,
              })
            "
            :style="regionStyle(props, 'indicator')"
          />
        </svg>
        <ProgressIndicator class="miu-progress__sr-indicator" />
      </ProgressRoot>
    </template>
    <span
      v-if="
        shape === 'line'
          ? showValue && !indeterminate
          : $slots.default || (showValue && !indeterminate)
      "
      :class="regionClass(props, 'label', 'miu-progress__label')"
      :style="regionStyle(props, 'label')"
      :aria-hidden="shape === 'circle' && !$slots.default ? 'true' : undefined"
    >
      <slot>{{ Math.round(percentage) }}%</slot>
    </span>
  </div>
</template>
