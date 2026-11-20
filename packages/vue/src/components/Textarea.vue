<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { TextareaProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import { useFormFieldBinding } from "../composables/useFormField"
import { useMiuI18n } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<TextareaProps>(), {
  rows: 3,
  radius: "default",
  disabled: false,
  readonly: false,
  invalid: false,
  clearable: false,
  showCount: false,
  autoResize: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
  change: [value: string]
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const { t } = useMiuI18n()
const rootRef = ref<HTMLElement>()
const textareaRef = ref<HTMLTextAreaElement>()

const { resolvedSize, resolvedIconSize } = useControlSize({
  size: () => props.size,
  iconSize: () => props.iconSize,
  componentName: "Textarea",
})
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Textarea")
const field = useFormFieldBinding({
  id: () => props.id,
  disabled: () => props.disabled,
  readonly: () => props.readonly,
  invalid: () => props.invalid,
})

function emitValue(value: string): void {
  emit("update:modelValue", value)
  emit("change", value)
}

const model = computed({
  get: () => props.modelValue ?? "",
  set: (value: string) => emitValue(value),
})

const canShowClear = computed(
  () => props.clearable && model.value.length > 0 && !field.disabled.value && !field.readonly.value,
)
const canManualResize = computed(
  () => !props.autoResize && !field.disabled.value && !field.readonly.value,
)

function clear(): void {
  if (field.disabled.value || field.readonly.value) return
  emitValue("")
  emit("clear")
  focus()
}

function resize(): void {
  const element = textareaRef.value
  if (!element || !props.autoResize) return
  element.style.height = "auto"
  const max = props.autoResizeMaxHeight ?? 0
  element.style.height =
    max > 0 ? `${Math.min(element.scrollHeight, max)}px` : `${element.scrollHeight}px`
  element.style.overflowY = max > 0 && element.scrollHeight > max ? "auto" : "hidden"
}

let dragging = false
let dragStartY = 0
let dragStartHeight = 0
let dragMinHeight = 48

function onDragMove(event: MouseEvent): void {
  const element = textareaRef.value
  if (!dragging || !element) return
  const nextHeight = Math.max(
    dragMinHeight,
    Math.round(dragStartHeight + (event.clientY - dragStartY)),
  )
  element.style.height = `${nextHeight}px`
}

function stopManualResize(): void {
  if (!dragging) return
  dragging = false
  if (typeof window !== "undefined") {
    window.removeEventListener("pointermove", onDragMove)
    window.removeEventListener("pointerup", stopManualResize)
    window.removeEventListener("pointercancel", stopManualResize)
  }
}

function startManualResize(event: MouseEvent): void {
  const element = textareaRef.value
  if (!element || !canManualResize.value) return
  event.preventDefault()
  dragging = true
  dragStartY = event.clientY
  dragStartHeight = element.getBoundingClientRect().height || element.offsetHeight
  const parsedMin = Number.parseFloat(getComputedStyle(element).minHeight)
  dragMinHeight = Number.isFinite(parsedMin) && parsedMin > 0 ? parsedMin : 48
  if (typeof window !== "undefined") {
    window.addEventListener("pointermove", onDragMove)
    window.addEventListener("pointerup", stopManualResize)
    window.addEventListener("pointercancel", stopManualResize)
  }
}

onMounted(resize)
onBeforeUnmount(stopManualResize)
watch(model, () => nextTick(resize))

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
  textareaRef.value?.focus()
}

function blur(): void {
  textareaRef.value?.blur()
}

defineExpose({ focus, blur, textareaRef })
</script>

<template>
  <div
    ref="rootRef"
    :class="
      regionClass(props, 'root', 'miu-textarea', `miu-textarea--${resolvedSize.size}`, {
        'miu-textarea--disabled': field.disabled.value,
        'miu-textarea--readonly': field.readonly.value,
        'miu-textarea--invalid': field.invalid.value,
        'miu-textarea--clearable': canShowClear,
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-material="materialName"
    :data-invalid="field.invalid.value || undefined"
    :data-disabled="field.disabled.value || undefined"
    :data-readonly="field.readonly.value || undefined"
  >
    <textarea
      ref="textareaRef"
      v-model="model"
      :id="field.id.value"
      :name="name"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="field.disabled.value"
      :readonly="field.readonly.value"
      :maxlength="maxlength"
      :autocomplete="autocomplete"
      :aria-label="ariaLabel"
      :aria-describedby="field.describedBy.value"
      :aria-invalid="field.invalid.value || undefined"
      :aria-required="field.required.value || undefined"
      :aria-readonly="field.readonly.value || undefined"
      :class="regionClass(props, 'textarea', 'miu-textarea__control')"
      :style="regionStyle(props, 'textarea')"
      @focus="onFocus"
      @blur="onBlur"
    />
    <button
      v-if="canShowClear"
      type="button"
      :class="regionClass(props, 'clear', 'miu-textarea__clear')"
      :style="regionStyle(props, 'clear')"
      :aria-label="t('input.clear')"
      @click="clear"
      @focus="onFocus"
      @blur="onBlur"
    >
      <Icon name="close" :size="resolvedIconSize.size" />
    </button>
    <div
      v-if="$slots.footer || showCount"
      :class="[
        regionClass(props, 'footer', 'miu-textarea__footer'),
        { 'miu-textarea__footer--resizable': canManualResize },
      ]"
      :style="regionStyle(props, 'footer')"
    >
      <slot name="footer" />
      <span
        v-if="showCount"
        :class="regionClass(props, 'count', 'miu-textarea__count')"
        :style="regionStyle(props, 'count')"
      >
        {{ maxlength ? `${model.length} / ${maxlength}` : model.length }}
      </span>
    </div>
    <span
      v-if="canManualResize"
      class="miu-textarea__resizer"
      aria-hidden="true"
      @pointerdown="startManualResize"
    >
      <svg viewBox="0 0 12 12" fill="none">
        <path
          d="M9.5 3.5L3.5 9.5M9.5 7.5L7.5 9.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    </span>
  </div>
</template>
