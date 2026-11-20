<script setup lang="ts">
import { computed } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { SkeletonProps } from "../types"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<SkeletonProps>(), {
  variant: "rect",
  radius: "default",
  animated: true,
})

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Skeleton")

function toCssSize(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined
  return typeof value === "number" ? `${value}px` : value
}

const rootStyle = computed(() => {
  const dims: Record<string, string> = {}
  const width = toCssSize(props.width)
  const height = toCssSize(props.height)
  if (width) dims.width = width
  if (height) dims.height = height
  if (props.radius) dims["--miu-skeleton-radius"] = `var(--miu-radius-${props.radius})`
  const extra =
    materialTokens.value || Object.keys(dims).length > 0
      ? { ...materialTokens.value, ...dims }
      : undefined
  return mergeStyle(regionStyle(props, "root"), extra)
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
    :data-miu-radius="radius"
    :data-material="materialName"
    aria-hidden="true"
  >
    <span
      v-if="animated"
      :class="regionClass(props, 'shimmer', 'miu-skeleton__shimmer')"
      :style="regionStyle(props, 'shimmer')"
    />
  </span>
</template>
