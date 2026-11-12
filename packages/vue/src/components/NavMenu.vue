<script setup lang="ts">
import { regionClass, regionStyle, safeHref } from "@miuui/core"
import type { NavMenuGroup, NavMenuItem, NavMenuProps } from "../types"

const props = withDefaults(defineProps<NavMenuProps>(), {
  orientation: "vertical",
  radius: "sm",
})

const emit = defineEmits<{ select: [item: NavMenuItem, event: MouseEvent] }>()

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
    :class="regionClass(props, 'root', 'miu-nav-menu', `miu-nav-menu--${orientation}`)"
    :style="regionStyle(props, 'root')"
    :aria-label="ariaLabel"
    :data-miu-radius="radius"
    :data-density="density"
  >
    <div
      v-for="(group, groupIndex) in groups"
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
          v-for="item in group.items"
          :key="item.link ?? item.text"
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
            :class="regionClass(props, 'link', 'miu-nav-menu__link')"
            :style="regionStyle(props, 'link')"
          >
            {{ item.text }}
          </span>
          <ul v-if="item.items?.length" class="miu-nav-menu__list">
            <li
              v-for="child in item.items"
              :key="child.link ?? child.text"
              class="miu-nav-menu__item"
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
                :aria-current="child.active ? 'page' : undefined"
                @click="onClick(child, $event)"
              >
                {{ child.text }}
              </a>
              <span v-else class="miu-nav-menu__link">{{ child.text }}</span>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </nav>
</template>
