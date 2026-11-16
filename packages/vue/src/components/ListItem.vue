<script setup lang="ts">
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { ListItemProps } from "../types"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<ListItemProps>(), {
  active: false,
  clickable: false,
  disabled: false,
  dense: false,
  radius: "default",
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "ListItem")

function onClick(event: MouseEvent): void {
  if (props.disabled || !props.clickable) return
  emit("click", event)
}

function onKeydown(event: KeyboardEvent): void {
  if (props.disabled || !props.clickable) return
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault()
    emit("click", event as unknown as MouseEvent)
  }
}
</script>

<template>
  <div
    role="listitem"
    :tabindex="clickable && !disabled ? 0 : undefined"
    :aria-disabled="disabled || undefined"
    :aria-current="active ? 'true' : undefined"
    :class="
      regionClass(props, 'root', 'miu-list-item', {
        'miu-list-item--active': active,
        'miu-list-item--clickable': clickable && !disabled,
        'miu-list-item--disabled': disabled,
        'miu-list-item--dense': dense,
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-radius="radius"
    :data-material="materialName"
    :data-active="active || undefined"
    :data-disabled="disabled || undefined"
    @click="onClick"
    @keydown="onKeydown"
  >
    <div
      v-if="$slots.prefix"
      :class="regionClass(props, 'prefix', 'miu-list-item__prefix')"
      :style="regionStyle(props, 'prefix')"
    >
      <slot name="prefix" />
    </div>
    <div
      :class="regionClass(props, 'body', 'miu-list-item__body')"
      :style="regionStyle(props, 'body')"
    >
      <div class="miu-list-item__head">
        <div
          v-if="title || $slots.title || $slots.default"
          :class="regionClass(props, 'title', 'miu-list-item__title')"
          :style="regionStyle(props, 'title')"
        >
          <slot name="title">
            <template v-if="title">{{ title }}</template>
            <slot v-else />
          </slot>
        </div>
        <div
          v-if="$slots.badges"
          :class="regionClass(props, 'badges', 'miu-list-item__badges')"
          :style="regionStyle(props, 'badges')"
        >
          <slot name="badges" />
        </div>
      </div>
      <div
        v-if="subtitle || $slots.subtitle"
        :class="regionClass(props, 'subtitle', 'miu-list-item__subtitle')"
        :style="regionStyle(props, 'subtitle')"
      >
        <slot name="subtitle">{{ subtitle }}</slot>
      </div>
    </div>
    <div
      v-if="$slots.actions || $slots.suffix"
      :class="regionClass(props, 'actions', 'miu-list-item__actions')"
      :style="regionStyle(props, 'actions')"
    >
      <slot name="actions">
        <slot name="suffix" />
      </slot>
    </div>
  </div>
</template>
