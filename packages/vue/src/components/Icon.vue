<script setup lang="ts">
import { computed } from "vue"
import {
  BellIcon,
  CheckIcon,
  ChevronIcon,
  CloseIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  UserIcon,
  type IconDefinition,
  type IconName,
} from "@miuui/icons"
import type { IconSize } from "@miuui/core"

const props = withDefaults(
  defineProps<{
    name: IconName
    size?: IconSize
    label?: string
    rotate?: 0 | 90 | 180 | 270
  }>(),
  { rotate: 0 },
)

const iconMap: Record<IconName, IconDefinition> = {
  search: SearchIcon,
  plus: PlusIcon,
  check: CheckIcon,
  close: CloseIcon,
  chevron: ChevronIcon,
  settings: SettingsIcon,
  user: UserIcon,
  bell: BellIcon,
}

const definition = computed(() => iconMap[props.name])
const rotation = computed(() => ({ "--miu-icon-rotation": `${props.rotate}deg` }))
</script>

<template>
  <svg
    v-if="definition"
    class="miu-icon"
    :class="{ 'miu-icon--rotated': rotate !== 0 }"
    :viewBox="definition.viewBox"
    :data-miu-icon-size="size"
    :style="rotation"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    fill="none"
    stroke="currentColor"
    stroke-width="2.4"
    stroke-linecap="round"
    stroke-linejoin="round"
    focusable="false"
    v-html="definition.content"
  />
</template>
