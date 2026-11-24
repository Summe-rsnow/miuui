<script setup lang="ts">
import { computed, nextTick, ref, useId, type ComponentPublicInstance } from "vue"
import { RadioGroupIndicator, RadioGroupItem, RadioGroupRoot } from "reka-ui"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { RadioGroupOption, RadioGroupProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import { useFormFieldBinding } from "../composables/useFormField"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import { useSlidingIndicator } from "../composables/useSlidingIndicator"

const props = withDefaults(defineProps<RadioGroupProps>(), {
  options: () => [],
  orientation: "vertical",
  variant: "radio",
  radius: "default",
  disabled: false,
  readonly: false,
  invalid: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: string | number]
  change: [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const autoId = useId()
const rootRef = ref<ComponentPublicInstance | HTMLElement | null>(null)

const { resolvedSize, resolvedIconSize } = useControlSize({
  size: () => props.size,
  supported: ["sm", "md", "lg"],
  defaultSize: "md",
  iconSize: () => props.iconSize,
  componentName: "RadioGroup",
})
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "RadioGroup")
const field = useFormFieldBinding({
  disabled: () => props.disabled,
  readonly: () => props.readonly,
  invalid: () => props.invalid,
})

const normalizedOptions = computed<RadioGroupOption[]>(() =>
  props.options.map((entry) =>
    typeof entry === "string" ? { value: entry, label: entry } : entry,
  ),
)

const {
  setItemRef,
  setIndicatorRef,
  indicatorMetrics,
  indicatorAnimated,
  indicatorStyle,
  measure,
} = useSlidingIndicator({
    containerRef: rootRef,
    activeKey: () => props.modelValue,
    enabled: () => props.variant === "button",
    fallbackSelector: '.miu-radio-group__item[data-state="checked"]',
    watchSources: () => [
      props.modelValue,
      props.options,
      props.variant,
      props.size,
      props.orientation,
    ],
    baseStyle: () => regionStyle(props, "indicator"),
  })

function unwrapElement(node: unknown): HTMLElement | null {
  if (!node) return null
  if (node instanceof HTMLElement) return node
  const maybeComp = node as { $el?: unknown }
  return maybeComp.$el instanceof HTMLElement ? maybeComp.$el : null
}

function onUpdate(value: unknown): void {
  if (field.disabled.value || field.readonly.value) return
  if (typeof value === "string" || typeof value === "number") {
    emit("update:modelValue", value)
    emit("change", value)
    void nextTick().then(() => measure())
  }
}

const READONLY_BLOCKED_KEYS = new Set([
  " ",
  "Enter",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
])

function onReadonlyClick(event: MouseEvent): void {
  if (field.readonly.value) {
    event.preventDefault()
    event.stopPropagation()
  }
}

function onReadonlyKeydown(event: KeyboardEvent): void {
  if (field.readonly.value && READONLY_BLOCKED_KEYS.has(event.key)) {
    event.preventDefault()
    event.stopPropagation()
  }
}

function onFocus(event: FocusEvent): void {
  const rootEl = unwrapElement(rootRef.value)
  const from = event.relatedTarget as Node | null
  if (from && rootEl?.contains(from)) return
  emit("focus", event)
}

function onBlur(event: FocusEvent): void {
  const rootEl = unwrapElement(rootRef.value)
  const to = event.relatedTarget as Node | null
  if (to && rootEl?.contains(to)) return
  emit("blur", event)
}

function focus(): void {
  const rootEl = unwrapElement(rootRef.value)
  if (!rootEl) return
  const target =
    rootEl.querySelector<HTMLElement>(
      '.miu-radio-group__item[data-state="checked"]:not(:disabled)',
    ) ?? rootEl.querySelector<HTMLElement>(".miu-radio-group__item:not(:disabled)")
  target?.focus()
}

function blur(): void {
  const rootEl = unwrapElement(rootRef.value)
  if (!rootEl) return
  const active = typeof document !== "undefined" ? document.activeElement : null
  if (active instanceof HTMLElement && rootEl.contains(active)) {
    active.blur()
  }
}

defineExpose({ focus, blur, rootRef })
</script>

<template>
  <RadioGroupRoot
    ref="rootRef"
    :model-value="modelValue"
    :orientation="orientation"
    :disabled="field.disabled.value"
    :required="field.required.value"
    :name="name"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabel ? undefined : field.labelId?.value"
    :aria-describedby="field.describedBy.value"
    :aria-invalid="field.invalid.value || undefined"
    :aria-readonly="field.readonly.value || undefined"
    :class="
      regionClass(
        props,
        'root',
        'miu-radio-group',
        `miu-radio-group--${orientation}`,
        `miu-radio-group--${variant}`,
        `miu-radio-group--${resolvedSize.size}`,
        {
          'miu-radio-group--disabled': field.disabled.value,
          'miu-radio-group--readonly': field.readonly.value,
          'miu-radio-group--invalid': field.invalid.value,
          'miu-radio-group--has-indicator': variant === 'button' && Boolean(indicatorMetrics),
        },
      )
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-material="materialName"
    :data-variant="variant"
    :data-orientation="orientation"
    :data-invalid="field.invalid.value || undefined"
    :data-disabled="field.disabled.value || undefined"
    :data-readonly="field.readonly.value || undefined"
    @click.capture="onReadonlyClick"
    @keydown.capture="onReadonlyKeydown"
    @update:model-value="onUpdate"
  >
    <span
      v-if="variant === 'button' && indicatorMetrics"
      :ref="setIndicatorRef"
      aria-hidden="true"
      :class="
        regionClass(props, 'indicator', 'miu-radio-group__sliding-indicator', {
          'miu-radio-group__sliding-indicator--animated': indicatorAnimated,
        })
      "
      :style="indicatorStyle"
    />
    <div
      v-for="(option, index) in normalizedOptions"
      :key="option.value"
      class="miu-radio-group__entry"
      :data-disabled="option.disabled || field.disabled.value || undefined"
    >
      <RadioGroupItem
        :id="`${autoId}-item-${index}`"
        :ref="(el) => setItemRef(option.value, el)"
        :value="option.value"
        :disabled="option.disabled || field.disabled.value"
        :class="regionClass(props, 'item', 'miu-radio-group__item')"
        :style="regionStyle(props, 'item')"
        @focus="onFocus"
        @blur="onBlur"
      >
        <template v-if="variant === 'button'">
          <span>{{ option.label }}</span>
        </template>
        <template v-else>
          <span class="miu-radio-group__control">
            <RadioGroupIndicator
              :class="regionClass(props, 'indicator', 'miu-radio-group__indicator')"
              :style="regionStyle(props, 'indicator')"
            />
          </span>
        </template>
      </RadioGroupItem>
      <label
        v-if="variant === 'radio'"
        :for="`${autoId}-item-${index}`"
        :class="regionClass(props, 'label', 'miu-radio-group__label')"
        :style="regionStyle(props, 'label')"
      >
        <span>{{ option.label }}</span>
        <span
          v-if="option.description"
          :class="regionClass(props, 'description', 'miu-radio-group__description')"
          :style="regionStyle(props, 'description')"
        >
          {{ option.description }}
        </span>
      </label>
    </div>
  </RadioGroupRoot>
</template>
