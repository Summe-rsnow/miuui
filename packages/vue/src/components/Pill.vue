<script setup lang="ts">
import { ref } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { PillProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import { useMiuI18n } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<PillProps>(), {
  active: false,
  radius: "full",
  variant: "filter",
  removable: false,
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
  remove: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const { t } = useMiuI18n()
const rootRef = ref<HTMLElement>()
const mainRef = ref<HTMLButtonElement>()

const { resolvedSize, resolvedIconSize } = useControlSize({
  size: () => props.size,
  supported: ["sm", "md", "lg"],
  defaultSize: "md",
  iconSize: () => props.iconSize,
  componentName: "Pill",
})
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Pill")

function onFocus(event: FocusEvent): void {
  const from = event.relatedTarget as Node | null
  if (from && rootRef.value?.contains(from)) return
  emit("focus", event)
}

function onBlur(event: FocusEvent): void {
  const to = event.relatedTarget as Node | null
  if (to && rootRef.value?.contains(to)) return
  emit("blur", event)
}

function focus(): void {
  mainRef.value?.focus()
}

function blur(): void {
  mainRef.value?.blur()
}

defineExpose({ focus, blur, mainRef })
</script>

<template>
  <span
    ref="rootRef"
    :class="
      regionClass(
        props,
        'root',
        'miu-pill',
        `miu-pill--${resolvedSize.size}`,
        `miu-pill--${variant}`,
        {
          'miu-pill--active': active,
          'miu-pill--disabled': disabled,
        },
      )
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-miu-radius="radius"
    :data-material="materialName"
    :data-active="active || undefined"
    :data-disabled="disabled || undefined"
  >
    <button
      ref="mainRef"
      type="button"
      :class="regionClass(props, 'main', 'miu-pill__main')"
      :style="regionStyle(props, 'main')"
      :disabled="disabled"
      :aria-pressed="active"
      @click="emit('click', $event)"
      @focus="onFocus"
      @blur="onBlur"
    >
      <Icon
        v-if="icon"
        :name="icon"
        :class="regionClass(props, 'icon', 'miu-pill__icon')"
        :style="regionStyle(props, 'icon')"
      />
      <span
        v-if="label || $slots.default"
        :class="regionClass(props, 'label', 'miu-pill__label')"
        :style="regionStyle(props, 'label')"
      >
        <slot>{{ label }}</slot>
      </span>
      <span
        v-if="count !== undefined"
        :class="regionClass(props, 'count', 'miu-pill__count')"
        :style="regionStyle(props, 'count')"
      >
        {{ count }}
      </span>
    </button>
    <button
      v-if="removable"
      type="button"
      :class="regionClass(props, 'remove', 'miu-pill__remove')"
      :style="regionStyle(props, 'remove')"
      :aria-label="t('common.close')"
      :disabled="disabled"
      @click="emit('remove')"
      @focus="onFocus"
      @blur="onBlur"
    >
      <Icon name="close" size="xs" />
    </button>
  </span>
</template>
