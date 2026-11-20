<script setup lang="ts">
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { AppBarProps } from "../types"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<AppBarProps>(), {
  sticky: false,
  blurred: false,
  radius: "none",
})

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "AppBar")
</script>

<template>
  <header
    :class="regionClass(props, 'root', 'miu-app-bar')"
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-radius="radius"
    :data-sticky="sticky || undefined"
    :data-blurred="blurred || undefined"
    :data-material="materialName"
    :data-density="density"
  >
    <div
      :class="regionClass(props, 'brand', 'miu-app-bar__brand')"
      :style="regionStyle(props, 'brand')"
    >
      <slot name="brand" />
    </div>
    <div
      :class="regionClass(props, 'content', 'miu-app-bar__content')"
      :style="regionStyle(props, 'content')"
    >
      <slot />
    </div>
    <div
      :class="regionClass(props, 'actions', 'miu-app-bar__actions')"
      :style="regionStyle(props, 'actions')"
    >
      <slot name="actions" />
    </div>
  </header>
</template>
