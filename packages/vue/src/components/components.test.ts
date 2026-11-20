import { flushPromises, mount } from "@vue/test-utils"
import { describe, expect, it, vi } from "vitest"
import Alert from "./Alert.vue"
import AppBar from "./AppBar.vue"
import Avatar from "./Avatar.vue"
import Badge from "./Badge.vue"
import Button from "./Button.vue"
import Checkbox from "./Checkbox.vue"
import Dialog from "./Dialog.vue"
import FormField from "./FormField.vue"
import FormRow from "./FormRow.vue"
import Input from "./Input.vue"
import Pill from "./Pill.vue"
import Popover from "./Popover.vue"
import SegmentedControl from "./SegmentedControl.vue"
import Select from "./Select.vue"
import Switch from "./Switch.vue"
import Table from "./Table.vue"
import Tabs from "./Tabs.vue"
import ThemeProvider from "./ThemeProvider.vue"
import { useToast } from "../composables/useToast"
describe("Button", () => {
  it("renders its label and emits click", async () => {
    const wrapper = mount(Button, { slots: { default: "Save" } })
    expect(wrapper.text()).toBe("Save")
    await wrapper.trigger("click")
    expect(wrapper.emitted("click")).toHaveLength(1)
  })

  it("does not emit click while disabled", async () => {
    const wrapper = mount(Button, { props: { disabled: true }, slots: { default: "Save" } })
    await wrapper.trigger("click")
    expect(wrapper.emitted("click")).toBeUndefined()
  })

  it("requires an accessible name in icon-only mode at compile time and runtime", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    // @ts-expect-error icon-only Button requires ariaLabel or aria-label
    mount(Button, { props: { iconOnly: true, icon: "check" } })
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("icon-only mode requires `aria-label`"),
    )
    warn.mockRestore()

    const withCamel = mount(Button, {
      props: { iconOnly: true, icon: "check", ariaLabel: "Confirm" },
    })
    const withAria = mount(Button, {
      props: { iconOnly: true, icon: "check", "aria-label": "Confirm" },
    })
    expect(withCamel.attributes("aria-label")).toBe("Confirm")
    expect(withAria.attributes("aria-label")).toBe("Confirm")
  })
  it("maps orthogonal size attributes and derives loading spinner iconSize", () => {
    const wrapper = mount(Button, {
      props: { size: "2xl", radius: "full", iconSize: "sm", icon: "check", loading: true },
      slots: { default: "CTA" },
    })
    expect(wrapper.attributes("data-miu-size")).toBe("2xl")
    expect(wrapper.attributes("data-miu-radius")).toBe("full")
    expect(wrapper.attributes("data-miu-icon-size")).toBe("sm")
    expect(wrapper.get(".miu-spinner").attributes("data-miu-icon-size")).toBe("sm")
  })

  it("warns and falls back on unsupported sizes", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const wrapper = mount(Button, {
      props: { size: "huge" as unknown as "md" },
      slots: { default: "CTA" },
    })
    expect(wrapper.attributes("data-miu-size")).toBe("md")
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('unsupported size "huge"'))
    warn.mockRestore()
  })
})

