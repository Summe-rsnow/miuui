<script setup lang="ts">
import { regionClass, regionStyle } from "@miuui/core"
import type { CardProps } from "../types"

const props = withDefaults(defineProps<CardProps>(), {
  radius: "lg",
  padding: "md",
  variant: "surface",
  interactive: false,
})
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
    :style="regionStyle(props, 'root')"
    :data-material="material"
    :data-miu-radius="radius"
    :data-density="density"
  >
    <header
      v-if="$slots.header"
      :class="regionClass(props, 'header', 'miu-card__header')"
      :style="regionStyle(props, 'header')"
    >
      <slot name="header" />
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
