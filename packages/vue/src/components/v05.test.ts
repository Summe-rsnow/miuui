import { flushPromises, mount, type VueWrapper } from "@vue/test-utils"
import axe from "axe-core"
import { afterEach, describe, expect, it, vi } from "vitest"
import Badge from "./Badge.vue"
import Button from "./Button.vue"
import Collapse from "./Collapse.vue"
import ColorPicker from "./ColorPicker.vue"
import HelpTooltip from "./HelpTooltip.vue"
import Image from "./Image.vue"
import List from "./List.vue"
import ListItem from "./ListItem.vue"
import Pagination from "./Pagination.vue"
import ThemeProvider from "./ThemeProvider.vue"

const mounted: VueWrapper[] = []
function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
  document.body.innerHTML = ""
})

describe("v0.5.0 MCLR primitives and enhancements", () => {
  it("supports Collapse open state and aria-hidden", async () => {
    const wrapper = track(
      mount(Collapse, {
        props: { open: false },
        slots: { default: "Hidden details" },
      }),
    )
    expect(wrapper.attributes("data-open")).toBe("false")
    expect(wrapper.attributes("aria-hidden")).toBe("true")

    await wrapper.setProps({ open: true })
    expect(wrapper.attributes("data-open")).toBe("true")
    expect(wrapper.attributes("aria-hidden")).toBeUndefined()
  })

  it("supports ColorPicker native swatch, hex input, and preset selection", async () => {
    const onUpdate = vi.fn()
    const wrapper = track(
      mount(ColorPicker, {
        props: {
          modelValue: "#9A49E0",
          presets: ["#9A49E0", "#3B82F6"],
          "onUpdate:modelValue": onUpdate,
        },
        attachTo: document.body,
      }),
    )
    const presetButtons = wrapper.findAll(".miu-color-picker__preset")
    expect(presetButtons).toHaveLength(2)
    expect(presetButtons[0]?.attributes("aria-pressed")).toBe("true")

    await presetButtons[1]?.trigger("click")
    expect(onUpdate).toHaveBeenCalledWith("#3B82F6")

    const hexInput = wrapper.get(".miu-color-picker__input")
    await hexInput.setValue("#10B981")
    expect(onUpdate).toHaveBeenCalledWith("#10B981")

    await hexInput.setValue("#10B")
    expect(onUpdate).toHaveBeenCalledTimes(2)

    const swatch = wrapper.get(".miu-color-picker__swatch")
    await swatch.setValue("#ef4444")
    expect(onUpdate).toHaveBeenCalledWith("#ef4444")

    await wrapper.setProps({ modelValue: "#D97706" })
    expect((hexInput.element as HTMLInputElement).value).toBe("#D97706")

    await wrapper.setProps({ disabled: true })
    await presetButtons[0]?.trigger("click")
    expect(onUpdate).toHaveBeenCalledTimes(3)

    const results = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
    })
    expect(
      results.violations.filter((v) => v.impact === "serious" || v.impact === "critical"),
    ).toEqual([])
  })

  it("supports List and ListItem clickable, keyboard, active, and disabled states", async () => {
    const onClick = vi.fn()
    const wrapper = track(
      mount(
        {
          components: { List, ListItem },
          template: `
            <List bordered dividers>
              <ListItem title="Alpha" subtitle="First item" active clickable @click="onClick">
                <template #prefix><span>P</span></template>
                <template #badges><span>B</span></template>
                <template #actions><span>A</span></template>
              </ListItem>
              <ListItem title="Beta" disabled clickable @click="onClick" />
              <ListItem title="Gamma" />
            </List>
          `,
          methods: { onClick },
        },
        { attachTo: document.body },
      ),
    )
    const items = wrapper.findAll(".miu-list-item")
    expect(items).toHaveLength(3)
    expect(items[0]?.attributes("aria-current")).toBe("true")

    await items[0]?.trigger("click")
    await items[0]?.trigger("keydown", { key: "Enter" })
    await items[0]?.trigger("keydown", { key: " " })
    await items[0]?.trigger("keydown", { key: "Escape" })
    await items[1]?.trigger("click")
    await items[1]?.trigger("keydown", { key: "Enter" })
    await items[2]?.trigger("click")
    expect(onClick).toHaveBeenCalledTimes(3)
    const results = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
    })
    expect(
      results.violations.filter((v) => v.impact === "serious" || v.impact === "critical"),
    ).toEqual([])
  })

  it("supports HelpTooltip trigger and portal tooltip content", async () => {
    track(
      mount(
        {
          components: { ThemeProvider, HelpTooltip },
          template: `
            <ThemeProvider>
              <HelpTooltip text="Explains this setting" :delay-duration="0" />
            </ThemeProvider>
          `,
        },
        { attachTo: document.body },
      ),
    )
    const trigger = document.querySelector(".miu-help-tooltip__trigger") as HTMLElement
    expect(trigger).not.toBeNull()
    expect(trigger.getAttribute("aria-label")).toBe("Explains this setting")
  })

  it("supports Button tonal & iconRight, Badge pulse, Image pixelated & fallbackSrc, and Pagination cursor mode", async () => {
    const btn = track(
      mount(Button, {
        props: { variant: "tonal", iconRight: "chevron" },
        slots: { default: "More" },
      }),
    )
    expect(btn.classes()).toContain("miu-button--tonal")
    expect(btn.find(".miu-button__icon--right").exists()).toBe(true)

    const badge = track(
      mount(Badge, {
        props: { pulse: true, variant: "success", material: "glass" },
        slots: { default: "Online" },
      }),
    )
    expect(badge.find(".miu-badge__dot--pulse").exists()).toBe(true)
    expect(badge.attributes("data-material")).toBe("glass")

    const micaBadge = track(
      mount(Badge, { props: { material: "mica" }, slots: { default: "Mica" } }),
    )
    expect(micaBadge.attributes("data-material")).toBe("mica")

    const inheritedBadge = track(
      mount({
        components: { ThemeProvider, Badge },
        template: `<ThemeProvider material="mica"><Badge variant="primary">Mica</Badge></ThemeProvider>`,
      }),
    )
    expect(inheritedBadge.find(".miu-theme-provider").attributes("data-material")).toBe("mica")

    const img = track(
      mount(Image, {
        props: {
          src: "https://example.com/broken.png",
          fallbackSrc: "https://example.com/backup.png",
          pixelated: true,
          alt: "Skin",
        },
      }),
    )
    expect(img.get("img").classes()).toContain("miu-image__img--pixelated")
    await img.get("img").trigger("error")
    await flushPromises()
    expect(img.get("img").attributes("src")).toBe("https://example.com/backup.png")

    const onPage = vi.fn()
    const pg = track(
      mount(Pagination, {
        props: {
          mode: "numeric",
          page: 2,
          hasNext: false,
          "onUpdate:page": onPage,
        },
      }),
    )
    const btns = pg.findAll("button")
    expect(btns[0]?.attributes("disabled")).toBeUndefined()
    expect(btns[btns.length - 1]?.attributes("disabled")).toBeDefined()
    await btns[0]?.trigger("click")
    expect(onPage).toHaveBeenCalledWith(1)
  })

  it("exports every registered plugin component from package entry including ConfirmDialog", async () => {
    const entry = await import("../index")
    for (const [pluginKey, comp] of Object.entries(entry.components)) {
      const exportName = pluginKey.replace(/^Miu/, "")
      expect((entry as Record<string, unknown>)[exportName]).toBe(comp)
    }
    expect(entry.ConfirmDialog).toBeDefined()
  })
})
