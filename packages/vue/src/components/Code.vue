<script setup lang="ts">
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { CodeProps } from "../types"

const props = withDefaults(defineProps<CodeProps>(), {
  variant: "neutral",
  size: "md",
  radius: "sm",
})
</script>

<template>
  <code
    :class="regionClass(props, 'root', 'miu-code', `miu-code--${variant}`, `miu-code--${size}`)"
    :style="regionStyle(props, 'root')"
    :data-miu-radius="radius"
  >
    <slot>{{ value }}</slot>
  </code>
</template>
