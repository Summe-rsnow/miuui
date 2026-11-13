<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { PopoverArrow, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from "reka-ui"
import { regionClass, regionStyle } from "@miuui/core"
import type { PopconfirmProps } from "../types"
import { useMiuI18n, useMiuTheme } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Button from "./Button.vue"

const props = withDefaults(defineProps<PopconfirmProps>(), {
  open: undefined,
  side: "top",
  align: "center",
  sideOffset: 8,
  radius: "default",
  danger: false,
  loading: false,
})

const emit = defineEmits<{
  "update:open": [value: boolean]
  confirm: []
  cancel: []
}>()

const theme = useMiuTheme()
const { t } = useMiuI18n()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Popconfirm")
const internalOpen = ref(props.open ?? false)

watch(
  () => props.open,
  (val) => {
    if (val !== undefined) internalOpen.value = val
  },
)

const isOpen = computed(() => (props.open !== undefined ? props.open : internalOpen.value))
const confirmText = computed(() => props.confirmLabel ?? t("common.confirm"))
const cancelText = computed(() => props.cancelLabel ?? t("common.cancel"))

function setOpen(next: boolean): void {
  if (props.open === undefined) internalOpen.value = next
  emit("update:open", next)
}

function onCancel(): void {
  emit("cancel")
  setOpen(false)
}

function onConfirm(): void {
  emit("confirm")
  if (!props.loading) setOpen(false)
}
</script>

<template>
  <PopoverRoot :open="isOpen" @update:open="setOpen">
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverPortal :to="theme.portalTarget.value">
      <PopoverContent
        :class="regionClass(props, 'content', 'miu-popover', 'miu-popconfirm')"
        :style="mergeStyle(regionStyle(props, 'content'), materialTokens)"
        :data-miu-radius="radius"
        :data-material="materialName"
        :side="side"
        :align="align"
        :side-offset="sideOffset"
      >
        <div
          :class="regionClass(props, 'body', 'miu-popconfirm__body')"
          :style="regionStyle(props, 'body')"
        >
          <p class="miu-popconfirm__title">{{ title }}</p>
          <p v-if="description" class="miu-popconfirm__description">{{ description }}</p>
        </div>
        <div
          :class="regionClass(props, 'actions', 'miu-popconfirm__actions')"
          :style="regionStyle(props, 'actions')"
        >
          <Button
            size="xs"
            variant="ghost"
            :disabled="loading"
            :class-names="{ root: classNames?.cancel }"
            :styles="{ root: styles?.cancel }"
            @click="onCancel"
          >
            {{ cancelText }}
          </Button>
          <Button
            size="xs"
            :variant="danger ? 'danger' : 'solid'"
            :loading="loading"
            :class-names="{ root: classNames?.confirm }"
            :styles="{ root: styles?.confirm }"
            @click="onConfirm"
          >
            {{ confirmText }}
          </Button>
        </div>
        <PopoverArrow class="miu-popover__arrow" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
