<script setup lang="ts">
import { PopoverArrow, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from "reka-ui"
import { regionClass, regionStyle } from "@miuui/core"
import type { PopoverProps } from "../types"
import { useMiuTheme } from "../composables/useMiu"

const props = withDefaults(defineProps<PopoverProps>(), {
  open: false,
  side: "bottom",
  align: "center",
  sideOffset: 8,
  radius: "default",
  arrow: false,
  modal: false,
})

const emit = defineEmits<{ "update:open": [value: boolean] }>()
const theme = useMiuTheme()
</script>

<template>
  <PopoverRoot :open="open" :modal="modal" @update:open="emit('update:open', $event)">
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverPortal :to="theme.portalTarget.value">
      <PopoverContent
        :class="regionClass(props, 'content', 'miu-popover')"
        :style="regionStyle(props, 'content')"
        :data-miu-radius="radius"
        :data-material="material"
        :side="side"
        :align="align"
        :side-offset="sideOffset"
      >
        <slot />
        <PopoverArrow
          v-if="arrow"
          :class="regionClass(props, 'arrow', 'miu-popover__arrow')"
          :style="regionStyle(props, 'arrow')"
        />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
