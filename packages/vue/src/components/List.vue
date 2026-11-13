<script setup lang="ts">
import { regionClass, regionStyle } from "@miuui/core"
import type { ListProps } from "../types"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<ListProps>(), {
  gap: "xs",
  bordered: false,
  dividers: false,
  radius: "default",
})

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "List")
</script>

<template>
  <div
    role="list"
    :class="
      regionClass(props, 'root', 'miu-list', `miu-list--gap-${gap}`, {
        'miu-list--bordered': bordered,
        'miu-list--dividers': dividers,
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-radius="radius"
    :data-density="density"
    :data-material="materialName"
  >
    <slot />
  </div>
</template>
