<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type ComponentPublicInstance,
} from "vue"
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "reka-ui"
import {
  CONTROL_SIZES,
  regionClass,
  regionStyle,
  resolveControlSize,
  resolveIconSize,
} from "@xcmm1543/miuui-core"
import type { TabsProps } from "../types"
import Icon from "./Icon.vue"
import Skeleton from "./Skeleton.vue"
import { useMiuSizeHint } from "../composables/useSizeHint"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<TabsProps>(), {
  variant: "underline",
  radius: "default",
  align: "start",
  loading: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
  change: [value: string]
}>()

const sizeHint = useMiuSizeHint()
const size = computed(() => props.size ?? sizeHint.value ?? "md")
const resolvedSize = computed(() => resolveControlSize(size.value, CONTROL_SIZES))
const resolvedIconSize = computed(() => resolveIconSize(resolvedSize.value.size, props.iconSize))
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Tabs")
const useSurfaceMaterial = computed(
  () => props.variant === "segmented" || props.material !== undefined,
)

if (import.meta.env.DEV && resolvedSize.value.fallback) {
  console.warn(
    `[μui] Tabs: unsupported size "${size.value}", fell back to "${resolvedSize.value.size}".`,
  )
}

const listRef = ref<ComponentPublicInstance | HTMLElement | null>(null)
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

function setItemRef(value: string, node: unknown): void {
  const el = unwrapElement(node)
  if (el) itemElements.set(value, el)
  else itemElements.delete(value)
}

function measureIndicator(): void {
  const listEl = unwrapElement(listRef.value)
  const activeEl =
    (props.modelValue ? itemElements.get(props.modelValue) : null) ??
    listEl?.querySelector<HTMLElement>('.miu-tabs__trigger[data-state="active"]') ??
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

const indicatorStyle = computed(() => {
  const base = regionStyle(props, "indicator")
  const m = indicatorMetrics.value
  if (!m) return base
  const geom: Record<string, string> =
    props.variant === "pills" || props.variant === "segmented"
      ? {
          width: `${m.width}px`,
          height: `${m.height}px`,
          transform: `translate3d(${m.x}px, ${m.y}px, 0)`,
        }
      : {
          width: `${m.width}px`,
          transform: `translate3d(${m.x}px, 0, 0)`,
        }
  return mergeStyle(base, geom)
})

onMounted(async () => {
  await nextTick()
  measureIndicator()
  const listEl = unwrapElement(listRef.value)
  if (listEl && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => measureIndicator())
    resizeObserver.observe(listEl)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

watch(
  () => [props.modelValue, props.items, props.variant, props.size, props.align] as const,
  async () => {
    await nextTick()
    measureIndicator()
  },
  { flush: "post", deep: true },
)

function onUpdate(value: string): void {
  emit("update:modelValue", value)
  emit("change", value)
  void nextTick().then(() => measureIndicator())
}
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
    :data-material="useSurfaceMaterial ? materialName : undefined"
  >
    <div :class="regionClass(props, 'list', 'miu-tabs__list')" :style="regionStyle(props, 'list')">
      <Skeleton
        v-for="(item, index) in items.length > 0
          ? items
          : [{ value: '1' }, { value: '2' }, { value: '3' }]"
        :key="item.value ?? index"
        variant="rect"
        :class="regionClass(props, 'trigger', 'miu-tabs__skeleton-item')"
        :style="{
          '--miu-tabs-skeleton-chars': String(
            'label' in item && item.label
              ? item.label.length + ('icon' in item && item.icon ? 2 : 0)
              : 4,
          ),
        }"
      />
    </div>
  </div>
  <TabsRoot
    v-else
    :model-value="modelValue"
    :class="
      regionClass(props, 'root', 'miu-tabs', `miu-tabs--${resolvedSize.size}`, {
        'miu-tabs--has-indicator': Boolean(indicatorMetrics),
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), useSurfaceMaterial ? materialTokens : undefined)"
    :data-variant="variant"
    :data-align="align"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-material="useSurfaceMaterial ? materialName : undefined"
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
        :disabled="item.disabled"
        :class="regionClass(props, 'trigger', 'miu-tabs__trigger')"
        :style="regionStyle(props, 'trigger')"
        @click="!item.disabled && modelValue !== item.value && onUpdate(item.value)"
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
