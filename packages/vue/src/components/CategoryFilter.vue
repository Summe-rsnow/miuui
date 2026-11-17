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
import { useMiuI18n } from "../composables/useMiu"
import Collapse from "./Collapse.vue"
import PillGroup from "./PillGroup.vue"
import Tabs from "./Tabs.vue"

const props = withDefaults(defineProps<CategoryFilterProps>(), {
  modelValue: "default",
  defaultKey: "default",
  showDefault: true,
  size: "md",
  tabVariant: "segmented",
  allowDeselect: true,
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
  change: [value: string, meta?: { group?: CategoryGroupItem; subtag?: CategorySubtag }]
}>()

const { t } = useMiuI18n()
const defaultLabelText = computed(() => props.defaultLabel ?? t("categoryFilter.defaultLabel"))
const activeMainKey = ref<string>(props.defaultKey)
const lastGroupKey = ref<string>(props.defaultKey)

watch(
  () => [props.modelValue, props.groups] as const,
  ([val, groups]) => {
    if (!val || val === props.defaultKey) {
      activeMainKey.value = props.defaultKey
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

const isExpanded = computed(() => {
  if (props.showDefault && activeMainKey.value === props.defaultKey) return false
  return Boolean(activeGroup.value && activeGroup.value.subtags.length > 0)
})

const subtagOptions = computed<PillGroupOption[]>(() => {
  const targetKey =
    activeMainKey.value !== props.defaultKey ? activeMainKey.value : lastGroupKey.value
  const group = props.groups.find((g) => g.key === targetKey)
  if (!group) return []
  return group.subtags.map((sub) => ({
    value: sub.key,
    label: sub.label,
    count: sub.count,
  }))
})

function onMainTabChange(newKey: string): void {
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

function onSubtagChange(value: string | number | Array<string | number>): void {
  const selectedKey = Array.isArray(value) ? String(value[0] ?? "") : String(value)
  const group = activeGroup.value
  const subtag = group?.subtags.find((s) => s.key === selectedKey)

  if (props.allowDeselect && (!selectedKey || selectedKey === props.modelValue)) {
    activeMainKey.value = props.defaultKey
    emit("update:modelValue", props.defaultKey)
    emit("change", props.defaultKey)
    return
  }

  if (selectedKey === props.modelValue) return
  emit("update:modelValue", selectedKey)
  emit("change", selectedKey, { group, subtag })
}
</script>

<template>
  <div
    :class="regionClass(props, 'root', 'miu-category-filter')"
    :style="regionStyle(props, 'root')"
  >
    <div class="miu-category-filter__bar">
      <Tabs
        :model-value="activeMainKey"
        :items="mainTabs"
        :variant="tabVariant"
        :size="size"
        :aria-label="ariaLabel"
        :class-names="{ root: regionClass(props, 'tabs', 'miu-category-filter__tabs') }"
        :styles="{ root: regionStyle(props, 'tabs') }"
        @change="onMainTabChange"
      />
      <div v-if="$slots.actions" class="miu-category-filter__actions">
        <slot name="actions" />
      </div>
    </div>
    <Collapse :open="isExpanded">
      <div
        :class="regionClass(props, 'subtags', 'miu-category-filter__subtags')"
        :style="regionStyle(props, 'subtags')"
      >
        <PillGroup
          :model-value="modelValue"
          :options="subtagOptions"
          size="sm"
          @change="onSubtagChange"
        />
      </div>
    </Collapse>
  </div>
</template>
