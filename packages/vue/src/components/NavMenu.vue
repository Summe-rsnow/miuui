<script setup lang="ts">
import { computed } from "vue"
import { regionClass, regionStyle, safeHref } from "@xcmm1543/miuui-core"
import type { NavMenuItem, NavMenuProps } from "../types"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<NavMenuProps>(), {
  orientation: "vertical",
  radius: "sm",
})

const emit = defineEmits<{ select: [item: NavMenuItem, event: MouseEvent] }>()

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "NavMenu")
const visibleGroups = computed(() => props.groups.filter((group) => group.items.length > 0))

function onClick(item: NavMenuItem, event: MouseEvent): void {
  if (item.disabled) {
    event.preventDefault()
    return
  }
  emit("select", item, event)
}
</script>

<template>
  <nav
    v-if="visibleGroups.length > 0"
    :class="regionClass(props, 'root', 'miu-nav-menu', `miu-nav-menu--${orientation}`)"
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :aria-label="ariaLabel"
    :data-miu-radius="radius"
    :data-density="density"
    :data-material="materialName"
  >
    <div
      v-for="(group, groupIndex) in visibleGroups"
      :key="group.text ?? groupIndex"
      :class="regionClass(props, 'group', 'miu-nav-menu__group')"
      :style="regionStyle(props, 'group')"
    >
      <p
        v-if="group.text"
        :class="regionClass(props, 'groupTitle', 'miu-nav-menu__group-title')"
        :style="regionStyle(props, 'groupTitle')"
      >
        {{ group.text }}
      </p>
      <ul class="miu-nav-menu__list">
        <li
          v-for="(item, itemIndex) in group.items"
          :key="`${item.link ?? item.text}-${itemIndex}`"
          :class="regionClass(props, 'item', 'miu-nav-menu__item')"
          :style="regionStyle(props, 'item')"
        >
          <a
            v-if="safeHref(item.link)"
            :href="safeHref(item.link)"
            :class="
              regionClass(props, 'link', 'miu-nav-menu__link', {
                'miu-nav-menu__link--active': item.active,
                'miu-nav-menu__link--disabled': item.disabled,
              })
            "
            :style="regionStyle(props, 'link')"
            :aria-current="item.active ? 'page' : undefined"
            :aria-disabled="item.disabled ? 'true' : undefined"
            :tabindex="item.disabled ? -1 : undefined"
            :data-active="item.active || undefined"
            :data-disabled="item.disabled || undefined"
            @click="onClick(item, $event)"
          >
            <span>{{ item.text }}</span>
            <span
              v-if="item.badge"
              :class="regionClass(props, 'badge', 'miu-nav-menu__badge')"
              :style="regionStyle(props, 'badge')"
            >
              {{ item.badge }}
            </span>
          </a>
          <span
            v-else
            :class="
              regionClass(props, 'link', 'miu-nav-menu__link', {
                'miu-nav-menu__link--active': item.active,
                'miu-nav-menu__link--disabled': item.disabled,
              })
            "
            :style="regionStyle(props, 'link')"
            :aria-disabled="item.disabled ? 'true' : undefined"
            :data-active="item.active || undefined"
            :data-disabled="item.disabled || undefined"
          >
            <span>{{ item.text }}</span>
            <span
              v-if="item.badge"
              :class="regionClass(props, 'badge', 'miu-nav-menu__badge')"
              :style="regionStyle(props, 'badge')"
            >
              {{ item.badge }}
            </span>
          </span>
          <ul v-if="item.items?.length" class="miu-nav-menu__list">
            <li
              v-for="(child, childIndex) in item.items"
              :key="`${child.link ?? child.text}-${childIndex}`"
              :class="regionClass(props, 'item', 'miu-nav-menu__item')"
              :style="regionStyle(props, 'item')"
            >
              <a
                v-if="safeHref(child.link)"
                :href="safeHref(child.link)"
                :class="
                  regionClass(props, 'link', 'miu-nav-menu__link', 'miu-nav-menu__link--child', {
                    'miu-nav-menu__link--active': child.active,
                    'miu-nav-menu__link--disabled': child.disabled,
                  })
                "
                :style="regionStyle(props, 'link')"
                :aria-current="child.active ? 'page' : undefined"
                :aria-disabled="child.disabled ? 'true' : undefined"
                :tabindex="child.disabled ? -1 : undefined"
                :data-active="child.active || undefined"
                :data-disabled="child.disabled || undefined"
                @click="onClick(child, $event)"
              >
                <span>{{ child.text }}</span>
                <span
                  v-if="child.badge"
                  :class="regionClass(props, 'badge', 'miu-nav-menu__badge')"
                  :style="regionStyle(props, 'badge')"
                >
                  {{ child.badge }}
                </span>
              </a>
              <span
                v-else
                :class="
                  regionClass(props, 'link', 'miu-nav-menu__link', 'miu-nav-menu__link--child', {
                    'miu-nav-menu__link--active': child.active,
                    'miu-nav-menu__link--disabled': child.disabled,
                  })
                "
                :style="regionStyle(props, 'link')"
                :aria-disabled="child.disabled ? 'true' : undefined"
                :data-active="child.active || undefined"
                :data-disabled="child.disabled || undefined"
              >
                <span>{{ child.text }}</span>
                <span
                  v-if="child.badge"
                  :class="regionClass(props, 'badge', 'miu-nav-menu__badge')"
                  :style="regionStyle(props, 'badge')"
                >
                  {{ child.badge }}
                </span>
              </span>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </nav>
</template>
