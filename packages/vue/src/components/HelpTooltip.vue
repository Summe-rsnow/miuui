<script setup lang="ts">
import { ref, useAttrs } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { HelpTooltipProps } from "../types"
import Icon from "./Icon.vue"
import Tooltip from "./Tooltip.vue"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const triggerRef = ref<HTMLButtonElement>()

const props = withDefaults(defineProps<HelpTooltipProps>(), {
  icon: "help",
  iconSize: "sm",
  open: undefined,
  disabled: false,
  side: "top",
  align: "center",
  sideOffset: 6,
  delayDuration: 200,
  radius: "sm",
})

const emit = defineEmits<{ "update:open": [value: boolean] }>()

defineExpose({
  focus: () => triggerRef.value?.focus(),
  blur: () => triggerRef.value?.blur(),
  triggerRef,
})
</script>

<template>
  <Tooltip
    :open="disabled ? false : open"
    :disabled="disabled"
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
    @update:open="emit('update:open', $event)"
  >
    <template #trigger>
      <button
        ref="triggerRef"
        type="button"
        v-bind="attrs"
        :disabled="disabled"
        :data-disabled="disabled || undefined"
        :aria-disabled="disabled || undefined"
        :class="regionClass(props, 'trigger', 'miu-help-tooltip__trigger')"
        :style="regionStyle(props, 'trigger')"
        :aria-label="ariaLabel ?? text"
        @click.stop.prevent
      >
        <slot name="icon">
          <Icon :name="icon" :size="iconSize" />
        </slot>
      </button>
    </template>
    <slot>{{ text }}</slot>
  </Tooltip>
</template>
