<script setup lang="ts">
import { computed } from "vue"
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from "reka-ui"
import { regionClass, regionStyle, resolveIconSize } from "@xcmm1543/miuui-core"
import type { AccordionProps } from "../types"
import Icon from "./Icon.vue"
import { useControlSize } from "../composables/useControlSize"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<AccordionProps>(), {
  items: () => [],
  multiple: false,
  collapsible: true,
  variant: "default",
  radius: "default",
  disabled: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: string | string[] | undefined]
  change: [value: string | string[] | undefined]
}>()

const { resolvedSize } = useControlSize({
  size: () => props.size,
  iconSize: () => props.iconSize,
  componentName: "Accordion",
})
const resolvedIconSize = computed(() => resolveIconSize(resolvedSize.value.size, props.iconSize))
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Accordion")

function onUpdate(value: string | string[] | undefined): void {
  if (props.disabled) return
  emit("update:modelValue", value)
  emit("change", value)
}
</script>

<template>
  <AccordionRoot
    :type="multiple ? 'multiple' : 'single'"
    :collapsible="collapsible"
    :disabled="disabled"
    :model-value="modelValue"
    :default-value="defaultValue"
    :class="
      regionClass(
        props,
        'root',
        'miu-accordion',
        `miu-accordion--${resolvedSize.size}`,
        `miu-accordion--${variant}`,
        {
          'miu-accordion--disabled': disabled,
        },
      )
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-variant="variant"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-material="materialName"
    :data-density="density"
    :data-disabled="disabled || undefined"
    @update:model-value="onUpdate"
  >
    <AccordionItem
      v-for="(item, index) in items"
      :key="item.value"
      :value="item.value"
      :disabled="disabled || item.disabled"
      :class="regionClass(props, 'item', 'miu-accordion__item')"
      :style="regionStyle(props, 'item')"
    >
      <AccordionHeader
        :class="regionClass(props, 'header', 'miu-accordion__header')"
        :style="regionStyle(props, 'header')"
      >
        <AccordionTrigger
          :class="regionClass(props, 'trigger', 'miu-accordion__trigger')"
          :style="regionStyle(props, 'trigger')"
        >
          <slot name="trigger" :item="item" :index="index">
            <span class="miu-accordion__trigger-lead">
              <Icon v-if="item.icon" :name="item.icon" class="miu-accordion__icon" />
              <span class="miu-accordion__trigger-text">
                <span class="miu-accordion__title">{{ item.title }}</span>
                <span v-if="item.description" class="miu-accordion__description">
                  {{ item.description }}
                </span>
              </span>
            </span>
          </slot>
          <span
            aria-hidden="true"
            :class="regionClass(props, 'indicator', 'miu-accordion__indicator')"
            :style="regionStyle(props, 'indicator')"
          >
            <Icon name="chevronDown" />
          </span>
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent
        :class="regionClass(props, 'content', 'miu-accordion__content')"
        :style="regionStyle(props, 'content')"
      >
        <div class="miu-accordion__content-inner">
          <slot name="content" :item="item" :index="index">
            {{ item.content }}
          </slot>
        </div>
      </AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>
