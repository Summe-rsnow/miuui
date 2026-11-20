import { flushPromises, mount, type VueWrapper } from "@vue/test-utils"
import { createApp } from "vue"
import { afterEach, describe, expect, it } from "vitest"
import Avatar from "./Avatar.vue"
import Badge from "./Badge.vue"
import Card from "./Card.vue"
import Code from "./Code.vue"
import ConfirmDialog from "./ConfirmDialog.vue"
import ContextMenu from "./ContextMenu.vue"
import DropdownMenu from "./DropdownMenu.vue"
import FormRow from "./FormRow.vue"
import IconButton from "./IconButton.vue"
import MessageComposer from "./MessageComposer.vue"
import PageHeader from "./PageHeader.vue"
import Pill from "./Pill.vue"
import Popover from "./Popover.vue"
import SectionHeader from "./SectionHeader.vue"
import Skeleton from "./Skeleton.vue"
import Spinner from "./Spinner.vue"
import Table from "./Table.vue"
import Textarea from "./Textarea.vue"
import Tooltip from "./Tooltip.vue"
import TruncateText from "./TruncateText.vue"
import { MiuUi } from "../plugin"

const mounted: VueWrapper[] = []

function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount()
  document.body.innerHTML = ""
})

describe("component coverage smoke", () => {
  it("renders Avatar fallback and error path", async () => {
    const wrapper = track(
      mount(Avatar, {
        props: { alt: "Ada Lovelace", src: "data:image/png;base64,invalid", size: "2xl" },
      }),
    )
    await wrapper.get("img").trigger("error")
    expect(wrapper.text()).toContain("A")
  })

  it("renders Badge variants and dot", () => {
    track(
      mount(Badge, {
        props: { variant: "success", size: "lg", radius: "full", dot: true },
        slots: { default: "Ready" },
      }),
    )
    track(mount(Badge, { props: { variant: "primary", icon: "check" }, slots: { default: "OK" } }))
  })

  it("renders Card slots and variants", () => {
    track(
      mount(Card, {
        props: { material: "glass", radius: "lg", padding: "lg", interactive: true },
        slots: { header: "Header", default: "Body", footer: "Footer" },
      }),
    )
    track(mount(Card, { props: { variant: "outline" }, slots: { default: "Outline" } }))
    track(mount(Card, { props: { variant: "ghost" }, slots: { default: "Ghost" } }))
  })

  it("ConfirmDialog emits cancel and confirm", async () => {
    const wrapper = track(
      mount(ConfirmDialog, {
        props: { open: true, title: "Delete?", description: "Cannot undo" },
        attachTo: document.body,
      }),
    )
    await flushPromises()
    const buttons = Array.from(document.body.querySelectorAll<HTMLButtonElement>(".miu-button"))
    buttons[0]?.click()
    buttons[1]?.click()
    expect(wrapper.emitted("cancel")).toBeTruthy()
    expect(wrapper.emitted("confirm")).toBeTruthy()
  })

  it("opens ContextMenu and DropdownMenu", async () => {
    track(
      mount(ContextMenu, {
        props: {
          items: [
            { label: "Edit", value: "edit" },
            { separator: true, label: "", value: "sep" },
          ],
        },
        slots: { trigger: "<div>content</div>" },
        attachTo: document.body,
      }),
    )
    const trigger = document.body.querySelector(".miu-context-menu, div")
    trigger?.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }))
    await flushPromises()

    const menu = track(
      mount(DropdownMenu, {
        props: {
          open: true,
          items: [
            { label: "Edit", value: "edit" },
            { label: "Delete", value: "delete", danger: true },
          ],
        },
        slots: { trigger: '<button type="button">Actions</button>' },
        attachTo: document.body,
      }),
    )
    await flushPromises()
    const item = document.body.querySelector<HTMLElement>(".miu-menu__item")
    item?.click()
    await flushPromises()
    expect(menu.emitted("select")?.[0]?.[0]).toBe("edit")
  })

  it("renders FormRow interactions", async () => {
    const wrapper = track(
      mount(FormRow, {
        props: { label: "Compact", density: "compact", clickable: true, labelFor: "compact-input" },
        slots: { default: '<input id="compact-input" />' },
      }),
    )
    await wrapper.trigger("click")
    await wrapper.trigger("keydown", { key: "Enter" })
    await wrapper.trigger("keydown", { key: " " })
    expect(wrapper.emitted("click")).toHaveLength(3)
  })

  it("renders IconButton states", async () => {
    const wrapper = track(mount(IconButton, { props: { label: "Settings", icon: "settings" } }))
    await wrapper.trigger("click")
    expect(wrapper.emitted("click")).toBeTruthy()
    expect(wrapper.attributes("aria-label")).toBe("Settings")
    track(mount(IconButton, { props: { label: "Close", icon: "close", disabled: true } }))
    track(mount(IconButton, { props: { label: "Loading", icon: "settings", loading: true } }))
  })

  it("MessageComposer emits send and updates model", async () => {
    const wrapper = track(
      mount(MessageComposer, {
        props: { modelValue: "Hello", rows: 2, maxlength: 100 },
      }),
    )
    await wrapper.get("textarea").setValue("Updated")
    expect(wrapper.emitted("update:modelValue")?.[0]?.[0]).toBe("Updated")
    await wrapper.get(".miu-button").trigger("click")
    expect(wrapper.emitted("send")).toBeTruthy()
  })

  it("PageHeader and SectionHeader render slots", async () => {
    const page = track(
      mount(PageHeader, {
        props: { title: "Library", description: "All music", back: true },
        slots: { actions: "<button>Action</button>" },
      }),
    )
    await page.get(".miu-page-header__back").trigger("click")
    expect(page.emitted("back")).toBeTruthy()
    track(
      mount(SectionHeader, {
        props: { title: "Recent", description: "Sorted" },
        slots: { actions: "<button>Manage</button>" },
      }),
    )
  })

  it("Pill supports active, count, remove and click", async () => {
    const wrapper = track(
      mount(Pill, {
        props: { label: "Filter", active: true, count: 3, removable: true, icon: "check" },
      }),
    )
    await wrapper.get(".miu-pill__main").trigger("click")
    await wrapper.get(".miu-pill__remove").trigger("click")
    expect(wrapper.emitted("click")).toBeTruthy()
    expect(wrapper.emitted("remove")).toBeTruthy()
  })

  it("opens Popover and Tooltip", async () => {
    const popover = track(
      mount(Popover, {
        props: { open: true },
        slots: { trigger: '<button type="button">Open</button>', default: "Content" },
        attachTo: document.body,
      }),
    )
    await flushPromises()
    expect(document.body.textContent).toContain("Content")

    const tooltip = track(
      mount(Tooltip, {
        props: { open: true },
        slots: { trigger: '<button type="button">Hover</button>', default: "Tip" },
        attachTo: document.body,
      }),
    )
    await flushPromises()
    expect(document.body.textContent).toContain("Tip")
    void popover
    void tooltip
  })

  it("renders Code, Table, Skeleton, Spinner and TruncateText", () => {
    const code = track(
      mount(Code, {
        props: { variant: "primary", size: "sm" },
        slots: { default: "@xcmm1543/miuui-vue" },
      }),
    )
    expect(code.get("code").classes()).toContain("miu-code--primary")
    const codeProp = track(
      mount(Code, { props: { value: "@xcmm1543/miuui-core", radius: "full" } }),
    )
    expect(codeProp.text()).toBe("@xcmm1543/miuui-core")
    expect(codeProp.attributes("data-miu-radius")).toBe("full")
    const table = track(
      mount(Table, {
        props: {
          bordered: true,
          striped: true,
          radius: "lg",
          material: "glass",
          columns: [{ key: "name", label: "Package" }],
          rows: [{ id: 1, name: "@xcmm1543/miuui-vue" }],
        },
      }),
    )
    expect(table.classes()).toContain("miu-table--bordered")
    expect(table.attributes("data-material")).toBe("glass")
    track(mount(Skeleton, { props: { variant: "circle", width: 24, height: 24, radius: "full" } }))
    track(mount(Skeleton, { props: { variant: "text", animated: false } }))
    track(mount(Spinner, { props: { size: "lg", label: "Loading" } }))
    track(mount(TruncateText, { props: { text: "A long text", lines: 2, title: "Full text" } }))
  })

  it("supports Textarea count and autosize", async () => {
    const wrapper = track(
      mount(Textarea, {
        props: { modelValue: "hello", rows: 2, maxlength: 20, showCount: true },
      }),
    )
    expect(wrapper.text()).toContain("5 / 20")
    await wrapper.get("textarea").setValue("updated")
    expect(wrapper.emitted("update:modelValue")?.[0]?.[0]).toBe("updated")
  })

  it("registers all plugin components", () => {
    const app = createApp({ render: () => null })
    app.use(MiuUi)
    expect(Object.keys(app._context.components).length).toBeGreaterThan(30)
  })
})
