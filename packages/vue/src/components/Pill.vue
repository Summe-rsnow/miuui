<script setup lang="ts">
import { computed } from "vue"
import { regionClass, regionStyle, resolveControlSize } from "@xcmm1543/miuui-core"
import type { PillProps } from "../types"
import { useMiuI18n } from "../composables/useMiu"
import Icon from "./Icon.vue"
import { useMiuSizeHint } from "../composables/useSizeHint"

const props = withDefaults(defineProps<PillProps>(), {
  active: false,
  radius: "full",
  variant: "filter",
  removable: false,
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
  remove: []
}>()

const { t } = useMiuI18n()
const sizeHint = useMiuSizeHint()
const size = computed(() => props.size ?? sizeHint.value ?? "md")
const resolvedSize = computed(() => resolveControlSize(size.value, ["sm", "md", "lg"], "md"))
const resolvedIconSize = computed(
  () => props.iconSize ?? (resolvedSize.value.size === "lg" ? "md" : "sm"),
)

if (import.meta.env.DEV && resolvedSize.value.fallback) {
  console.warn(
    `[μui] Pill: unsupported size "${size.value}", fell back to "${resolvedSize.value.size}".`,
  )
}
</script>

<template>
  <span
    :class="
      regionClass(
        props,
        'root',
        'miu-pill',
        `miu-pill--${resolvedSize.size}`,
        `miu-pill--${variant}`,
        {
          'miu-pill--active': active,
          'miu-pill--disabled': disabled,
        },
      )
    "
    :style="regionStyle(props, 'root')"
    :data-miu-size="resolvedSize.size"
    :data-miu-icon-size="resolvedIconSize"
    :data-miu-radius="radius"
    :data-material="material"
    :data-active="active || undefined"
    :data-disabled="disabled || undefined"
  >
    <button
      type="button"
      class="miu-pill__main"
      :class="regionClass(props, 'main')"
      :style="regionStyle(props, 'main')"
      :disabled="disabled"
      :aria-pressed="active"
      @click="emit('click', $event)"
    >
      <Icon
        v-if="icon"
        :name="icon"
        :class="regionClass(props, 'icon', 'miu-pill__icon')"
        :style="regionStyle(props, 'icon')"
      />
      <span
        v-if="label || $slots.default"
        :class="regionClass(props, 'label', 'miu-pill__label')"
        :style="regionStyle(props, 'label')"
      >
        <slot>{{ label }}</slot>
      </span>
      <span
        v-if="count !== undefined"
        :class="regionClass(props, 'count', 'miu-pill__count')"
        :style="regionStyle(props, 'count')"
      >
        {{ count }}
      </span>
    </button>
    <button
      v-if="removable"
      type="button"
      class="miu-pill__remove"
      :class="regionClass(props, 'remove')"
      :style="regionStyle(props, 'remove')"
      :aria-label="t('common.close')"
      :disabled="disabled"
      @click="emit('remove')"
    >
      <Icon name="close" size="xs" />
    </button>
  </span>
</template>
