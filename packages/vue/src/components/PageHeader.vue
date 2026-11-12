<script setup lang="ts">
import { computed } from "vue"
import { regionClass, regionStyle } from "@miuui/core"
import type { PageHeaderProps } from "../types"
import { useMiuI18n } from "../composables/useMiu"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<PageHeaderProps>(), {
  back: false,
  iconSize: "md",
})

const emit = defineEmits<{ back: [] }>()
const { t } = useMiuI18n()
const backLabel = computed(() => props.backLabel ?? t("common.back"))
</script>

<template>
  <header
    :class="regionClass(props, 'root', 'miu-page-header')"
    :style="regionStyle(props, 'root')"
    :data-density="density"
    :data-miu-icon-size="iconSize"
  >
    <div class="miu-page-header__lead">
      <button
        v-if="back"
        type="button"
        class="miu-page-header__back"
        :class="regionClass(props, 'back')"
        :style="regionStyle(props, 'back')"
        :aria-label="backLabel"
        @click="emit('back')"
      >
        <Icon name="chevron" :rotate="90" />
      </button>
      <div>
        <h1
          :class="regionClass(props, 'title', 'miu-page-header__title')"
          :style="regionStyle(props, 'title')"
        >
          <slot name="title">{{ title }}</slot>
        </h1>
        <p
          v-if="description || $slots.description"
          :class="regionClass(props, 'description', 'miu-page-header__description')"
          :style="regionStyle(props, 'description')"
        >
          <slot name="description">{{ description }}</slot>
        </p>
      </div>
    </div>
    <div
      v-if="$slots.actions"
      :class="regionClass(props, 'actions', 'miu-page-header__actions')"
      :style="regionStyle(props, 'actions')"
    >
      <slot name="actions" />
    </div>
  </header>
</template>
