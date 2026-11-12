<script setup lang="ts">
import { regionClass, regionStyle } from "@miuui/core"
import type { TocProps } from "../types"
import { useMiuI18n } from "../composables/useMiu"

const props = withDefaults(defineProps<TocProps>(), {
  items: () => [],
})

const { t } = useMiuI18n()
</script>

<template>
  <nav
    :class="regionClass(props, 'root', 'miu-toc')"
    :style="regionStyle(props, 'root')"
    :data-density="density"
    :aria-label="ariaLabel ?? t('toc.title')"
  >
    <p :class="regionClass(props, 'title', 'miu-toc__title')" :style="regionStyle(props, 'title')">
      <slot name="title">{{ title ?? t("toc.title") }}</slot>
    </p>
    <ul :class="regionClass(props, 'list', 'miu-toc__list')" :style="regionStyle(props, 'list')">
      <li
        v-for="item in items"
        :key="item.id"
        :class="regionClass(props, 'item', 'miu-toc__item')"
        :style="regionStyle(props, 'item')"
        :data-level="item.level"
      >
        <a
          :href="`#${item.id}`"
          :class="
            regionClass(props, 'link', 'miu-toc__link', {
              'miu-toc__link--active': activeId === item.id,
            })
          "
          :style="regionStyle(props, 'link')"
          :aria-current="activeId === item.id ? 'location' : undefined"
          :data-active="activeId === item.id || undefined"
        >
          {{ item.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>
