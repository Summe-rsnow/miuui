<script setup lang="ts">
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { CardProps } from "../types"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<CardProps>(), {
  radius: "lg",
  padding: "md",
  variant: "surface",
  interactive: false,
  disabled: false,
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Card")

function onClick(event: MouseEvent): void {
  if (props.disabled) {
    event.preventDefault()
    return
  }
  emit("click", event)
}
</script>

<template>
  <div
    :class="
      regionClass(
        props,
        'root',
        'miu-card',
        `miu-card--${variant}`,
        `miu-card--padding-${padding}`,
        {
          'miu-card--interactive': interactive,
          'miu-card--disabled': disabled,
        },
      )
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-material="materialName"
    :data-miu-radius="radius"
    :data-density="density"
    :data-disabled="disabled || undefined"
    :aria-disabled="interactive && disabled ? 'true' : undefined"
    @click="onClick"
  >
    <header
      v-if="$slots.header || $slots.title || title"
      :class="regionClass(props, 'header', 'miu-card__header')"
      :style="regionStyle(props, 'header')"
    >
      <slot name="header">
        <span class="miu-card__title">
          <slot name="title">{{ title }}</slot>
        </span>
      </slot>
    </header>
    <div :class="regionClass(props, 'body', 'miu-card__body')" :style="regionStyle(props, 'body')">
      <slot />
    </div>
    <footer
      v-if="$slots.footer"
      :class="regionClass(props, 'footer', 'miu-card__footer')"
      :style="regionStyle(props, 'footer')"
    >
      <slot name="footer" />
    </footer>
  </div>
</template>
