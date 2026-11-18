<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue"
import { CONTROL_SIZES, regionClass, regionStyle, resolveControlSize } from "@xcmm1543/miuui-core"
import type { TextareaProps } from "../types"
import { useMiuFormField } from "../composables/useFormField"
import { useMiuSizeHint } from "../composables/useSizeHint"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<TextareaProps>(), {
  rows: 3,
  radius: "default",
  disabled: false,
  readonly: false,
  invalid: false,
  showCount: false,
  autoResize: false,
})

const emit = defineEmits<{ "update:modelValue": [value: string] }>()

const autoId = useId()
const formField = useMiuFormField()
const textareaRef = ref<HTMLTextAreaElement>()

const sizeHint = useMiuSizeHint()
const size = computed(() => props.size ?? sizeHint.value ?? "md")
const resolvedSize = computed(() => resolveControlSize(size.value, CONTROL_SIZES))
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Textarea")
const textareaId = computed(() => props.id ?? formField?.id.value ?? autoId)
const describedBy = computed(() => formField?.describedBy.value)
const invalid = computed(() => props.invalid || formField?.invalid.value || false)
const required = computed(() => formField?.required.value || false)
const disabled = computed(() => props.disabled || formField?.disabled.value || false)

if (import.meta.env.DEV && resolvedSize.value.fallback) {
  console.warn(
    `[μui] Textarea: unsupported size "${size.value}", fell back to "${resolvedSize.value.size}".`,
  )
}
const model = computed({
  get: () => props.modelValue ?? "",
  set: (value: string) => emit("update:modelValue", value),
})

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
  if (!element || props.autoResize || disabled.value) return
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

function focus(): void {
  textareaRef.value?.focus()
}

defineExpose({ focus, textareaRef })
</script>

<template>
  <div
    :class="
      regionClass(props, 'root', 'miu-textarea', `miu-textarea--${resolvedSize.size}`, {
        'miu-textarea--disabled': disabled,
        'miu-textarea--invalid': invalid,
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-material="materialName"
    :data-invalid="invalid || undefined"
    :data-disabled="disabled || undefined"
  >
    <textarea
      ref="textareaRef"
      v-model="model"
      :id="textareaId"
      :name="name"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :autocomplete="autocomplete"
      :aria-label="ariaLabel"
      :aria-describedby="describedBy"
      :aria-invalid="invalid || undefined"
      :aria-required="required || undefined"
      :class="regionClass(props, 'textarea', 'miu-textarea__control')"
      :style="regionStyle(props, 'textarea')"
    />
    <div
      v-if="$slots.footer || (showCount && maxlength)"
      class="miu-textarea__footer"
      :class="[
        regionClass(props, 'footer'),
        { 'miu-textarea__footer--resizable': !autoResize && !disabled },
      ]"
      :style="regionStyle(props, 'footer')"
    >
      <slot name="footer" />
      <span v-if="showCount && maxlength" class="miu-textarea__count">
        {{ model.length }} / {{ maxlength }}
      </span>
    </div>
    <span
      v-if="!autoResize && !disabled"
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
