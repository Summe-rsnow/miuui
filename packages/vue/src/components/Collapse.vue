<script setup lang="ts">
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { CollapseProps } from "../types"

const props = withDefaults(defineProps<CollapseProps>(), {
  open: false,
  disabled: false,
})
</script>

<template>
  <div
    :class="regionClass(props, 'root', 'miu-collapse', { 'miu-collapse--disabled': disabled })"
    :style="regionStyle(props, 'root')"
    :data-open="open ? 'true' : 'false'"
    :data-disabled="disabled || undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :aria-hidden="!open || undefined"
    :inert="!open || disabled || undefined"
  >
    <div
      :class="regionClass(props, 'content', 'miu-collapse__inner')"
      :style="regionStyle(props, 'content')"
    >
      <slot />
    </div>
  </div>
</template>
