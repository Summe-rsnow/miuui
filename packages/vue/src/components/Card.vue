<script setup lang="ts">
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { CardProps } from "../types"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<CardProps>(), {
  radius: "lg",
  padding: "md",
  variant: "surface",
  interactive: false,
})

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Card")
</script>

<template>
  <div
    :class="
      regionClass(
        props,
        'root',
        'miu-card',
        `miu-card--${variant}`,
        `miu-card--padding-${padding}`,
        { 'miu-card--interactive': interactive },
      )
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-material="materialName"
    :data-miu-radius="radius"
    :data-density="density"
  >
    <header
      v-if="$slots.header || title"
      :class="regionClass(props, 'header', 'miu-card__header')"
      :style="regionStyle(props, 'header')"
    >
      <slot name="header">
        <span class="miu-card__title">{{ title }}</span>
      </slot>
    </header>
    <div :class="regionClass(props, 'body', 'miu-card__body')" :style="regionStyle(props, 'body')">
      <slot />
    </div>
    <footer
      v-if="$slots.footer"
      :class="regionClass(props, 'footer', 'miu-card__footer')"
      :style="regionStyle(props, 'footer')"
    >
      <slot name="footer" />
    </footer>
  </div>
</template>
