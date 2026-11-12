<script setup lang="ts">
import { computed } from "vue"
import type { ConfirmDialogProps } from "../types"
import { useMiuI18n } from "../composables/useMiu"
import Button from "./Button.vue"
import Dialog from "./Dialog.vue"

const props = withDefaults(defineProps<ConfirmDialogProps>(), {
  open: false,
  size: "sm",
  radius: "lg",
  danger: false,
  loading: false,
})

const emit = defineEmits<{
  "update:open": [value: boolean]
  confirm: []
  cancel: []
}>()

const { t } = useMiuI18n()
const confirmLabel = computed(() => props.confirmLabel ?? t("common.confirm"))
const cancelLabel = computed(() => props.cancelLabel ?? t("common.cancel"))

function cancel(): void {
  emit("cancel")
  emit("update:open", false)
}
</script>

<template>
  <Dialog
    :open="open"
    :title="title"
    :description="description"
    :size="size"
    :radius="radius"
    :material="material"
    :class-names="classNames"
    :styles="styles"
    @update:open="emit('update:open', $event)"
  >
    <template v-if="$slots.default" #default><slot /></template>
    <template #footer>
      <Button
        variant="secondary"
        :disabled="loading"
        :class-names="{ root: classNames?.cancel }"
        :styles="{ root: styles?.cancel }"
        @click="cancel"
      >
        {{ cancelLabel }}
      </Button>
      <Button
        :variant="danger ? 'danger' : 'solid'"
        :loading="loading"
        :class-names="{ root: classNames?.confirm }"
        :styles="{ root: styles?.confirm }"
        @click="emit('confirm')"
      >
        {{ confirmLabel }}
      </Button>
    </template>
  </Dialog>
</template>
