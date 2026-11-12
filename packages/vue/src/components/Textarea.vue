<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useId, watch } from "vue"
import { CONTROL_SIZES, regionClass, regionStyle, resolveControlSize } from "@miuui/core"
import type { TextareaProps } from "../types"
import { useMiuFormField } from "../composables/useFormField"
import { useMiuSizeHint } from "../composables/useSizeHint"

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

onMounted(resize)
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
    :style="regionStyle(props, 'root')"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-material="material"
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
      :class="regionClass(props, 'footer')"
      :style="regionStyle(props, 'footer')"
    >
      <slot name="footer" />
      <span v-if="showCount && maxlength" class="miu-textarea__count">
        {{ model.length }} / {{ maxlength }}
      </span>
    </div>
  </div>
</template>