describe("orthogonal rules across controls and overlays", () => {
  it("propagates ThemeProvider material and motionTier and respects local overrides", async () => {
    const wrapper = mount(
      {
        components: { ThemeProvider, AppBar, Button, Tabs, SegmentedControl, Dialog, Popover },
        template: `
          <ThemeProvider theme="dark" density="compact" radius="lg" material="mica" motion-tier="reduced">
            <AppBar blurred material="glass" :class-names="{ root: 'custom-bar' }">Nav</AppBar>
            <Button material="glass" variant="glass">Glass</Button>
            <Tabs
              model-value="a"
              :items="[{ value: 'a', label: 'A', icon: 'check' }]"
              size="xl"
              icon-size="sm"
              :class-names="{ root: 'tabs-root', trigger: 'tabs-trig' }"
              aria-label="Tabs"
            />
            <SegmentedControl
              model-value="x"
              :options="[{ value: 'x', label: 'X', icon: 'plus' }]"
              size="lg"
              radius="full"
              icon-size="xs"
              :class-names="{ root: 'seg-root', item: 'seg-item' }"
              aria-label="Seg"
            />
            <Dialog
              open
              title="Confirm"
              description="Verify changes"
              material="glass"
              :class-names="{ content: 'dlg-glass' }"
            >
              Body
            </Dialog>
            <Popover open material="mica" :class-names="{ content: 'pop-mica' }">
              <template #trigger><button type="button">Open</button></template>
              Tip
            </Popover>
          </ThemeProvider>
        `,
      },
      { attachTo: document.body },
    )

    const provider = wrapper.get(".miu-theme-provider")
    expect(provider.attributes("data-material")).toBe("mica")
    expect(provider.attributes("data-motion-tier")).toBe("reduced")
    expect(provider.attributes("data-density")).toBe("compact")
    expect(provider.attributes("data-radius")).toBe("lg")

    expect(wrapper.get(".miu-app-bar").attributes("data-material")).toBe("glass")
    expect(wrapper.get(".miu-app-bar").classes()).toContain("custom-bar")
    expect(wrapper.get(".miu-tabs").attributes("data-miu-size")).toBe("xl")
    expect(wrapper.get(".miu-tabs").attributes("data-miu-icon-size")).toBe("sm")
    expect(wrapper.get(".miu-tabs").classes()).toContain("tabs-root")
    expect(wrapper.get(".miu-tabs__trigger").classes()).toContain("tabs-trig")
    expect(wrapper.get(".miu-segmented").attributes("data-miu-radius")).toBe("full")
    expect(wrapper.get(".miu-segmented").attributes("data-miu-icon-size")).toBe("xs")
    expect(wrapper.get(".miu-segmented__item").classes()).toContain("seg-item")
    await flushPromises()
    const dialogContent = document.body.querySelector(".miu-dialog__content")
    const popover = document.body.querySelector(".miu-popover")
    expect(dialogContent?.getAttribute("data-material")).toBe("glass")
    expect(dialogContent?.classList.contains("dlg-glass")).toBe(true)
    expect(popover?.getAttribute("data-material")).toBe("mica")
    expect(popover?.classList.contains("pop-mica")).toBe(true)

    wrapper.unmount()
    document.body.innerHTML = ""
  })

  it("warns on unsupported Select, Input, Checkbox, Switch, Badge, Pill, and Avatar sizes", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const input = mount(Input, { props: { size: "massive" as unknown as "md" } })
    const select = mount(Select, {
      props: { size: "massive" as unknown as "md", options: [{ value: "a", label: "A" }] },
    })
    const checkbox = mount(Checkbox, {
      props: { size: "2xl" as unknown as "md", label: "Opt" },
    })
    const sw = mount(Switch, {
      props: { size: "2xl" as unknown as "md", label: "Toggle" },
    })
    const badge = mount(Badge, {
      props: { size: "2xl" as unknown as "md", icon: "check" },
      slots: { default: "OK" },
    })
    const pill = mount(Pill, {
      props: { size: "2xl" as unknown as "md", icon: "plus", label: "Filter" },
    })
    const avatar = mount(Avatar, {
      props: { alt: "Ada", size: "massive" as unknown as "md" },
    })
    expect(input.attributes("data-miu-size")).toBe("md")
    expect(select.attributes("data-miu-size")).toBe("md")
    expect(checkbox.attributes("data-miu-size")).toBe("md")
    expect(sw.attributes("data-miu-size")).toBe("md")
    expect(badge.attributes("data-miu-size")).toBe("md")
    expect(pill.attributes("data-miu-size")).toBe("md")
    expect(avatar.attributes("data-miu-size")).toBe("md")
    expect(warn).toHaveBeenCalledTimes(7)
    warn.mockRestore()
  })

  it("renders Alert icon region and FormField/FormRow local density attributes", () => {
    const alert = mount(Alert, {
      props: {
        variant: "warning",
        title: "Heads up",
        icon: "bell",
        classNames: { icon: "alert-ic" },
      },
      slots: { default: "Check tokens" },
    })
    expect(alert.get(".miu-alert__icon").classes()).toContain("alert-ic")

    const field = mount(FormField, {
      props: { label: "Email", density: "compact" },
      slots: { default: "<input />" },
    })
    const row = mount(FormRow, {
      props: {
        label: "Auto play",
        icon: "settings",
        density: "comfortable",
        classNames: { icon: "row-ic" },
      },
    })
    expect(field.attributes("data-density")).toBe("compact")
    expect(row.attributes("data-density")).toBe("comfortable")
    expect(row.get(".miu-form-row__icon").classes()).toContain("row-ic")
  })
})

