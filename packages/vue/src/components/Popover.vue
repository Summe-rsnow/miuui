<script setup lang="ts">
import { PopoverArrow, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from "reka-ui"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { PopoverProps } from "../types"
import { useMiuTheme } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<PopoverProps>(), {
  open: undefined,
  side: "bottom",
  align: "center",
  sideOffset: 8,
  radius: "default",
  arrow: false,
  modal: false,
})

const emit = defineEmits<{ "update:open": [value: boolean] }>()
const theme = useMiuTheme()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Popover")
</script>

<template>
  <PopoverRoot :open="open" :modal="modal" @update:open="emit('update:open', $event)">
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverPortal :to="theme.portalTarget.value">
      <PopoverContent
        :class="regionClass(props, 'content', 'miu-popover')"
        :style="mergeStyle(regionStyle(props, 'content'), materialTokens)"
        :data-miu-radius="radius"
        :data-material="materialName"
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
