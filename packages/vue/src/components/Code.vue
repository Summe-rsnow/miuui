<script setup lang="ts">
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { CodeProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<CodeProps>(), {
  variant: "neutral",
  radius: "sm",
})

const { resolvedSize } = useControlSize({
  size: () => props.size,
  supported: ["sm", "md"] as const,
  defaultSize: "md",
  componentName: "Code",
})
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Code")
</script>

<template>
  <code
    :class="
      regionClass(
        props,
        'root',
        'miu-code',
        `miu-code--${variant}`,
        `miu-code--${resolvedSize.size}`,
      )
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-material="materialName"
  >
    <slot>{{ value }}</slot>
  </code>
</template>
