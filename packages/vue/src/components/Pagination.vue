<script setup lang="ts">
import { computed } from "vue"
import { regionClass, regionStyle, safeHref } from "@xcmm1543/miuui-core"
import type { PaginationLink, PaginationProps } from "../types"
import { useMiuI18n } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Button from "./Button.vue"
import Icon from "./Icon.vue"
import NumberInput from "./NumberInput.vue"
import Select from "./Select.vue"

const props = withDefaults(defineProps<PaginationProps>(), {
  radius: "default",
  iconSize: "md",
  page: 1,
  pageSize: 20,
  showPageSize: true,
  showQuickJumper: true,
  hasNext: true,
  loading: false,
  disabled: false,
  size: "xs",
})

const emit = defineEmits<{
  select: [link: PaginationLink, event: MouseEvent]
  "update:page": [value: number]
  "update:pageSize": [value: number]
}>()

const { t } = useMiuI18n()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Pagination")

const isLocked = computed(() => props.loading || props.disabled)

const isNumeric = computed(() => props.mode === "numeric" || props.total !== undefined)
const hasTotal = computed(() => props.total !== undefined)
const totalPages = computed(() => {
  const total = props.total ?? 0
  const ps = props.pageSize > 0 ? props.pageSize : 20
  return Math.max(1, Math.ceil(total / ps))
})
const currentPage = computed(() => {
  const raw = Math.max(1, props.page ?? 1)
  return hasTotal.value ? Math.min(raw, totalPages.value) : raw
})

