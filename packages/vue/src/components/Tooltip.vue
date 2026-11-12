<script setup lang="ts">
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "reka-ui"
import { regionClass, regionStyle } from "@miuui/core"
import type { TooltipProps } from "../types"
import { useMiuTheme } from "../composables/useMiu"

const props = withDefaults(defineProps<TooltipProps>(), {
  side: "top",
  align: "center",
  sideOffset: 6,
  delayDuration: 300,
  radius: "sm",
})
const emit = defineEmits<{ "update:open": [value: boolean] }>()
const theme = useMiuTheme()
</script>

<template>
  <TooltipProvider :delay-duration="delayDuration">
    <TooltipRoot :open="open" @update:open="emit('update:open', $event)">
      <TooltipTrigger as-child>
        <slot name="trigger" />
      </TooltipTrigger>
      <TooltipPortal :to="theme.portalTarget.value">
        <TooltipContent
          :class="regionClass(props, 'content', 'miu-tooltip')"
          :style="regionStyle(props, 'content')"
          :data-miu-radius="radius"
          :data-material="material"
          :side="side"
          :align="align"
          :side-offset="sideOffset"
        >
          <slot />
          <TooltipArrow
            :class="regionClass(props, 'arrow', 'miu-tooltip__arrow')"
            :style="regionStyle(props, 'arrow')"
          />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
