<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type {
  CategoryFilterProps,
  CategoryGroupItem,
  CategorySubtag,
  PillGroupOption,
  TabsItem,
} from "../types"
import { useControlSize } from "../composables/useControlSize"
import { useMiuI18n } from "../composables/useMiu"
import Collapse from "./Collapse.vue"
import PillGroup from "./PillGroup.vue"
import Tabs from "./Tabs.vue"

const props = withDefaults(defineProps<CategoryFilterProps>(), {
  defaultKey: "default",
  showDefault: true,
  tabVariant: "segmented",
  clearable: true,
  disabled: false,
  readonly: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
  change: [value: string, meta?: { group?: CategoryGroupItem; subtag?: CategorySubtag }]
  clear: []
}>()

const { t } = useMiuI18n()
const { resolvedSize, resolvedIconSize } = useControlSize({
  size: () => props.size,
  iconSize: () => props.iconSize,
  componentName: "CategoryFilter",
})
const defaultLabelText = computed(() => props.defaultLabel ?? t("categoryFilter.defaultLabel"))
const activeMainKey = ref<string>(
  props.showDefault ? props.defaultKey : (props.groups[0]?.key ?? ""),
)
const lastGroupKey = ref<string>(props.groups[0]?.key ?? props.defaultKey)

watch(
  () => [props.modelValue, props.groups, props.showDefault] as const,
  ([val, groups, showDefault]) => {
    if (!val || (showDefault && val === props.defaultKey)) {
      if (showDefault) {
        activeMainKey.value = props.defaultKey
      } else if (!groups.some((g) => g.key === activeMainKey.value)) {
        activeMainKey.value = groups[0]?.key ?? ""
      }
      return
    }
    const directGroup = groups.find((g) => g.key === val)
    if (directGroup) {
      activeMainKey.value = directGroup.key
      lastGroupKey.value = directGroup.key
      return
    }
    const parentGroup = groups.find((g) => g.subtags.some((s) => s.key === val))
    if (parentGroup) {
      activeMainKey.value = parentGroup.key
      lastGroupKey.value = parentGroup.key
    }
  },
  { immediate: true, deep: true },
)

const mainTabs = computed<TabsItem[]>(() => {
  const tabs: TabsItem[] = []
  if (props.showDefault) {
    tabs.push({ value: props.defaultKey, label: defaultLabelText.value })
  }
  for (const group of props.groups) {
    tabs.push({ value: group.key, label: group.label })
  }
  return tabs
})

const activeGroup = computed(() => props.groups.find((g) => g.key === activeMainKey.value))

const hasAnySubtags = computed(() => props.groups.some((g) => g.subtags.length > 0))

const isExpanded = computed(() => {
  if (props.showDefault && activeMainKey.value === props.defaultKey) return false
  return Boolean(activeGroup.value && activeGroup.value.subtags.length > 0)
})

const subtagOptions = computed<PillGroupOption[]>(() => {
  const targetKey =
    !props.showDefault || activeMainKey.value !== props.defaultKey
      ? activeMainKey.value
      : lastGroupKey.value
  const group = props.groups.find((g) => g.key === targetKey)
  if (!group) return []
  return group.subtags.map((sub) => ({
    value: sub.key,
    label: sub.label,
    count: sub.count,
  }))
})

function onMainTabChange(newKey: string): void {
  if (props.disabled || props.readonly) return
  const targetGroup = props.groups.find((g) => g.key === newKey)
  if (!newKey || (props.showDefault && newKey === props.defaultKey)) {
    activeMainKey.value = props.defaultKey
    if (props.modelValue !== props.defaultKey) {
      emit("update:modelValue", props.defaultKey)
      emit("change", props.defaultKey)
    }
    return
  }

  if (!targetGroup || targetGroup.subtags.length === 0) {
    activeMainKey.value = newKey
    if (props.modelValue !== newKey) {
      emit("update:modelValue", newKey)
      emit("change", newKey, { group: targetGroup })
    }
    return
  }

  activeMainKey.value = newKey
  lastGroupKey.value = newKey
}

function onSubtagChange(value: string | number | Array<string | number> | undefined): void {
  if (props.disabled || props.readonly) return
  const selectedKey = Array.isArray(value)
    ? String(value[0] ?? "")
    : value === undefined
      ? ""
      : String(value)
  const group = activeGroup.value
  const subtag = group?.subtags.find((s) => s.key === selectedKey)

  if (props.clearable && (!selectedKey || selectedKey === props.modelValue)) {
    if (props.showDefault) {
      activeMainKey.value = props.defaultKey
      emit("update:modelValue", props.defaultKey)
      emit("change", props.defaultKey)
    } else {
      emit("update:modelValue", "")
      emit("change", "")
    }
    emit("clear")
    return
  }

  if (selectedKey === props.modelValue) return
  emit("update:modelValue", selectedKey)
  emit("change", selectedKey, { group, subtag })
}

const READONLY_BLOCKED_KEYS = new Set([
  " ",
  "Enter",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
])

function onReadonlyClick(event: MouseEvent): void {
  if (props.readonly) {
    event.preventDefault()
    event.stopPropagation()
  }
}

function onReadonlyKeydown(event: KeyboardEvent): void {
  if (props.readonly && READONLY_BLOCKED_KEYS.has(event.key)) {
    event.preventDefault()
    event.stopPropagation()
  }
}
</script>

<template>
  <div
    :class="
      regionClass(props, 'root', 'miu-category-filter', {
        'miu-category-filter--disabled': disabled,
        'miu-category-filter--readonly': readonly,
      })
    "
    :style="regionStyle(props, 'root')"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-disabled="disabled || undefined"
    :data-readonly="readonly || undefined"
    :aria-readonly="readonly || undefined"
  >
    <div class="miu-category-filter__bar">
      <Tabs
        :model-value="activeMainKey"
        :items="mainTabs"
        :variant="tabVariant"
        :size="resolvedSize.size"
        :radius="radius"
        :icon-size="iconSize"
        :material="material"
        :disabled="disabled"
        :readonly="readonly || undefined"
        :aria-readonly="readonly || undefined"
        :aria-label="ariaLabel"
        :class-names="{ root: regionClass(props, 'tabs', 'miu-category-filter__tabs') }"
        :styles="{ root: regionStyle(props, 'tabs') }"
        @click.capture="onReadonlyClick"
        @keydown.capture="onReadonlyKeydown"
        @change="onMainTabChange"
      />
      <div
        v-if="$slots.actions"
        :class="regionClass(props, 'actions', 'miu-category-filter__actions')"
        :style="regionStyle(props, 'actions')"
      >
        <slot name="actions" />
      </div>
    </div>
    <Collapse v-if="hasAnySubtags" :open="isExpanded">
      <div
        :class="regionClass(props, 'subtags', 'miu-category-filter__subtags')"
        :style="regionStyle(props, 'subtags')"
      >
        <PillGroup
          :model-value="modelValue"
          :options="subtagOptions"
          :radius="radius"
          :icon-size="iconSize"
          :material="material"
          :disabled="disabled"
          :readonly="readonly"
          size="sm"
          @change="onSubtagChange"
        />
      </div>
    </Collapse>
    <div
      v-if="$slots.filters"
      :class="regionClass(props, 'filters', 'miu-category-filter__filters')"
      :style="regionStyle(props, 'filters')"
    >
      <slot name="filters" />
    </div>
  </div>
</template>
