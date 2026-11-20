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
  closeOnOverlayClick: true,
  closeOnEsc: true,
  showClose: true,
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
  if (props.loading) return
  emit("cancel")
  emit("update:open", false)
}

function confirmAction(): void {
  if (props.loading) return
  emit("confirm")
}

function onDialogUpdateOpen(next: boolean): void {
  if (!next && props.loading) return
  if (!next) emit("cancel")
  emit("update:open", next)
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
    :close-on-overlay-click="!loading && closeOnOverlayClick"
    :close-on-esc="!loading && closeOnEsc"
    :show-close="!loading && showClose"
    :close-label="closeLabel"
    :class-names="classNames"
    :styles="styles"
    @update:open="onDialogUpdateOpen"
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
        @click="confirmAction"
      >
        {{ confirmLabel }}
      </Button>
    </template>
  </Dialog>
</template>
