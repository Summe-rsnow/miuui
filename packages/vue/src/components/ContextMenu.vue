<script setup lang="ts">
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuRoot,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "reka-ui"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { ContextMenuProps } from "../types"
import { useMiuTheme } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<ContextMenuProps>(), {
  open: undefined,
  radius: "default",
  iconSize: "sm",
  modal: true,
  disabled: false,
  closeOnClickOutside: true,
  closeOnEsc: true,
})

const emit = defineEmits<{
  "update:open": [value: boolean]
  select: [value: string]
}>()

const theme = useMiuTheme()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "ContextMenu")

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
</script>

<template>
  <ContextMenuRoot :open="disabled ? false : open" :modal="modal" @update:open="onUpdateOpen">
    <ContextMenuTrigger as-child :disabled="disabled">
      <slot name="trigger" />
    </ContextMenuTrigger>
    <ContextMenuPortal :to="theme.portalTarget.value">
      <ContextMenuContent
        :class="regionClass(props, 'content', 'miu-menu', 'miu-context-menu')"
        :style="mergeStyle(regionStyle(props, 'content'), materialTokens)"
        :data-material="materialName"
        :data-miu-radius="radius"
        :data-miu-icon-size="iconSize"
        :data-density="density"
        @escape-key-down="onEscapeKeyDown"
        @pointer-down-outside="onOutsideDismiss"
        @interact-outside="onOutsideDismiss"
      >
        <template
          v-for="(item, index) in items"
          :key="item.separator ? `sep-${index}` : `${item.value}-${index}`"
        >
          <ContextMenuSeparator
            v-if="item.separator"
            :class="regionClass(props, 'separator', 'miu-menu__separator')"
            :style="regionStyle(props, 'separator')"
          />
          <ContextMenuItem
            v-else
            :class="regionClass(props, 'item', 'miu-menu__item')"
            :style="regionStyle(props, 'item')"
            :data-danger="item.danger || undefined"
            :disabled="item.disabled"
            @select="emit('select', item.value)"
          >
            <Icon v-if="item.icon" :name="item.icon" />
            <span>{{ item.label }}</span>
          </ContextMenuItem>
        </template>
      </ContextMenuContent>
    </ContextMenuPortal>
  </ContextMenuRoot>
</template>
