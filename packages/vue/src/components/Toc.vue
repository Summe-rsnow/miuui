<script setup lang="ts">
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { TocItem, TocProps } from "../types"
import { useMiuI18n } from "../composables/useMiu"

const props = withDefaults(defineProps<TocProps>(), {
  items: () => [],
  radius: "sm",
})

const emit = defineEmits<{ select: [item: TocItem, event: MouseEvent] }>()

const { t } = useMiuI18n()
</script>

<template>
  <nav
    v-if="items.length > 0"
    :class="regionClass(props, 'root', 'miu-toc')"
    :style="regionStyle(props, 'root')"
    :data-miu-radius="radius"
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
          @click="emit('select', item, $event)"
        >
          {{ item.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>
