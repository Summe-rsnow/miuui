<script setup lang="ts">
import { computed, ref, watch } from "vue"
import {
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperRoot,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "reka-ui"
import { regionClass, regionStyle, resolveIconSize } from "@xcmm1543/miuui-core"
import type { StepItem, StepsProps, StepStatus } from "../types"
import Icon from "./Icon.vue"
import { useControlSize } from "../composables/useControlSize"

const props = withDefaults(defineProps<StepsProps>(), {
  items: () => [],
  orientation: "horizontal",
  linear: false,
  clickable: true,
  radius: "default",
  disabled: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: number]
  change: [value: number]
}>()

const { resolvedSize } = useControlSize({
  size: () => props.size,
  supported: ["sm", "md", "lg"] as const,
  iconSize: () => props.iconSize,
  componentName: "Steps",
})
const resolvedIconSize = computed(() => resolveIconSize(resolvedSize.value.size, props.iconSize))

const internalStep = ref(props.modelValue ?? 1)
watch(
  () => props.modelValue,
  (next) => {
    if (next !== undefined) internalStep.value = next
  },
)

const currentStep = computed(() => props.modelValue ?? internalStep.value)

function getStepStatus(item: StepItem, index: number): StepStatus {
  if (item.status) return item.status
  const stepNum = index + 1
  if (stepNum < currentStep.value) return "finish"
  if (stepNum === currentStep.value) return "process"
  return "wait"
}

function onUpdate(step: number | undefined): void {
  if (props.disabled || !props.clickable || typeof step !== "number") return
  if (currentStep.value === step) return
  if (props.modelValue === undefined) {
    internalStep.value = step
  }
  emit("update:modelValue", step)
  emit("change", step)
}
</script>

<template>
  <StepperRoot
    :as="ariaLabel ? 'nav' : 'div'"
    :aria-label="ariaLabel"
    :model-value="currentStep"
    :orientation="orientation"
    :linear="linear"
    :class="
      regionClass(
        props,
        'root',
        'miu-steps',
        `miu-steps--${resolvedSize.size}`,
        `miu-steps--${orientation}`,
        {
          'miu-steps--clickable': clickable && !disabled,
          'miu-steps--disabled': disabled,
        },
      )
    "
    :style="regionStyle(props, 'root')"
    :data-orientation="orientation"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-clickable="clickable && !disabled ? 'true' : 'false'"
    :data-disabled="disabled || undefined"
    @update:model-value="onUpdate"
  >
    <StepperItem
      v-for="(item, index) in items"
      :key="item.key ?? `${item.title}-${index}`"
      :step="index + 1"
      :disabled="disabled || !clickable || item.disabled"
      :completed="getStepStatus(item, index) === 'finish'"
      :class="
        regionClass(
          props,
          'item',
          'miu-steps__item',
          `miu-steps__item--${getStepStatus(item, index)}`,
        )
      "
      :style="regionStyle(props, 'item')"
      :data-status="getStepStatus(item, index)"
      :data-step-disabled="disabled || item.disabled || undefined"
    >
      <StepperTrigger
        :class="regionClass(props, 'trigger', 'miu-steps__trigger')"
        :style="regionStyle(props, 'trigger')"
      >
        <StepperIndicator
          :class="regionClass(props, 'indicator', 'miu-steps__indicator')"
          :style="regionStyle(props, 'indicator')"
        >
          <slot name="indicator" :item="item" :index="index" :status="getStepStatus(item, index)">
            <Icon v-if="item.icon" :name="item.icon" />
            <Icon v-else-if="getStepStatus(item, index) === 'finish'" name="check" />
            <Icon v-else-if="getStepStatus(item, index) === 'error'" name="close" />
            <span v-else>{{ index + 1 }}</span>
          </slot>
        </StepperIndicator>
        <div
          :class="regionClass(props, 'content', 'miu-steps__content')"
          :style="regionStyle(props, 'content')"
        >
          <StepperTitle
            as="span"
            :class="regionClass(props, 'title', 'miu-steps__title')"
            :style="regionStyle(props, 'title')"
          >
            <slot name="title" :item="item" :index="index" :status="getStepStatus(item, index)">
              {{ item.title }}
            </slot>
          </StepperTitle>
          <StepperDescription
            v-if="item.description || $slots.description"
            as="span"
            :class="regionClass(props, 'description', 'miu-steps__description')"
            :style="regionStyle(props, 'description')"
          >
            <slot
              name="description"
              :item="item"
              :index="index"
              :status="getStepStatus(item, index)"
            >
              {{ item.description }}
            </slot>
          </StepperDescription>
        </div>
      </StepperTrigger>
      <StepperSeparator
        v-if="index < items.length - 1"
        :class="regionClass(props, 'separator', 'miu-steps__separator')"
        :style="regionStyle(props, 'separator')"
      />
    </StepperItem>
  </StepperRoot>
</template>
