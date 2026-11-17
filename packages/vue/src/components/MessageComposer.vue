<script setup lang="ts">
import { computed, ref } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { MessageComposerProps } from "../types"
import { useMiuI18n } from "../composables/useMiu"
import Button from "./Button.vue"
import Textarea from "./Textarea.vue"

const props = withDefaults(defineProps<MessageComposerProps>(), {
  rows: 3,
  radius: "default",
  disabled: false,
  loading: false,
  compact: false,
  showCount: false,
  showCancel: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
  send: []
  cancel: []
}>()

const { t } = useMiuI18n()
const sendText = computed(() => props.sendLabel ?? t("messageComposer.send"))
const cancelText = computed(() => props.cancelLabel ?? t("messageComposer.cancel"))
const isComposing = ref(false)

const model = computed({
  get: () => props.modelValue ?? "",
  set: (value: string) => emit("update:modelValue", value),
})

const canSend = computed(() => {
  if (props.disabled || props.loading) return false
  if (model.value.trim().length === 0) return false
  if (props.maxlength && model.value.length > props.maxlength) return false
  return true
})

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Enter" && !event.shiftKey && !isComposing.value) {
    event.preventDefault()
    if (canSend.value) emit("send")
  }
}
</script>

<template>
  <div
    :class="
      regionClass(props, 'root', 'miu-message-composer', {
        'miu-message-composer--compact': compact,
      })
    "
    :style="regionStyle(props, 'root')"
    :data-compact="compact || undefined"
    @keydown="onKeydown"
    @compositionstart="isComposing = true"
    @compositionend="isComposing = false"
  >
    <Textarea
      v-model="model"
      :placeholder="placeholder"
      :rows="compact ? 1 : rows"
      :size="size"
      :radius="radius"
      :material="material"
      :maxlength="maxlength"
      :show-count="showCount"
      :auto-resize="compact"
      :disabled="disabled"
      :class-names="{ root: classNames?.input }"
      :styles="{ root: styles?.input }"
    />
    <div
      :class="regionClass(props, 'toolbar', 'miu-message-composer__toolbar')"
      :style="regionStyle(props, 'toolbar')"
    >
      <div class="miu-message-composer__tools">
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
          :material="material"
          :disabled="loading"
          :class-names="{ root: classNames?.cancel }"
          :styles="{ root: styles?.cancel }"
          @click="emit('cancel')"
        >
          {{ cancelText }}
        </Button>
        <Button
          size="sm"
          :radius="radius"
          :material="material"
          :loading="loading"
          :disabled="!canSend"
          :class-names="{ root: classNames?.send }"
          :styles="{ root: styles?.send }"
          @click="emit('send')"
        >
          {{ sendText }}
        </Button>
      </div>
    </div>
  </div>
</template>
