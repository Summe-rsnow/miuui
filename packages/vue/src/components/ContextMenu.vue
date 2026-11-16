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
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<ContextMenuProps>(), {
  radius: "default",
  iconSize: "sm",
})

const emit = defineEmits<{ select: [value: string] }>()
const theme = useMiuTheme()
</script>

<template>
  <ContextMenuRoot>
    <ContextMenuTrigger as-child>
      <slot name="trigger" />
    </ContextMenuTrigger>
    <ContextMenuPortal :to="theme.portalTarget.value">
      <ContextMenuContent
        :class="regionClass(props, 'content', 'miu-menu', 'miu-context-menu')"
        :style="regionStyle(props, 'content')"
        :data-material="material"
        :data-miu-radius="radius"
        :data-miu-icon-size="iconSize"
        :data-density="density"
      >
        <template v-for="item in items" :key="item.value">
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
