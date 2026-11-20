<script setup lang="ts">
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { CodeProps } from "../types"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<CodeProps>(), {
  variant: "neutral",
  size: "md",
  radius: "sm",
})

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Code")
</script>

<template>
  <code
    :class="regionClass(props, 'root', 'miu-code', `miu-code--${variant}`, `miu-code--${size}`)"
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="size"
    :data-miu-radius="radius"
    :data-material="materialName"
  >
    <slot>{{ value }}</slot>
  </code>
</template>
