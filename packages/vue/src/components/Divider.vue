<script setup lang="ts">
import { computed, useSlots } from "vue"
import { Separator } from "reka-ui"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { DividerProps } from "../types"

const props = withDefaults(defineProps<DividerProps>(), {
  orientation: "horizontal",
  labelAlign: "center",
  dashed: false,
  decorative: false,
  spacing: "md",
})

const slots = useSlots()
const hasLabel = computed(() => Boolean(props.label) || Boolean(slots.default))
</script>

<template>
  <Separator
    :orientation="orientation"
    :decorative="decorative"
    :class="
      regionClass(
        props,
        'root',
        'miu-divider',
        `miu-divider--${orientation}`,
        `miu-divider--spacing-${spacing}`,
        {
          'miu-divider--dashed': dashed,
          'miu-divider--with-label': hasLabel,
          [`miu-divider--align-${labelAlign}`]: hasLabel,
        },
      )
    "
    :style="regionStyle(props, 'root')"
    :data-orientation="orientation"
    :data-dashed="dashed || undefined"
    :data-spacing="spacing"
    :data-label-align="hasLabel ? labelAlign : undefined"
  >
    <template v-if="hasLabel">
      <span
        aria-hidden="true"
        :class="regionClass(props, 'line', 'miu-divider__line', 'miu-divider__line--start')"
        :style="regionStyle(props, 'line')"
      />
      <span
        :class="regionClass(props, 'label', 'miu-divider__label')"
        :style="regionStyle(props, 'label')"
      >
        <slot>{{ label }}</slot>
      </span>
      <span
        aria-hidden="true"
        :class="regionClass(props, 'line', 'miu-divider__line', 'miu-divider__line--end')"
        :style="regionStyle(props, 'line')"
      />
    </template>
    <span
      v-else
      aria-hidden="true"
      :class="regionClass(props, 'line', 'miu-divider__line')"
      :style="regionStyle(props, 'line')"
    />
  </Separator>
</template>
