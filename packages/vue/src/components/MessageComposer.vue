<script setup lang="ts">
import { computed, ref } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { MessageComposerProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import { useFormFieldBinding } from "../composables/useFormField"
import { useMiuI18n } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Button from "./Button.vue"
import Textarea from "./Textarea.vue"

const props = withDefaults(defineProps<MessageComposerProps>(), {
  rows: 3,
  radius: "default",
  disabled: false,
  readonly: false,
  invalid: false,
  clearable: false,
  loading: false,
  showCount: false,
  showCancel: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
  change: [value: string]
  clear: []
  send: []
  cancel: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const { t } = useMiuI18n()
const rootRef = ref<HTMLElement>()
const textareaCompRef = ref<{
  focus: () => void
  blur: () => void
  textareaRef?: HTMLTextAreaElement
}>()
const textareaRef = computed(() => textareaCompRef.value?.textareaRef)

const { resolvedIconSize } = useControlSize({
  size: () => props.size,
  iconSize: () => props.iconSize,
  componentName: "MessageComposer",
})
const { materialName, materialTokens } = useResolvedMaterial(
  () => props.material,
  "MessageComposer",
)
const field = useFormFieldBinding({
  disabled: () => props.disabled,
  readonly: () => props.readonly,
  invalid: () => props.invalid,
})

const isCompact = computed(() => props.density === "compact")
const sendText = computed(() => props.sendLabel ?? t("messageComposer.send"))
const cancelText = computed(() => props.cancelLabel ?? t("messageComposer.cancel"))
const isComposing = ref(false)

const model = computed({
  get: () => props.modelValue ?? "",
  set: (value: string) => {
    emit("update:modelValue", value)
    emit("change", value)
  },
})

const canSend = computed(() => {
  if (field.disabled.value || field.readonly.value || props.loading) return false
  if (model.value.trim().length === 0) return false
  if (props.maxlength && model.value.length > props.maxlength) return false
  return true
})

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Enter" && !event.shiftKey && !isComposing.value && !event.isComposing) {
    event.preventDefault()
    if (canSend.value) emit("send")
  }
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

function focus(): void {
  textareaCompRef.value?.focus()
}

function blur(): void {
  textareaCompRef.value?.blur()
}

defineExpose({ focus, blur, textareaRef })
</script>

<template>
  <div
    ref="rootRef"
    :class="
      regionClass(props, 'root', 'miu-message-composer', {
        'miu-message-composer--compact': isCompact,
        'miu-message-composer--disabled': field.disabled.value,
        'miu-message-composer--readonly': field.readonly.value,
        'miu-message-composer--invalid': field.invalid.value,
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-material="materialName"
    :data-density="density"
    :data-compact="isCompact || undefined"
    :data-disabled="field.disabled.value || undefined"
    :data-readonly="field.readonly.value || undefined"
    :data-invalid="field.invalid.value || undefined"
    :aria-busy="loading || undefined"
    @keydown="onKeydown"
    @compositionstart="isComposing = true"
    @compositionend="isComposing = false"
  >
    <Textarea
      ref="textareaCompRef"
      v-model="model"
      :placeholder="placeholder"
      :rows="isCompact ? 1 : rows"
      :size="size"
      :radius="radius"
      :icon-size="iconSize"
      :material="material"
      :clearable="clearable"
      :maxlength="maxlength"
      :show-count="showCount"
      :auto-resize="isCompact"
      :disabled="field.disabled.value"
      :readonly="field.readonly.value"
      :invalid="field.invalid.value"
      :class-names="{ root: classNames?.input }"
      :styles="{ root: styles?.input }"
      @clear="emit('clear')"
      @focus="onFocus"
      @blur="onBlur"
    />
    <div
      :class="regionClass(props, 'toolbar', 'miu-message-composer__toolbar')"
      :style="regionStyle(props, 'toolbar')"
    >
      <div
        :class="regionClass(props, 'tools', 'miu-message-composer__tools')"
        :style="regionStyle(props, 'tools')"
      >
        <slot name="tools" />
      </div>
      <div
        :class="regionClass(props, 'actions', 'miu-message-composer__actions')"
        :style="regionStyle(props, 'actions')"
      >
        <Button
          v-if="showCancel"
          variant="ghost"
          size="sm"
          :radius="radius"
          :icon-size="iconSize"
          :material="material"
          :disabled="field.disabled.value"
          :class-names="{ root: classNames?.cancel }"
          :styles="{ root: styles?.cancel }"
          @click="emit('cancel')"
          @focus="onFocus"
          @blur="onBlur"
        >
          {{ cancelText }}
        </Button>
        <Button
          size="sm"
          :radius="radius"
          :icon-size="iconSize"
          :material="material"
          :loading="loading"
          :disabled="!canSend"
          :class-names="{ root: classNames?.send }"
          :styles="{ root: styles?.send }"
          @click="emit('send')"
          @focus="onFocus"
          @blur="onBlur"
        >
          {{ sendText }}
        </Button>
      </div>
    </div>
  </div>
</template>
