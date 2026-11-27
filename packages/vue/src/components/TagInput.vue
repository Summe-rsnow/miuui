<script setup lang="ts">
import { computed, ref, type ComponentPublicInstance } from "vue"
import {
  TagsInputClear,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
  TagsInputRoot,
} from "reka-ui"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { TagInputProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import { useFormFieldBinding } from "../composables/useFormField"
import { useMiuI18n } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<TagInputProps>(), {
  radius: "default",
  delimiter: ",",
  duplicate: false,
  addOnBlur: false,
  addOnPaste: false,
  disabled: false,
  readonly: false,
  invalid: false,
  clearable: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: string[]]
  change: [value: string[]]
  clear: []
  add: [value: string]
  remove: [value: string]
  invalid: [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const rootRef = ref<HTMLElement>()
const inputRef = ref<ComponentPublicInstance | HTMLElement | null>(null)
const isComposing = ref(false)
const internalValue = ref<string[]>([])

const { t } = useMiuI18n()

const { resolvedSize, resolvedIconSize } = useControlSize({
  size: () => props.size,
  iconSize: () => props.iconSize,
  componentName: "TagInput",
})
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "TagInput")
const field = useFormFieldBinding({
  id: () => props.id,
  disabled: () => props.disabled,
  readonly: () => props.readonly,
  invalid: () => props.invalid,
})

const tags = computed<string[]>(() =>
  props.modelValue !== undefined ? props.modelValue : internalValue.value,
)

const canClear = computed(
  () => props.clearable && tags.value.length > 0 && !field.disabled.value && !field.readonly.value,
)

function onUpdate(next: unknown): void {
  if (field.disabled.value || field.readonly.value) return
  const normalized = Array.isArray(next) ? next.map(String) : []
  if (props.modelValue === undefined) internalValue.value = normalized
  emit("update:modelValue", normalized)
  emit("change", normalized)
}

function onAddTag(value: unknown): void {
  if (field.disabled.value || field.readonly.value) return
  emit("add", String(value))
}

function onRemoveTag(value: unknown): void {
  if (field.disabled.value || field.readonly.value) return
  emit("remove", String(value))
}

function onInvalidTag(value: unknown): void {
  if (field.disabled.value || field.readonly.value) return
  emit("invalid", String(value))
}

function removeTagAt(index: number): void {
  if (field.disabled.value || field.readonly.value) return
  if (index < 0 || index >= tags.value.length) return
  const removed = tags.value[index]
  const next = tags.value.filter((_, i) => i !== index)
  if (props.modelValue === undefined) internalValue.value = next
  emit("update:modelValue", next)
  emit("change", next)
  if (removed !== undefined) emit("remove", removed)
  focus()
}

function onClearClick(event: Event): void {
  if (field.disabled.value || field.readonly.value) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit("clear")
  focus()
}

function onDeleteBlockedInteraction(event: Event): void {
  if (field.readonly.value || field.disabled.value) {
    event.preventDefault()
    event.stopPropagation()
  }
}

function onInputKeydownCapture(event: KeyboardEvent): void {
  if (isComposing.value || event.isComposing) {
    if (event.key === "Enter" || event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault()
      event.stopPropagation()
    }
    return
  }
  if (field.readonly.value) {
    if (
      event.key === "Enter" ||
      event.key === "Backspace" ||
      event.key === "Delete" ||
      event.key === " "
    ) {
      event.preventDefault()
      event.stopPropagation()
    }
    return
  }
  if (event.key === "Enter") {
    const target = event.target as HTMLInputElement | null
    if (!target?.value.trim()) {
      event.preventDefault()
      event.stopPropagation()
    }
  }
}

function onInputCapture(event: Event): void {
  if (field.readonly.value || field.disabled.value) {
    event.preventDefault()
    event.stopPropagation()
  }
}

function onPasteCapture(event: ClipboardEvent): void {
  if (field.readonly.value || field.disabled.value) {
    event.preventDefault()
    event.stopPropagation()
  }
}

function onControlMouseDown(event: MouseEvent): void {
  if (field.disabled.value) return
  const target = event.target as HTMLElement | null
  if (target?.closest("button") || target?.tagName === "INPUT") return
  event.preventDefault()
  focus()
}

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

function resolveInputElement(): HTMLInputElement | null {
  const node = inputRef.value
  if (!node) return null
  if (node instanceof HTMLInputElement) return node
  if (node instanceof HTMLElement) return node.querySelector("input")
  const el = node.$el
  if (el instanceof HTMLInputElement) return el
  if (el instanceof HTMLElement) return el.querySelector("input")
  return null
}

function focus(): void {
  resolveInputElement()?.focus()
}

function blur(): void {
  resolveInputElement()?.blur()
}

defineExpose({ focus, blur, inputRef })
</script>

<template>
  <div
    ref="rootRef"
    :class="
      regionClass(props, 'root', 'miu-tag-input', `miu-tag-input--${resolvedSize.size}`, {
        'miu-tag-input--disabled': field.disabled.value,
        'miu-tag-input--readonly': field.readonly.value,
        'miu-tag-input--invalid': field.invalid.value,
        'miu-tag-input--has-clear': canClear,
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
    @mousedown="onControlMouseDown"
  >
    <TagsInputRoot
      class="miu-tag-input__control"
      :model-value="tags"
      :name="name"
      :max="max"
      :delimiter="delimiter"
      :duplicate="duplicate"
      :add-on-blur="addOnBlur && !field.readonly.value && !field.disabled.value"
      :add-on-paste="addOnPaste && !field.readonly.value && !field.disabled.value"
      :disabled="field.disabled.value"
      :required="field.required.value"
      @update:model-value="onUpdate"
      @add-tag="onAddTag"
      @remove-tag="onRemoveTag"
      @invalid="onInvalidTag"
    >
      <TagsInputItem
        v-for="(tag, index) in tags"
        :key="`${index}-${tag}`"
        :value="tag"
        :disabled="field.disabled.value"
        :class="regionClass(props, 'tag', 'miu-tag-input__tag')"
        :style="regionStyle(props, 'tag')"
      >
        <slot name="tag" :value="tag" :index="index" :remove="() => removeTagAt(index)">
          <TagsInputItemText
            :class="regionClass(props, 'tagText', 'miu-tag-input__tag-text')"
            :style="regionStyle(props, 'tagText')"
          />
          <TagsInputItemDelete
            :class="regionClass(props, 'tagDelete', 'miu-tag-input__tag-delete')"
            :style="regionStyle(props, 'tagDelete')"
            :aria-label="`${t('tagInput.remove')} ${tag}`"
            :disabled="field.disabled.value || field.readonly.value || undefined"
            @pointerdown.prevent
            @mousedown.prevent
            @click.capture="onDeleteBlockedInteraction"
            @focus="onFocus"
            @blur="onBlur"
          >
            <Icon name="close" size="xs" />
          </TagsInputItemDelete>
        </slot>
      </TagsInputItem>

      <TagsInputInput
        ref="inputRef"
        :id="field.id.value"
        :placeholder="tags.length === 0 ? (placeholder ?? t('tagInput.placeholder')) : undefined"
        :readonly="field.readonly.value || undefined"
        :aria-label="ariaLabel"
        :aria-describedby="field.describedBy.value"
        :aria-invalid="field.invalid.value || undefined"
        :aria-required="field.required.value || undefined"
        :aria-readonly="field.readonly.value || undefined"
        :class="regionClass(props, 'input', 'miu-tag-input__input')"
        :style="regionStyle(props, 'input')"
        @compositionstart="isComposing = true"
        @compositionend="isComposing = false"
        @keydown.capture="onInputKeydownCapture"
        @input.capture="onInputCapture"
        @paste.capture="onPasteCapture"
        @focus="onFocus"
        @blur="onBlur"
      />

      <TagsInputClear
        v-if="canClear"
        :class="regionClass(props, 'clear', 'miu-tag-input__clear')"
        :style="regionStyle(props, 'clear')"
        :aria-label="t('common.clear')"
        @pointerdown.prevent
        @mousedown.prevent
        @click="onClearClick"
        @focus="onFocus"
        @blur="onBlur"
      >
        <Icon name="close" size="sm" />
      </TagsInputClear>
    </TagsInputRoot>
  </div>
</template>
