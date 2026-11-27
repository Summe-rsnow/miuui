<script setup lang="ts">
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { KbdProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<KbdProps>(), {
  radius: "sm",
})

const { resolvedSize } = useControlSize({
  size: () => props.size,
  supported: ["sm", "md"] as const,
  defaultSize: "sm",
  componentName: "Kbd",
})
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Kbd")
</script>

<template>
  <kbd
    :class="regionClass(props, 'root', 'miu-kbd', `miu-kbd--${resolvedSize.size}`)"
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-material="materialName"
  >
    <slot>{{ keys }}</slot>
  </kbd>
</template>
