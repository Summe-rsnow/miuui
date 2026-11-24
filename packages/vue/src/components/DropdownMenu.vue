<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "reka-ui"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { DropdownMenuProps } from "../types"
import { useMiuTheme } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<DropdownMenuProps>(), {
  open: undefined,
  side: "bottom",
  sideOffset: 6,
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
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "DropdownMenu")

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
  <DropdownMenuRoot :open="disabled ? false : open" :modal="modal" @update:open="onUpdateOpen">
    <DropdownMenuTrigger as-child :disabled="disabled">
      <slot name="trigger" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal :to="theme.portalTarget.value">
      <DropdownMenuContent
        :class="regionClass(props, 'content', 'miu-menu')"
        :style="mergeStyle(regionStyle(props, 'content'), materialTokens)"
        :data-material="materialName"
        :data-miu-radius="radius"
        :data-miu-icon-size="iconSize"
        :data-density="density"
        :side="side"
        :align="align"
        :side-offset="sideOffset"
        @escape-key-down="onEscapeKeyDown"
        @pointer-down-outside="onOutsideDismiss"
        @interact-outside="onOutsideDismiss"
      >
        <template
          v-for="(item, index) in items"
          :key="item.separator ? `sep-${index}` : `${item.value}-${index}`"
        >
          <DropdownMenuSeparator
            v-if="item.separator"
            :class="regionClass(props, 'separator', 'miu-menu__separator')"
            :style="regionStyle(props, 'separator')"
          />
          <DropdownMenuSub v-else-if="item.children?.length">
            <DropdownMenuSubTrigger
              :class="regionClass(props, 'item', 'miu-menu__item', 'miu-menu__sub-trigger')"
              :style="regionStyle(props, 'item')"
              :data-danger="item.danger || undefined"
              :disabled="item.disabled"
            >
              <Icon v-if="item.icon" :name="item.icon" />
              <span>{{ item.label }}</span>
              <Icon name="chevronRight" class="miu-menu__sub-arrow" />
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal :to="theme.portalTarget.value">
              <DropdownMenuSubContent
                :class="regionClass(props, 'content', 'miu-menu')"
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
                  v-for="(child, childIndex) in item.children"
                  :key="child.separator ? `csep-${childIndex}` : `${child.value}-${childIndex}`"
                >
                  <DropdownMenuSeparator
                    v-if="child.separator"
                    :class="regionClass(props, 'separator', 'miu-menu__separator')"
                    :style="regionStyle(props, 'separator')"
                  />
                  <DropdownMenuItem
                    v-else
                    :class="regionClass(props, 'item', 'miu-menu__item')"
                    :style="regionStyle(props, 'item')"
                    :data-danger="child.danger || undefined"
                    :disabled="child.disabled"
                    @select="emit('select', child.value)"
                  >
                    <Icon v-if="child.icon" :name="child.icon" />
                    <span>{{ child.label }}</span>
                  </DropdownMenuItem>
                </template>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem
            v-else
            :class="regionClass(props, 'item', 'miu-menu__item')"
            :style="regionStyle(props, 'item')"
            :data-danger="item.danger || undefined"
            :disabled="item.disabled"
            @select="emit('select', item.value)"
          >
            <Icon v-if="item.icon" :name="item.icon" />
            <span>{{ item.label }}</span>
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
