<script setup lang="ts">
import { computed } from "vue"
import { regionClass, regionStyle } from "@miuui/core"
import type { FormRowProps } from "../types"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<FormRowProps>(), {
  iconSize: "sm",
  dense: false,
  clickable: false,
  layout: "row",
})

if (import.meta.env.DEV && props.dense) {
  console.warn('[μui] FormRow: `dense` is deprecated, use `density="compact"` instead.')
}

const effectiveDensity = computed(() => props.density ?? (props.dense ? "compact" : undefined))

const emit = defineEmits<{ click: [event: MouseEvent | KeyboardEvent] }>()

function onClick(event: MouseEvent): void {
  if (props.clickable) emit("click", event)
}

function onKeydown(event: KeyboardEvent): void {
  if (!props.clickable) return
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault()
    emit("click", event)
  }
}
</script>

<template>
  <div
    :class="
      regionClass(props, 'root', 'miu-form-row', `miu-form-row--${layout}`, {
        'miu-form-row--dense': dense,
        'miu-form-row--clickable': clickable,
      })
    "
    :style="regionStyle(props, 'root')"
    :data-density="effectiveDensity"
    :data-miu-icon-size="iconSize"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    @click="onClick"
    @keydown="onKeydown"
  >
    <div class="miu-form-row__lead">
      <slot name="lead">
        <span
          v-if="icon"
          :class="regionClass(props, 'icon', 'miu-form-row__icon')"
          :style="regionStyle(props, 'icon')"
        >
          <Icon :name="icon" />
        </span>
        <div class="miu-form-row__text">
          <label
            v-if="labelFor"
            :for="labelFor"
            :class="regionClass(props, 'label', 'miu-form-row__label')"
            :style="regionStyle(props, 'label')"
          >
            <slot name="label">{{ label }}</slot>
          </label>
          <span
            v-else-if="label || $slots.label"
            :class="regionClass(props, 'label', 'miu-form-row__label')"
            :style="regionStyle(props, 'label')"
          >
            <slot name="label">{{ label }}</slot>
          </span>
          <p
            v-if="description"
            :class="regionClass(props, 'description', 'miu-form-row__description')"
            :style="regionStyle(props, 'description')"
          >
            {{ description }}
          </p>
          <p
            v-if="hint"
            :class="regionClass(props, 'hint', 'miu-form-row__hint')"
            :style="regionStyle(props, 'hint')"
          >
            {{ hint }}
          </p>
        </div>
      </slot>
    </div>
    <div
      v-if="$slots.default"
      :class="regionClass(props, 'control', 'miu-form-row__control')"
      :style="regionStyle(props, 'control')"
    >
      <slot />
    </div>
  </div>
</template>
