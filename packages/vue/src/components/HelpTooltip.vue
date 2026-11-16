<script setup lang="ts">
import { useAttrs } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { HelpTooltipProps } from "../types"
import Icon from "./Icon.vue"
import Tooltip from "./Tooltip.vue"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()

const props = withDefaults(defineProps<HelpTooltipProps>(), {
  icon: "help",
  size: "sm",
  side: "top",
  align: "center",
  sideOffset: 6,
  delayDuration: 200,
  radius: "sm",
})
</script>

<template>
  <Tooltip
    :side="side"
    :align="align"
    :side-offset="sideOffset"
    :delay-duration="delayDuration"
    :radius="radius"
    :material="material"
    :max-width="maxWidth"
    :max-height="maxHeight"
    :class-names="{ content: classNames?.content, arrow: classNames?.arrow }"
    :styles="{ content: styles?.content, arrow: styles?.arrow }"
  >
    <template #trigger>
      <button
        type="button"
        v-bind="attrs"
        :class="regionClass(props, 'trigger', 'miu-help-tooltip__trigger')"
        :style="regionStyle(props, 'trigger')"
        :aria-label="ariaLabel ?? text"
        @click.stop.prevent
      >
        <slot name="icon">
          <Icon :name="icon" :size="size" />
        </slot>
      </button>
    </template>
    <slot>{{ text }}</slot>
  </Tooltip>
</template>
