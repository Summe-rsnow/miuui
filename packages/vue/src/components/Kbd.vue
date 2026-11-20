<script setup lang="ts">
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { KbdProps } from "../types"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<KbdProps>(), {
  size: "sm",
  radius: "sm",
})

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Kbd")
</script>

<template>
  <kbd
    :class="regionClass(props, 'root', 'miu-kbd', `miu-kbd--${size}`)"
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="size"
    :data-miu-radius="radius"
    :data-material="materialName"
  >
    <slot>{{ keys }}</slot>
  </kbd>
</template>
