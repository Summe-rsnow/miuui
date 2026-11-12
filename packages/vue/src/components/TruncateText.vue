<script setup lang="ts">
import { computed } from "vue"
import { regionClass, regionStyle } from "@miuui/core"
import type { TruncateTextProps } from "../types"

const props = withDefaults(defineProps<TruncateTextProps>(), {
  lines: 1,
  as: "span",
})

const rootStyle = computed(() => {
  const custom = regionStyle(props, "root")
  const base = { "--miu-truncate-lines": String(props.lines) }
  if (typeof custom === "string") return [base, custom]
  return custom ? { ...base, ...custom } : base
})
</script>

<template>
  <component
    :is="as"
    :class="regionClass(props, 'root', 'miu-truncate')"
    :style="rootStyle"
    :title="title ?? text"
  >
    <slot>{{ text }}</slot>
  </component>
</template>
