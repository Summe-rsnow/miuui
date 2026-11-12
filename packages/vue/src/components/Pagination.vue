<script setup lang="ts">
import { regionClass, regionStyle, safeHref } from "@miuui/core"
import type { PaginationLink, PaginationProps } from "../types"
import { useMiuI18n } from "../composables/useMiu"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<PaginationProps>(), {
  radius: "default",
  iconSize: "md",
})

const emit = defineEmits<{ select: [link: PaginationLink, event: MouseEvent] }>()
const { t } = useMiuI18n()

function onClick(link: PaginationLink, event: MouseEvent): void {
  emit("select", link, event)
}
</script>

<template>
  <nav
    :class="regionClass(props, 'root', 'miu-pagination')"
    :style="regionStyle(props, 'root')"
    :data-miu-radius="radius"
    :data-material="material"
    :data-miu-icon-size="iconSize"
    :aria-label="ariaLabel ?? t('pagination.label')"
  >
    <a
      v-if="previous"
      :href="safeHref(previous.link)"
      :class="regionClass(props, 'link', 'miu-pagination__link', 'miu-pagination__link--previous')"
      :style="regionStyle(props, 'link')"
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
      :href="safeHref(next.link)"
      :class="regionClass(props, 'link', 'miu-pagination__link', 'miu-pagination__link--next')"
      :style="regionStyle(props, 'link')"
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