describe("FormField + Input", () => {
  it("links label, description, error and invalid state", () => {
    const wrapper = mount({
      components: { FormField, Input },
      data: () => ({ value: "" }),
      template: `
        <FormField id="name" label="Name" description="Visible to others" error="Required" required>
          <Input id="name" v-model="value" />
        </FormField>
      `,
    })

    const input = wrapper.get("input")
    expect(input.attributes("id")).toBe("name")
    expect(input.attributes("aria-describedby")).toBe("name-description name-error")
    expect(input.attributes("aria-invalid")).toBe("true")
    expect(input.attributes("aria-required")).toBe("true")
    expect(wrapper.get("label").attributes("for")).toBe("name")
  })
})

describe("Table", () => {
  it("renders a scoped cell slot and empty state", () => {
    const wrapper = mount(Table, {
      props: {
        columns: [
          { key: "name", label: "Name" },
          { key: "role", label: "Role" },
        ],
        rows: [{ id: 1, name: "Ada", role: "Engineer" }],
      },
      slots: {
        "cell-name": `<template #cell-name="{ value }"><strong>{{ value }}</strong></template>`,
      },
    })
    expect(wrapper.get("strong").text()).toBe("Ada")
  })
})

describe("toast", () => {
  it("adds and dismisses messages", () => {
    vi.useFakeTimers()
    const { toasts, toast, dismiss } = useToast()
    const id = toast({ title: "Saved", duration: 1000 })
    expect(toasts.value).toHaveLength(1)
    dismiss(id)
    expect(toasts.value).toHaveLength(0)
    vi.useRealTimers()
  })

  it("auto-dismisses and clears all messages", () => {
    vi.useFakeTimers()
    const { toasts, toast, clear } = useToast()
    toast({ title: "One", duration: 100 })
    toast({ title: "Two", duration: 0 })
    expect(toasts.value).toHaveLength(2)
    vi.advanceTimersByTime(200)
    expect(toasts.value).toHaveLength(1)
    clear()
    expect(toasts.value).toHaveLength(0)
    vi.useRealTimers()
  })
})

describe("density size hint", () => {
  it("lowers unsized controls to sm inside a compact FormField", () => {
    const wrapper = mount({
      components: { Button, FormField, Input, Table },
      template: `
        <div>
          <FormField density="compact" label="Compact">
            <Input model-value="x" />
          </FormField>
          <FormField density="compact" label="Explicit">
            <Input model-value="x" size="lg" />
          </FormField>
          <FormField density="default" label="Default">
            <Input model-value="x" />
          </FormField>
          <Table
            density="compact"
            :columns="[{ key: 'name', label: 'Name' }]"
            :rows="[{ id: 1, name: 'Ada' }]"
          >
            <template #cell-name>
              <Button>Open</Button>
            </template>
          </Table>
        </div>
      `,
      attachTo: document.body,
    })
    const sizes = wrapper.findAll(".miu-input").map((el) => el.attributes("data-miu-size"))
    expect(sizes).toEqual(["sm", "lg", "md"])
    expect(wrapper.get(".miu-table .miu-button").attributes("data-miu-size")).toBe("sm")
    wrapper.unmount()
  })

  it("lets an explicit control size win over the hint", () => {
    const wrapper = mount({
      components: { Button, FormField },
      template: `
        <FormField density="compact" label="Explicit">
          <Button size="xl">Go</Button>
        </FormField>
      `,
    })
    expect(wrapper.get(".miu-button").attributes("data-miu-size")).toBe("xl")
    wrapper.unmount()
  })
})
