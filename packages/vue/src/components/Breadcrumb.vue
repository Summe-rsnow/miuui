<script setup lang="ts">
import { regionClass, regionStyle, safeHref } from "@xcmm1543/miuui-core"
import type { BreadcrumbItem, BreadcrumbProps } from "../types"
import { useMiuI18n } from "../composables/useMiu"

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  items: () => [],
  size: "md",
  radius: "sm",
})

const emit = defineEmits<{ select: [item: BreadcrumbItem, event: MouseEvent] }>()

const { t } = useMiuI18n()
</script>

<template>
  <nav
    v-if="items.length > 0"
    :class="regionClass(props, 'root', 'miu-breadcrumb')"
    :style="regionStyle(props, 'root')"
    :data-miu-size="size"
    :data-miu-radius="radius"
    :aria-label="ariaLabel ?? t('breadcrumb.label')"
  >
    <ol
      :class="regionClass(props, 'list', 'miu-breadcrumb__list')"
      :style="regionStyle(props, 'list')"
    >
      <li
        v-for="(item, index) in items"
        :key="`${item.text}-${index}`"
        :class="regionClass(props, 'item', 'miu-breadcrumb__item')"
        :style="regionStyle(props, 'item')"
      >
        <a
          v-if="safeHref(item.link) && index < items.length - 1"
          :href="safeHref(item.link)"
          :class="regionClass(props, 'link', 'miu-breadcrumb__link')"
          :style="regionStyle(props, 'link')"
          @click="emit('select', item, $event)"
        >
          {{ item.text }}
        </a>
        <span
          v-else
          :class="
            regionClass(props, 'link', 'miu-breadcrumb__link', 'miu-breadcrumb__link--current')
          "
          :style="regionStyle(props, 'link')"
          :aria-current="index === items.length - 1 ? 'page' : undefined"
        >
          {{ item.text }}
        </span>
        <span
          v-if="index < items.length - 1"
          :class="regionClass(props, 'separator', 'miu-breadcrumb__separator')"
          :style="regionStyle(props, 'separator')"
          aria-hidden="true"
        >
          /
        </span>
      </li>
    </ol>
  </nav>
</template>
