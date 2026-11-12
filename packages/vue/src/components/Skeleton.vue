<script setup lang="ts">
import { computed } from "vue"
import { regionClass, regionStyle } from "@miuui/core"
import type { SkeletonProps } from "../types"

const props = withDefaults(defineProps<SkeletonProps>(), {
  variant: "rect",
  animated: true,
})

function toCssSize(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined
  return typeof value === "number" ? `${value}px` : value
}

const rootStyle = computed(() => {
  const custom = regionStyle(props, "root")
  const base: Record<string, string | undefined> = {
    width: toCssSize(props.width),
    height: toCssSize(props.height),
    "--miu-skeleton-radius": props.radius ? `var(--miu-radius-${props.radius})` : undefined,
  }
  if (typeof custom === "string") return [base, custom]
  return custom ? { ...base, ...custom } : base
})
</script>

<template>
  <span
    :class="
      regionClass(props, 'root', 'miu-skeleton', `miu-skeleton--${variant}`, {
        'miu-skeleton--animated': animated,
      })
    "
    :style="rootStyle"
    aria-hidden="true"
  >
    <span
      v-if="animated"
      :class="regionClass(props, 'shimmer', 'miu-skeleton__shimmer')"
      :style="regionStyle(props, 'shimmer')"
    />
  </span>
</template>
