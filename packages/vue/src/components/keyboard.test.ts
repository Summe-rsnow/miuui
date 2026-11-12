import { flushPromises, mount, type VueWrapper } from "@vue/test-utils"
import { afterEach, describe, expect, it } from "vitest"
import Checkbox from "./Checkbox.vue"
import CommandPalette from "./CommandPalette.vue"
import Dialog from "./Dialog.vue"
import Drawer from "./Drawer.vue"
import FormRow from "./FormRow.vue"
import Input from "./Input.vue"
import SegmentedControl from "./SegmentedControl.vue"
import Switch from "./Switch.vue"
import Tabs from "./Tabs.vue"

const mounted: VueWrapper[] = []

function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount()
  document.body.innerHTML = ""
})

describe("keyboard interactions", () => {
  it("navigates Tabs with ArrowRight, ArrowLeft, Home, and End skipping disabled tabs", async () => {
    const wrapper = track(
      mount(Tabs, {
        props: {
          modelValue: "one",
          ariaLabel: "Views",
          items: [
            { value: "one", label: "One" },
            { value: "disabled", label: "Disabled", disabled: true },
            { value: "two", label: "Two" },
            { value: "three", label: "Three" },
          ],
        },
        attachTo: document.body,
      }),
    )
    await flushPromises()
    const triggers = wrapper.findAll('[role="tab"]')
    ;(triggers[0]?.element as HTMLElement | undefined)?.focus()
    await triggers[0]?.trigger("focusin")
    await flushPromises()

    await triggers[0]?.trigger("keydown", { key: "ArrowRight" })
    await flushPromises()
    expect(document.activeElement).toBe(triggers[2]?.element)

    await triggers[2]?.trigger("keydown", { key: "End" })
    await flushPromises()
    expect(document.activeElement).toBe(triggers[3]?.element)

    await triggers[3]?.trigger("keydown", { key: "Home" })
    await flushPromises()
    expect(document.activeElement).toBe(triggers[0]?.element)
  })

  it("navigates SegmentedControl with ArrowRight and ArrowLeft", async () => {
    const wrapper = track(
      mount(SegmentedControl, {
        props: {
          modelValue: "grid",
          ariaLabel: "Layout",
          options: [
            { value: "grid", label: "Grid" },
            { value: "list", label: "List" },
          ],
        },
        attachTo: document.body,
      }),
    )

    await flushPromises()
    const items = wrapper.findAll(".miu-segmented__item")
    ;(items[0]?.element as HTMLElement | undefined)?.focus()
    await items[0]?.trigger("focusin")
    await flushPromises()

    await items[0]?.trigger("keydown", { key: "ArrowRight" })
    await flushPromises()
    expect(document.activeElement).toBe(items[1]?.element)

    await items[1]?.trigger("keydown", { key: "ArrowLeft" })
    await flushPromises()
    expect(document.activeElement).toBe(items[0]?.element)
  })

  it("navigates CommandPalette with ArrowDown, ArrowUp, End, Home, and Enter", async () => {
    const wrapper = track(
      mount(CommandPalette, {
        props: {
          open: true,
          items: [
            { title: "Button", link: "/components/button" },
            { title: "Input", link: "/components/input" },
            { title: "Table", link: "/components/table" },
          ],
        },
        attachTo: document.body,
      }),
    )

    await flushPromises()
    const content = document.body.querySelector<HTMLElement>(".miu-command-palette")
    expect(content).not.toBeNull()

    content?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
    await flushPromises()
    const options = document.body.querySelectorAll('[role="option"]')
    expect(options[1]?.getAttribute("aria-selected")).toBe("true")

    content?.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }))
    await flushPromises()
    expect(options[2]?.getAttribute("aria-selected")).toBe("true")

    content?.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }))
    await flushPromises()
    expect(options[0]?.getAttribute("aria-selected")).toBe("true")

    content?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }))
    await flushPromises()
    expect(options[2]?.getAttribute("aria-selected")).toBe("true")

    content?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
    await flushPromises()
    expect(wrapper.emitted("select")?.[0]?.[0]).toMatchObject({ title: "Table" })
  })

  it("closes Dialog and Drawer on Escape", async () => {
    const dialog = track(
      mount(Dialog, {
        props: { open: true, title: "Settings", description: "Edit" },
        slots: { default: "Body" },
        attachTo: document.body,
      }),
    )
    await flushPromises()
    const dialogContent = document.body.querySelector<HTMLElement>(".miu-dialog__content")
    dialogContent?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
    await flushPromises()
    expect(dialog.emitted("update:open")?.[0]?.[0]).toBe(false)

    const drawer = track(
      mount(Drawer, {
        props: { open: true, title: "Nav" },
        slots: { default: "Links" },
        attachTo: document.body,
      }),
    )
    await flushPromises()
    const drawerContent = document.body.querySelector<HTMLElement>(".miu-drawer__content")
    drawerContent?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
    await flushPromises()
    expect(drawer.emitted("update:open")?.[0]?.[0]).toBe(false)
  })

  it("supports Input Enter/clear focus restoration, FormRow Enter/Space, and Checkbox/Switch keys", async () => {
    const input = track(
      mount(Input, {
        props: { modelValue: "Ada", clearable: true },
        attachTo: document.body,
      }),
    )
    await input.get("input").trigger("keydown.enter")
    expect(input.emitted("enter")).toHaveLength(1)
    await input.get(".miu-input__clear").trigger("click")
    expect(input.emitted("update:modelValue")?.[0]?.[0]).toBe("")
    expect(document.activeElement).toBe(input.get("input").element)

    const row = track(
      mount(FormRow, {
        props: { label: "Shortcut", clickable: true },
        attachTo: document.body,
      }),
    )
    await row.trigger("keydown", { key: "Enter" })
    await row.trigger("keydown", { key: " " })
    expect(row.emitted("click")).toHaveLength(2)

    const checkbox = track(
      mount(Checkbox, {
        props: { modelValue: false, label: "Accept" },
        attachTo: document.body,
      }),
    )
    await checkbox.get('[role="checkbox"]').trigger("click")
    expect(checkbox.emitted("update:modelValue")?.[0]?.[0]).toBe(true)

    const sw = track(
      mount(Switch, {
        props: { modelValue: false, label: "Alerts" },
        attachTo: document.body,
      }),
    )
    await sw.get('[role="switch"]').trigger("click")
    expect(sw.emitted("update:modelValue")?.[0]?.[0]).toBe(true)
  })
})
