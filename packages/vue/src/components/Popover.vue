<script setup lang="ts">
import {
  PopoverAnchor,
  PopoverArrow,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from "reka-ui"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { PopoverProps } from "../types"
import { useMiuTheme } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<PopoverProps>(), {
  open: undefined,
  reference: undefined,
  side: "bottom",
  align: "center",
  sideOffset: 8,
  alignOffset: 0,
  collisionPadding: 8,
  autoMaxHeight: false,
  radius: "default",
  arrow: false,
  modal: false,
  disabled: false,
  closeOnClickOutside: true,
  closeOnEsc: true,
  autoFocus: true,
})

const emit = defineEmits<{ "update:open": [value: boolean] }>()
const theme = useMiuTheme()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Popover")

function onUpdateOpen(next: boolean): void {
  if (next && props.disabled) return
  emit("update:open", next)
}

function onEscapeKeyDown(event: KeyboardEvent): void {
  if (!props.closeOnEsc) event.preventDefault()
}

function onOutsideDismiss(event: Event): void {
  if (!props.closeOnClickOutside) event.preventDefault()
}

function onOpenAutoFocus(event: Event): void {
  if (!props.autoFocus) event.preventDefault()
}

function onCloseAutoFocus(event: Event): void {
  if (!props.autoFocus) event.preventDefault()
}
</script>

<template>
  <PopoverRoot :open="disabled ? false : open" :modal="modal" @update:open="onUpdateOpen">
    <PopoverAnchor v-if="reference" :reference="reference" style="display: contents" aria-hidden="true" />
    <PopoverTrigger v-if="$slots.trigger" as-child :disabled="disabled || undefined">
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverPortal :to="theme.portalTarget.value">
      <PopoverContent
        :class="regionClass(props, 'content', 'miu-popover')"
        :style="mergeStyle(regionStyle(props, 'content'), materialTokens)"
        :data-miu-radius="radius"
        :data-material="materialName"
        :data-auto-max-height="autoMaxHeight || undefined"
        :side="side"
        :align="align"
        :side-offset="sideOffset"
        :align-offset="alignOffset"
        :collision-padding="collisionPadding"
        @escape-key-down="onEscapeKeyDown"
        @pointer-down-outside="onOutsideDismiss"
        @interact-outside="onOutsideDismiss"
        @open-auto-focus="onOpenAutoFocus"
        @close-auto-focus="onCloseAutoFocus"
      >
        <slot />
        <PopoverArrow
          v-if="arrow"
          :class="regionClass(props, 'arrow', 'miu-popover__arrow')"
          :style="regionStyle(props, 'arrow')"
        />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
