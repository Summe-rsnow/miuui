<script setup lang="ts">
import { computed } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { FormRowProps } from "../types"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<FormRowProps>(), {
  iconSize: "sm",
  variant: "plain",
  radius: "lg",
  clickable: false,
  disabled: false,
  layout: "row",
})

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "FormRow")
const useCardMaterial = computed(() => props.variant === "card" || props.material !== undefined)

const emit = defineEmits<{ click: [event: MouseEvent | KeyboardEvent] }>()

const INTERACTIVE_DESCENDANT_SELECTOR =
  'a, button, input, select, textarea, [role="button"], [role="checkbox"], [role="radio"], [role="switch"], [role="slider"], [role="tab"], [contenteditable="true"]'

function isNestedInteractive(event: Event): boolean {
  const target = event.target
  if (!(target instanceof Element)) return false
  const interactive = target.closest(INTERACTIVE_DESCENDANT_SELECTOR)
  return Boolean(interactive && interactive !== event.currentTarget)
}

function onClick(event: MouseEvent): void {
  if (props.disabled || !props.clickable || isNestedInteractive(event)) return
  emit("click", event)
}

function onKeydown(event: KeyboardEvent): void {
  if (props.disabled || !props.clickable || isNestedInteractive(event)) return
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
        'miu-form-row--clickable': clickable,
        'miu-form-row--disabled': disabled,
        'miu-form-row--card': variant === 'card',
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), useCardMaterial ? materialTokens : undefined)"
    :data-variant="variant"
    :data-miu-radius="variant === 'card' ? radius : undefined"
    :data-material="useCardMaterial ? materialName : undefined"
    :data-density="density"
    :data-miu-icon-size="iconSize"
    :data-disabled="disabled || undefined"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable && !disabled ? 0 : undefined"
    :aria-disabled="disabled || undefined"
    @click="onClick"
    @keydown="onKeydown"
  >
    <div class="miu-form-row__lead">
      <slot name="lead">
        <span
          v-if="icon || $slots.icon"
          :class="regionClass(props, 'icon', 'miu-form-row__icon')"
          :style="regionStyle(props, 'icon')"
        >
          <slot name="icon">
            <Icon v-if="icon" :name="icon" />
          </slot>
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
            v-if="description || $slots.description"
            :class="regionClass(props, 'description', 'miu-form-row__description')"
            :style="regionStyle(props, 'description')"
          >
            <slot name="description">{{ description }}</slot>
          </p>
          <p
            v-if="hint || $slots.hint"
            :class="regionClass(props, 'hint', 'miu-form-row__hint')"
            :style="regionStyle(props, 'hint')"
          >
            <slot name="hint">{{ hint }}</slot>
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
