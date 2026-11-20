<script setup lang="ts">
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui"
import { computed, nextTick, ref, useId, watch } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { CommandItem, CommandPaletteProps } from "../types"
import { useMiuI18n, useMiuTheme } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"
import Input from "./Input.vue"
import Kbd from "./Kbd.vue"

const props = withDefaults(defineProps<CommandPaletteProps>(), {
  open: false,
  radius: "lg",
  items: () => [],
  closeOnOverlayClick: true,
  closeOnEsc: true,
})

const emit = defineEmits<{
  "update:open": [value: boolean]
  select: [item: CommandItem]
}>()

const theme = useMiuTheme()
const { t } = useMiuI18n()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "CommandPalette")
const listId = useId()
const query = ref("")
const activeIndex = ref(0)
const inputRef = ref<{ focus: () => void }>()

const filtered = computed(() => {
  const term = query.value.trim().toLowerCase()
  if (!term) return props.items
  return props.items.filter((item) =>
    [item.title, item.description, item.section, item.keywords]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(term)),
  )
})

const grouped = computed(() => {
  const groups = new Map<string, Array<{ item: CommandItem; index: number }>>()
  let index = 0
  for (const item of filtered.value) {
    const section = item.section ?? ""
    const entries = groups.get(section) ?? []
    entries.push({ item, index })
    groups.set(section, entries)
    index += 1
  }
  return Array.from(groups, ([title, items]) => ({ title, items }))
})

const emptyLabel = computed(() => props.emptyText ?? t("commandPalette.empty"))
const placeholder = computed(() => props.placeholder ?? t("commandPalette.placeholder"))
const activeOptionId = computed(() =>
  filtered.value.length > 0 ? optionId(activeIndex.value) : undefined,
)

watch(
  () => props.open,
  async (open) => {
    if (!open) return
    query.value = ""
    activeIndex.value = 0
    await nextTick()
    inputRef.value?.focus()
  },
)

watch(filtered, () => {
  if (activeIndex.value >= filtered.value.length) {
    activeIndex.value = Math.max(0, filtered.value.length - 1)
  }
})

function move(delta: number): void {
  if (filtered.value.length === 0) return
  activeIndex.value = (activeIndex.value + delta + filtered.value.length) % filtered.value.length
}

function optionId(index: number): string {
  return `${listId}-option-${index}`
}

function selectItem(item: CommandItem): void {
  emit("select", item)
  emit("update:open", false)
}

function selectActive(): void {
  const item = filtered.value[activeIndex.value]
  if (item) selectItem(item)
}

function onEscapeKeyDown(event: KeyboardEvent): void {
  if (!props.closeOnEsc) event.preventDefault()
}

function onOutsideDismiss(event: Event): void {
  if (!props.closeOnOverlayClick) event.preventDefault()
}

function onKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault()
      move(1)
      break
    case "ArrowUp":
      event.preventDefault()
      move(-1)
      break
    case "Home":
      event.preventDefault()
      activeIndex.value = 0
      break
    case "End":
      event.preventDefault()
      activeIndex.value = Math.max(0, filtered.value.length - 1)
      break
    case "Enter":
      event.preventDefault()
      selectActive()
      break
  }
}
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal :to="theme.portalTarget.value">
      <DialogOverlay
        :class="
          regionClass(props, 'overlay', 'miu-overlay-backdrop', 'miu-command-palette__overlay')
        "
        :style="regionStyle(props, 'overlay')"
      />
      <DialogContent
        :class="regionClass(props, 'content', 'miu-command-palette')"
        :style="mergeStyle(regionStyle(props, 'content'), materialTokens)"
        :data-miu-radius="radius"
        :data-material="materialName"
        @escape-key-down="onEscapeKeyDown"
        @pointer-down-outside="onOutsideDismiss"
        @interact-outside="onOutsideDismiss"
        @keydown="onKeydown"
      >
        <DialogTitle class="miu-sr-only">{{ t("commandPalette.title") }}</DialogTitle>
        <DialogDescription class="miu-sr-only">
          {{ t("commandPalette.navigate") }}
        </DialogDescription>
        <div
          :class="regionClass(props, 'input', 'miu-command-palette__input')"
          :style="regionStyle(props, 'input')"
        >
          <Icon name="search" size="md" />
          <Input
            ref="inputRef"
            :model-value="query"
            :placeholder="placeholder"
            :ariaLabel="t('commandPalette.title')"
            size="lg"
            @update:model-value="query = $event"
          />
        </div>

        <div
          :id="listId"
          class="miu-command-palette__results"
          role="listbox"
          :aria-label="t('commandPalette.title')"
          :aria-activedescendant="activeOptionId"
        >
          <div
            v-for="group in grouped"
            :key="group.title || 'root'"
            :class="regionClass(props, 'group', 'miu-command-palette__group')"
            :style="regionStyle(props, 'group')"
          >
            <p v-if="group.title" class="miu-command-palette__group-title">
              {{ group.title }}
            </p>
            <button
              v-for="entry in group.items"
              :id="optionId(entry.index)"
              :key="`${entry.item.link}-${entry.index}`"
              type="button"
              role="option"
              :aria-selected="entry.index === activeIndex"
              :class="
                regionClass(props, 'item', 'miu-command-palette__item', {
                  'miu-command-palette__item--active': entry.index === activeIndex,
                })
              "
              :style="regionStyle(props, 'item')"
              @mouseenter="activeIndex = entry.index"
              @click="selectItem(entry.item)"
            >
              <Icon v-if="entry.item.icon" :name="entry.item.icon" size="sm" />
              <span class="miu-command-palette__item-text">
                <span class="miu-command-palette__item-title">{{ entry.item.title }}</span>
                <span v-if="entry.item.description" class="miu-command-palette__item-description">
                  {{ entry.item.description }}
                </span>
              </span>
            </button>
          </div>
          <p
            v-if="filtered.length === 0"
            :class="regionClass(props, 'empty', 'miu-command-palette__empty')"
            :style="regionStyle(props, 'empty')"
          >
            {{ emptyLabel }}
          </p>
        </div>

        <div class="miu-command-palette__footer">
          <span><Kbd keys="↑" /> <Kbd keys="↓" /> {{ t("commandPalette.navigate") }}</span>
          <span><Kbd keys="Enter" /> {{ t("commandPalette.open") }}</span>
          <span><Kbd keys="Esc" /> {{ t("commandPalette.close") }}</span>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
