<script setup lang="ts">
import { regionClass, regionStyle } from "@miuui/core"
import type { KbdProps } from "../types"

const props = withDefaults(defineProps<KbdProps>(), {
  size: "sm",
  radius: "sm",
})
</script>

<template>
  <kbd
    :class="regionClass(props, 'root', 'miu-kbd', `miu-kbd--${size}`)"
    :style="regionStyle(props, 'root')"
    :data-miu-size="size"
    :data-miu-radius="radius"
  >
    <slot>{{ keys }}</slot>
  </kbd>
</template>
