<script setup lang="ts">
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { SectionHeaderProps } from "../types"

const props = defineProps<SectionHeaderProps>()
</script>

<template>
  <div
    :class="regionClass(props, 'root', 'miu-section-header')"
    :style="regionStyle(props, 'root')"
    :data-density="density"
  >
    <div class="miu-section-header__text">
      <h2
        :class="regionClass(props, 'title', 'miu-section-header__title')"
        :style="regionStyle(props, 'title')"
      >
        {{ title }}
      </h2>
      <p
        v-if="description"
        :class="regionClass(props, 'description', 'miu-section-header__description')"
        :style="regionStyle(props, 'description')"
      >
        {{ description }}
      </p>
    </div>
    <div
      v-if="$slots.actions"
      :class="regionClass(props, 'actions', 'miu-section-header__actions')"
      :style="regionStyle(props, 'actions')"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
