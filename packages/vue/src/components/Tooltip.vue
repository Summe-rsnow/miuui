<script setup lang="ts">
import { computed } from "vue"
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
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<TooltipProps>(), {
  open: undefined,
  side: "top",
  sideOffset: 6,
  delayDuration: 300,
  disabled: false,
  radius: "sm",
})
const emit = defineEmits<{ "update:open": [value: boolean] }>()
const theme = useMiuTheme()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Tooltip")
const contentStyle = computed(() => {
  const tokens: Record<string, string> = { ...materialTokens.value }
  if (props.maxWidth) tokens.maxWidth = props.maxWidth
  if (props.maxHeight) tokens.maxBlockSize = props.maxHeight
  return mergeStyle(
    regionStyle(props, "content"),
    Object.keys(tokens).length > 0 ? tokens : undefined,
  )
})
</script>

<template>
  <TooltipProvider :delay-duration="delayDuration">
    <TooltipRoot :open="open" :disabled="disabled" @update:open="emit('update:open', $event)">
      <TooltipTrigger as-child>
        <slot name="trigger" />
      </TooltipTrigger>
      <TooltipPortal :to="theme.portalTarget.value">
        <TooltipContent
          :class="regionClass(props, 'content', 'miu-tooltip')"
          :style="contentStyle"
          :data-miu-radius="radius"
          :data-material="materialName"
          :side="side"
          :align="align"
          :side-offset="sideOffset"
        >
          <div class="miu-tooltip__body">
            <slot />
          </div>
          <TooltipArrow
            :class="regionClass(props, 'arrow', 'miu-tooltip__arrow')"
            :style="regionStyle(props, 'arrow')"
          />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
