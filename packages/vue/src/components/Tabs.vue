<script setup lang="ts">
import { computed, nextTick, ref, watch, type ComponentPublicInstance } from "vue"
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "reka-ui"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { TabsItem, TabsProps } from "../types"
import Icon from "./Icon.vue"
import Skeleton from "./Skeleton.vue"
import { useControlSize } from "../composables/useControlSize"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import { useSlidingIndicator } from "../composables/useSlidingIndicator"

const props = withDefaults(defineProps<TabsProps>(), {
  variant: "underline",
  radius: "default",
  align: "start",
  loading: false,
  disabled: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
  change: [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const { resolvedSize, resolvedIconSize } = useControlSize({
  size: () => props.size,
  iconSize: () => props.iconSize,
  componentName: "Tabs",
})
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Tabs")
const useSurfaceMaterial = computed(
  () => props.variant === "segmented" || props.material !== undefined,
)

const listRef = ref<ComponentPublicInstance | HTMLElement | null>(null)
const lastValue = ref<string | undefined>(props.modelValue)

watch(
  () => props.modelValue,
  (next) => {
    lastValue.value = next
  },
)

const {
  setItemRef,
  setIndicatorRef,
  indicatorMetrics,
  indicatorAnimated,
  indicatorStyle,
  measure,
} = useSlidingIndicator({
    containerRef: listRef,
    activeKey: () => props.modelValue,
    enabled: () => !props.loading,
    axis: () =>
      props.variant === "pills" || props.variant === "segmented" ? "both" : "horizontal",
    fallbackSelector: '.miu-tabs__trigger[data-state="active"]',
    watchSources: () => [
      props.modelValue,
      props.items,
      props.variant,
      props.size,
      props.align,
      props.loading,
    ],
    baseStyle: () => regionStyle(props, "indicator"),
  })

function unwrapElement(node: unknown): HTMLElement | null {
  if (!node) return null
  if (node instanceof HTMLElement) return node
  const maybeComp = node as { $el?: unknown }
  return maybeComp.$el instanceof HTMLElement ? maybeComp.$el : null
}

function onUpdate(value: string): void {
  if (props.disabled || props.loading) return
  if (lastValue.value === value) return
  lastValue.value = value
  emit("update:modelValue", value)
  emit("change", value)
  void nextTick().then(() => measure())
}

function onTriggerClick(item: TabsItem): void {
  if (props.disabled || props.loading || item.disabled) return
  onUpdate(item.value)
}

function onFocus(event: FocusEvent): void {
  const listEl = unwrapElement(listRef.value)
  const from = event.relatedTarget as Node | null
  if (from && listEl?.contains(from)) return
  emit("focus", event)
}

function onBlur(event: FocusEvent): void {
  const listEl = unwrapElement(listRef.value)
  const to = event.relatedTarget as Node | null
  if (to && listEl?.contains(to)) return
  emit("blur", event)
}

function focus(): void {
  const listEl = unwrapElement(listRef.value)
  if (!listEl) return
  const target =
    listEl.querySelector<HTMLElement>('.miu-tabs__trigger[data-state="active"]:not(:disabled)') ??
    listEl.querySelector<HTMLElement>(".miu-tabs__trigger:not(:disabled)")
  target?.focus()
}

function blur(): void {
  const listEl = unwrapElement(listRef.value)
  if (!listEl) return
  const active = typeof document !== "undefined" ? document.activeElement : null
  if (active instanceof HTMLElement && listEl.contains(active)) {
    active.blur()
  }
}

defineExpose({ focus, blur, listRef })
</script>

<template>
  <div
    v-if="loading"
    :class="
      regionClass(props, 'root', 'miu-tabs', `miu-tabs--${resolvedSize.size}`, 'miu-tabs__skeleton')
    "
    :style="mergeStyle(regionStyle(props, 'root'), useSurfaceMaterial ? materialTokens : undefined)"
    :data-variant="variant"
    :data-align="align"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-material="useSurfaceMaterial ? materialName : undefined"
    :data-disabled="disabled || undefined"
    aria-busy="true"
  >
    <div :class="regionClass(props, 'list', 'miu-tabs__list')" :style="regionStyle(props, 'list')">
      <Skeleton
        v-for="(item, index) in items.length > 0
          ? items
          : [{ value: '1' }, { value: '2' }, { value: '3' }]"
        :key="item.value ?? index"
        variant="rect"
        :class="regionClass(props, 'trigger', 'miu-tabs__skeleton-item')"
        :style="regionStyle(props, 'trigger')"
      />
    </div>
  </div>
  <TabsRoot
    v-else
    :model-value="modelValue"
    :class="
      regionClass(props, 'root', 'miu-tabs', `miu-tabs--${resolvedSize.size}`, {
        'miu-tabs--has-indicator': Boolean(indicatorMetrics),
        'miu-tabs--disabled': disabled,
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), useSurfaceMaterial ? materialTokens : undefined)"
    :data-variant="variant"
    :data-align="align"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-material="useSurfaceMaterial ? materialName : undefined"
    :data-disabled="disabled || undefined"
    @update:model-value="onUpdate"
  >
    <TabsList
      ref="listRef"
      :class="regionClass(props, 'list', 'miu-tabs__list')"
      :style="regionStyle(props, 'list')"
      :aria-label="ariaLabel"
    >
      <span
        v-if="indicatorMetrics"
        :ref="setIndicatorRef"
        aria-hidden="true"
        :class="
          regionClass(props, 'indicator', 'miu-tabs__indicator', {
            'miu-tabs__indicator--animated': indicatorAnimated,
          })
        "
        :style="indicatorStyle"
      />
      <TabsTrigger
        v-for="item in items"
        :key="item.value"
        :ref="(el) => setItemRef(item.value, el)"
        :value="item.value"
        :disabled="disabled || item.disabled"
        :class="regionClass(props, 'trigger', 'miu-tabs__trigger')"
        :style="regionStyle(props, 'trigger')"
        @click="onTriggerClick(item)"
        @focus="onFocus"
        @blur="onBlur"
      >
        <slot name="trigger" :item="item" :active="item.value === modelValue">
          <Icon v-if="item.icon" :name="item.icon" />
          <span>{{ item.label }}</span>
        </slot>
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
