<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "reka-ui"
import { regionClass, regionStyle } from "@miuui/core"
import type { DropdownMenuProps } from "../types"
import { useMiuTheme } from "../composables/useMiu"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<DropdownMenuProps>(), {
  open: undefined,
  side: "bottom",
  sideOffset: 6,
  radius: "default",
  iconSize: "sm",
})

const emit = defineEmits<{
  "update:open": [value: boolean]
  select: [value: string]
}>()

const theme = useMiuTheme()
</script>

<template>
  <DropdownMenuRoot :open="open" @update:open="emit('update:open', $event)">
    <DropdownMenuTrigger as-child>
      <slot name="trigger" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal :to="theme.portalTarget.value">
      <DropdownMenuContent
        :class="regionClass(props, 'content', 'miu-menu')"
        :style="regionStyle(props, 'content')"
        :data-material="material"
        :data-miu-radius="radius"
        :data-miu-icon-size="iconSize"
        :data-density="density"
        :side="side"
        :align="align"
        :side-offset="sideOffset"
      >
        <template v-for="item in items" :key="item.value">
          <DropdownMenuSeparator
            v-if="item.separator"
            :class="regionClass(props, 'separator', 'miu-menu__separator')"
            :style="regionStyle(props, 'separator')"
          />
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
