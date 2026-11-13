<script setup lang="ts">
import { regionClass, regionStyle } from "@miuui/core"
import type { CollapseProps } from "../types"

const props = withDefaults(defineProps<CollapseProps>(), {
  open: false,
})
</script>

<template>
  <div
    :class="regionClass(props, 'root', 'miu-collapse')"
    :style="regionStyle(props, 'root')"
    :data-open="open ? 'true' : 'false'"
    :aria-hidden="!open || undefined"
  >
    <div
      :class="regionClass(props, 'content', 'miu-collapse__inner')"
      :style="regionStyle(props, 'content')"
    >
      <slot />
    </div>
  </div>
</template>
