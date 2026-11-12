<script setup lang="ts">
import { computed } from "vue"
import { regionClass, regionStyle } from "@miuui/core"
import type { MessageComposerProps } from "../types"
import { useMiuI18n } from "../composables/useMiu"
import Button from "./Button.vue"
import Textarea from "./Textarea.vue"

const props = withDefaults(defineProps<MessageComposerProps>(), {
  rows: 3,
  radius: "default",
  disabled: false,
  loading: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
  send: []
}>()

const { t } = useMiuI18n()
const label = computed(() => props.sendLabel ?? t("messageComposer.send"))

const model = computed({
  get: () => props.modelValue ?? "",
  set: (value: string) => emit("update:modelValue", value),
})
</script>

<template>
  <div
    :class="regionClass(props, 'root', 'miu-message-composer')"
    :style="regionStyle(props, 'root')"
  >
    <Textarea
      v-model="model"
      :placeholder="placeholder"
      :rows="rows"
      :size="size"
      :radius="radius"
      :material="material"
      :maxlength="maxlength"
      :disabled="disabled"
      :class-names="{ root: classNames?.input }"
      :styles="{ root: styles?.input }"
    />
    <div
      :class="regionClass(props, 'actions', 'miu-message-composer__actions')"
      :style="regionStyle(props, 'actions')"
    >
      <Button
        size="sm"
        :radius="radius"
        :material="material"
        :loading="loading"
        :disabled="disabled || model.trim().length === 0"
        :class-names="{ root: classNames?.send }"
        :styles="{ root: styles?.send }"
        @click="emit('send')"
      >
        {{ label }}
      </Button>
    </div>
  </div>
</template>