const visiblePages = computed<(number | "ellipsis-left" | "ellipsis-right")[]>(() => {
  if (!hasTotal.value) return [currentPage.value]
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages: (number | "ellipsis-left" | "ellipsis-right")[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push("ellipsis-left")
  for (let p = start; p <= end; p++) pages.push(p)
  if (end < total - 1) pages.push("ellipsis-right")
  pages.push(total)
  return pages
})

function onClick(link: PaginationLink, event: MouseEvent): void {
  if (isLocked.value) {
    event.preventDefault()
    return
  }
  emit("select", link, event)
}

function goToPage(target: number): void {
  if (isLocked.value) return
  const rounded = Math.round(target)
  if (rounded < 1) return
  if (hasTotal.value) {
    const clamped = Math.max(1, Math.min(rounded, totalPages.value))
    if (clamped !== props.page) emit("update:page", clamped)
    return
  }
  if (rounded > currentPage.value && props.hasNext === false) return
  if (rounded !== props.page) emit("update:page", rounded)
}

function onPageInput(val: number | undefined): void {
  if (isLocked.value || val == null || Number.isNaN(val)) return
  goToPage(val)
}

function onPageSizeUpdate(val: string | number | undefined): void {
  if (isLocked.value || val == null) return
  const num = Number(val)
  if (!Number.isNaN(num) && num > 0) emit("update:pageSize", num)
}
</script>

<template>
  <nav
    v-if="isNumeric"
    role="navigation"
    :class="regionClass(props, 'root', 'miu-pagination', 'miu-pagination--numeric')"
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-radius="radius"
    :data-material="materialName"
    :data-miu-icon-size="iconSize"
    :data-loading="loading || undefined"
    :data-disabled="disabled || undefined"
    :aria-busy="loading || undefined"
    :aria-label="ariaLabel ?? t('pagination.label')"
  >
    <div v-if="showPageSize && pageSizeOptions?.length" class="miu-pagination__sizes">
      <slot name="prefix" />
      <Select
        :model-value="pageSize"
        :options="pageSizeOptions"
        :size="size"
        :disabled="isLocked"
        class="miu-pagination__size-select"
        @update:model-value="onPageSizeUpdate"
      />
    </div>
    <div class="miu-pagination__pages">
      <Button
        variant="ghost"
        :size="size"
        :icon-size="iconSize"
        icon-only
        radius="full"
        :title="t('pagination.previous')"
        :aria-label="t('pagination.previous')"
        :disabled="currentPage <= 1 || isLocked"
        :class-names="{ icon: regionClass(props, 'icon') }"
        :styles="{ icon: regionStyle(props, 'icon') }"
        @click="goToPage(currentPage - 1)"
      >
        <template #icon>
          <Icon name="chevron" :rotate="90" />
        </template>
      </Button>
      <template v-for="item in visiblePages" :key="String(item)">
        <span
          v-if="item === 'ellipsis-left' || item === 'ellipsis-right'"
          class="miu-pagination__ellipsis"
          aria-hidden="true"
        >
          …
        </span>
        <Button
          v-else
          :variant="item === currentPage ? 'solid' : 'ghost'"
          :size="size"
          radius="full"
          :disabled="isLocked"
          :class-names="{
            root: regionClass(props, 'link', 'miu-pagination__page-btn'),
            label: regionClass(props, 'label'),
          }"
          :styles="{
            root: regionStyle(props, 'link'),
            label: regionStyle(props, 'label'),
          }"
          :aria-current="item === currentPage ? 'page' : undefined"
          :aria-label="t('pagination.jumpTo', { page: item })"
          @click="goToPage(item)"
        >
          {{ item }}
        </Button>
      </template>
      <Button
        variant="ghost"
        :size="size"
        :icon-size="iconSize"
        icon-only
        radius="full"
        :title="t('pagination.next')"
        :aria-label="t('pagination.next')"
        :disabled="isLocked || (hasTotal ? currentPage >= totalPages : !hasNext)"
        :class-names="{ icon: regionClass(props, 'icon') }"
        :styles="{ icon: regionStyle(props, 'icon') }"
        @click="goToPage(currentPage + 1)"
      >
        <template #icon>
          <Icon name="chevron" :rotate="270" />
        </template>
      </Button>
    </div>
    <NumberInput
      v-if="showQuickJumper && hasTotal"
      :model-value="currentPage"
      :size="size"
      :min="1"
      :max="totalPages"
      :disabled="isLocked"
      hide-steppers
      class="miu-pagination__jumper"
      :aria-label="t('pagination.jumpTo', { page: currentPage })"
      @update:model-value="onPageInput"
    />
  </nav>

  <nav
    v-else
    role="navigation"
    :class="regionClass(props, 'root', 'miu-pagination')"
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-radius="radius"
    :data-material="materialName"
    :data-miu-icon-size="iconSize"
    :data-loading="loading || undefined"
    :data-disabled="disabled || undefined"
    :aria-busy="loading || undefined"
    :aria-label="ariaLabel ?? t('pagination.label')"
  >
    <a
      v-if="previous"
      :href="isLocked ? undefined : safeHref(previous.link)"
      :class="regionClass(props, 'link', 'miu-pagination__link', 'miu-pagination__link--previous')"
      :style="regionStyle(props, 'link')"
      :aria-disabled="isLocked ? 'true' : undefined"
      :tabindex="isLocked ? -1 : undefined"
      @click="onClick(previous, $event)"
    >
      <span
        :class="regionClass(props, 'icon', 'miu-pagination__icon')"
        :style="regionStyle(props, 'icon')"
      >
        <Icon name="chevron" :rotate="90" />
      </span>
      <span
        :class="regionClass(props, 'label', 'miu-pagination__label')"
        :style="regionStyle(props, 'label')"
      >
        <span class="miu-pagination__hint">{{ t("pagination.previous") }}</span>
        <span>{{ previous.text }}</span>
      </span>
    </a>
    <span v-else class="miu-pagination__spacer" />
    <a
      v-if="next"
      :href="isLocked ? undefined : safeHref(next.link)"
      :class="regionClass(props, 'link', 'miu-pagination__link', 'miu-pagination__link--next')"
      :style="regionStyle(props, 'link')"
      :aria-disabled="isLocked ? 'true' : undefined"
      :tabindex="isLocked ? -1 : undefined"
      @click="onClick(next, $event)"
    >
      <span
        :class="regionClass(props, 'label', 'miu-pagination__label')"
        :style="regionStyle(props, 'label')"
      >
        <span class="miu-pagination__hint">{{ t("pagination.next") }}</span>
        <span>{{ next.text }}</span>
      </span>
      <span
        :class="regionClass(props, 'icon', 'miu-pagination__icon')"
        :style="regionStyle(props, 'icon')"
      >
        <Icon name="chevron" :rotate="270" />
      </span>
    </a>
  </nav>
</template>
