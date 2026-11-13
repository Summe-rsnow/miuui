<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  watch,
  type ComponentPublicInstance,
} from "vue"
import { RadioGroupIndicator, RadioGroupItem, RadioGroupRoot } from "reka-ui"
import { regionClass, regionStyle, resolveControlSize } from "@miuui/core"
import type { RadioGroupOption, RadioGroupProps } from "../types"
import { useMiuFormField } from "../composables/useFormField"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import { useMiuSizeHint } from "../composables/useSizeHint"

const props = withDefaults(defineProps<RadioGroupProps>(), {
  options: () => [],
  orientation: "vertical",
  variant: "radio",
  radius: "default",
  disabled: false,
  invalid: false,
})

const emit = defineEmits<{ "update:modelValue": [value: string | number] }>()

const autoId = useId()
const formField = useMiuFormField()
const sizeHint = useMiuSizeHint()
const size = computed(() => props.size ?? sizeHint.value ?? "md")
const resolvedSize = computed(() => resolveControlSize(size.value, ["sm", "md", "lg"], "md"))

if (import.meta.env.DEV && resolvedSize.value.fallback) {
  console.warn(
    `[μui] RadioGroup: unsupported size "${size.value}", fell back to "${resolvedSize.value.size}".`,
  )
}

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "RadioGroup")
const disabled = computed(() => props.disabled || formField?.disabled.value || false)
const invalid = computed(() => props.invalid || formField?.invalid.value || false)
const required = computed(() => formField?.required.value || false)
const describedBy = computed(() => formField?.describedBy.value)

const normalizedOptions = computed<RadioGroupOption[]>(() =>
  props.options.map((entry) =>
    typeof entry === "string" ? { value: entry, label: entry } : entry,
  ),
)

const rootRef = ref<ComponentPublicInstance | HTMLElement | null>(null)
const itemElements = new Map<string, HTMLElement>()
const indicatorMetrics = ref<{ x: number; y: number; width: number; height: number } | null>(null)
const indicatorAnimated = ref(false)
let resizeObserver: ResizeObserver | null = null

function unwrapElement(node: unknown): HTMLElement | null {
  if (!node) return null
  if (node instanceof HTMLElement) return node
  const maybeComp = node as { $el?: unknown }
  return maybeComp.$el instanceof HTMLElement ? maybeComp.$el : null
}

function setItemRef(value: string | number, node: unknown): void {
  const key = String(value)
  const el = unwrapElement(node)
  if (el) itemElements.set(key, el)
  else itemElements.delete(key)
}

function measureIndicator(): void {
  if (props.variant !== "button") {
    indicatorMetrics.value = null
    return
  }
  const rootEl = unwrapElement(rootRef.value)
  const activeEl =
    (props.modelValue !== undefined ? itemElements.get(String(props.modelValue)) : null) ??
    rootEl?.querySelector<HTMLElement>('.miu-radio-group__item[data-state="checked"]') ??
    null
  if (!activeEl || activeEl.offsetWidth <= 0 || activeEl.offsetHeight <= 0) {
    indicatorMetrics.value = null
    return
  }
  indicatorMetrics.value = {
    x: activeEl.offsetLeft,
    y: activeEl.offsetTop,
    width: activeEl.offsetWidth,
    height: activeEl.offsetHeight,
  }
  if (!indicatorAnimated.value && typeof requestAnimationFrame === "function") {
    requestAnimationFrame(() => {
      indicatorAnimated.value = true
    })
  }
}

const slidingIndicatorStyle = computed(() => {
  const m = indicatorMetrics.value
  if (!m) return undefined
  return {
    width: `${m.width}px`,
    height: `${m.height}px`,
    transform: `translate3d(${m.x}px, ${m.y}px, 0)`,
  }
})

onMounted(async () => {
  await nextTick()
  measureIndicator()
  const rootEl = unwrapElement(rootRef.value)
  if (rootEl && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => measureIndicator())
    resizeObserver.observe(rootEl)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

watch(
  () => [props.modelValue, props.options, props.variant, props.size, props.orientation] as const,
  async () => {
    await nextTick()
    measureIndicator()
  },
  { flush: "post", deep: true },
)

function onUpdate(value: unknown): void {
  if (typeof value === "string" || typeof value === "number") {
    emit("update:modelValue", value)
    void nextTick().then(() => measureIndicator())
  }
}
</script>

<template>
  <RadioGroupRoot
    ref="rootRef"
    :model-value="modelValue"
    :orientation="orientation"
    :disabled="disabled"
    :required="required"
    :name="name"
    :aria-label="ariaLabel"
    :aria-describedby="describedBy"
    :aria-invalid="invalid || undefined"
    :class="
      regionClass(
        props,
        'root',
        'miu-radio-group',
        `miu-radio-group--${orientation}`,
        `miu-radio-group--${variant}`,
        `miu-radio-group--${resolvedSize.size}`,
        {
          'miu-radio-group--disabled': disabled,
          'miu-radio-group--invalid': invalid,
          'miu-radio-group--has-indicator': variant === 'button' && Boolean(indicatorMetrics),
        },
      )
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-material="materialName"
    :data-variant="variant"
    :data-orientation="orientation"
    :data-invalid="invalid || undefined"
    :data-disabled="disabled || undefined"
    @update:model-value="onUpdate"
  >
    <span
      v-if="variant === 'button' && indicatorMetrics"
      aria-hidden="true"
      :class="[
        'miu-radio-group__sliding-indicator',
        { 'miu-radio-group__sliding-indicator--animated': indicatorAnimated },
      ]"
      :style="slidingIndicatorStyle"
    />
    <div
      v-for="(option, index) in normalizedOptions"
      :key="option.value"
      class="miu-radio-group__entry"
      :data-disabled="option.disabled || disabled || undefined"
    >
      <RadioGroupItem
        :id="`${autoId}-item-${index}`"
        :ref="(el) => setItemRef(option.value, el)"
        :value="option.value"
        :disabled="option.disabled || disabled"
        :class="regionClass(props, 'item', 'miu-radio-group__item')"
        :style="regionStyle(props, 'item')"
      >
        <template v-if="variant === 'button'">
          <span>{{ option.label }}</span>
        </template>
        <template v-else>
          <span class="miu-radio-group__control">
            <RadioGroupIndicator
              :class="regionClass(props, 'indicator', 'miu-radio-group__indicator')"
              :style="regionStyle(props, 'indicator')"
            />
          </span>
        </template>
      </RadioGroupItem>
      <label
        v-if="variant === 'radio'"
        :for="`${autoId}-item-${index}`"
        :class="regionClass(props, 'label', 'miu-radio-group__label')"
        :style="regionStyle(props, 'label')"
      >
        <span>{{ option.label }}</span>
        <span
          v-if="option.description"
          :class="regionClass(props, 'description', 'miu-radio-group__description')"
          :style="regionStyle(props, 'description')"
        >
          {{ option.description }}
        </span>
      </label>
    </div>
  </RadioGroupRoot>
</template>
