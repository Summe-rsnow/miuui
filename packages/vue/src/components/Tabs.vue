<script setup lang="ts">
import { computed } from "vue"
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "reka-ui"
import {
  CONTROL_SIZES,
  regionClass,
  regionStyle,
  resolveControlSize,
  resolveIconSize,
} from "@miuui/core"
import type { TabsProps } from "../types"
import Icon from "./Icon.vue"
import { useMiuSizeHint } from "../composables/useSizeHint"

const props = withDefaults(defineProps<TabsProps>(), {
  variant: "underline",
  radius: "default",
})

const emit = defineEmits<{ "update:modelValue": [value: string] }>()

const sizeHint = useMiuSizeHint()
const size = computed(() => props.size ?? sizeHint.value ?? "md")
const resolvedSize = computed(() => resolveControlSize(size.value, CONTROL_SIZES))
const resolvedIconSize = computed(() => resolveIconSize(resolvedSize.value.size, props.iconSize))
</script>

<template>
  <TabsRoot
    :model-value="modelValue"
    :class="regionClass(props, 'root', 'miu-tabs', `miu-tabs--${resolvedSize.size}`)"
    :style="regionStyle(props, 'root')"
    :data-variant="variant"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <TabsList
      :class="regionClass(props, 'list', 'miu-tabs__list')"
      :style="regionStyle(props, 'list')"
      :aria-label="ariaLabel"
    >
      <TabsTrigger
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :disabled="item.disabled"
        :class="regionClass(props, 'trigger', 'miu-tabs__trigger')"
        :style="regionStyle(props, 'trigger')"
      >
        <Icon v-if="item.icon" :name="item.icon" />
        <span>{{ item.label }}</span>
      </TabsTrigger>
    </TabsList>
    <TabsContent
      v-for="item in items"
      :key="item.value"
      :value="item.value"
      :class="regionClass(props, 'panel', 'miu-tabs__panel')"
      :style="regionStyle(props, 'panel')"
    >
      <slot name="panel" :value="item.value" />
    </TabsContent>
  </TabsRoot>
</template>
