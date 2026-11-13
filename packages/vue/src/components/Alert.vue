<script setup lang="ts">
import { regionClass, regionStyle } from "@miuui/core"
import type { AlertProps } from "../types"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<AlertProps>(), {
  variant: "info",
  radius: "sm",
  iconSize: "md",
})

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Alert")
</script>

<template>
  <div
    :class="regionClass(props, 'root', 'miu-alert', `miu-alert--${variant}`)"
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-variant="variant"
    :data-miu-radius="radius"
    :data-material="materialName"
    role="note"
  >
    <span
      v-if="icon || $slots.icon"
      :class="regionClass(props, 'icon', 'miu-alert__icon')"
      :style="regionStyle(props, 'icon')"
    >
      <slot name="icon">
        <Icon v-if="icon" :name="icon" />
      </slot>
    </span>
    <div class="miu-alert__body">
      <p
        v-if="title || $slots.title"
        :class="regionClass(props, 'title', 'miu-alert__title')"
        :style="regionStyle(props, 'title')"
      >
        <slot name="title">{{ title }}</slot>
      </p>
      <div
        :class="regionClass(props, 'content', 'miu-alert__content')"
        :style="regionStyle(props, 'content')"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
