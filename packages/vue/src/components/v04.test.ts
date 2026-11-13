import { flushPromises, mount, type VueWrapper } from "@vue/test-utils"
import axe from "axe-core"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useConfirm } from "../composables/useConfirm"
import { useToast } from "../composables/useToast"
import Button from "./Button.vue"
import Card from "./Card.vue"
import Dialog from "./Dialog.vue"
import FormField from "./FormField.vue"
import Icon from "./Icon.vue"
import Image from "./Image.vue"
import Input from "./Input.vue"
import LoadingOverlay from "./LoadingOverlay.vue"
import NumberInput from "./NumberInput.vue"
import PageHeader from "./PageHeader.vue"
import Pagination from "./Pagination.vue"
import Popconfirm from "./Popconfirm.vue"
import Progress from "./Progress.vue"
import RadioGroup from "./RadioGroup.vue"
import SegmentedControl from "./SegmentedControl.vue"
import Select from "./Select.vue"
import Tabs from "./Tabs.vue"
import ThemeProvider from "./ThemeProvider.vue"
import ToastViewport from "./ToastViewport.vue"
import Tooltip from "./Tooltip.vue"
import TruncateText from "./TruncateText.vue"

const mounted: VueWrapper[] = []
function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
  document.body.innerHTML = ""
})

describe("v0.4.0 SlayMuManager desktop primitives", () => {
  it("renders Progress with value clamp, variants, indeterminate mode, and size warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const wrapper = track(
      mount(Progress, {
        props: {
          modelValue: 130,
          max: 100,
          variant: "success",
          size: "huge" as unknown as "md",
          showValue: true,
          ariaLabel: "Download",
        },
        attachTo: document.body,
      }),
    )
    expect(wrapper.attributes("data-miu-size")).toBe("md")
    expect(wrapper.get(".miu-progress__label").text()).toBe("100%")
    expect(wrapper.get(".miu-progress__indicator").attributes("style")).toContain("translateX(0%)")
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()

    const indet = track(
      mount(Progress, {
        props: { indeterminate: true, variant: "warning", size: "sm", ariaLabel: "Loading" },
      }),
    )
    expect(indet.find(".miu-progress__indicator--indeterminate").exists()).toBe(true)
    expect(indet.find(".miu-progress__label").exists()).toBe(false)

    const results = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
    })
    expect(
      results.violations.filter((v) => v.impact === "serious" || v.impact === "critical"),
    ).toEqual([])
  })

  it("supports RadioGroup radio & button variants with FormField and descriptions", async () => {
    const wrapper = track(
      mount(
        {
          components: { FormField, RadioGroup },
          data: () => ({ value: "cover" }),
          template: `
            <FormField label="Fit mode" density="compact">
              <RadioGroup
                v-model="value"
                variant="radio"
                :options="[
                  { value: 'contain', label: 'Contain', description: 'Show full image' },
                  { value: 'cover', label: 'Cover', description: 'Fill frame' },
                ]"
              />
            </FormField>
          `,
        },
        { attachTo: document.body },
      ),
    )

    const rg = wrapper.get(".miu-radio-group")
    expect(rg.attributes("data-miu-size")).toBe("sm")
    expect(wrapper.findAll(".miu-radio-group__description")).toHaveLength(2)
    await wrapper.findAll(".miu-radio-group__item")[0]?.trigger("click")
    expect(wrapper.vm.value).toBe("contain")

    const btnGroup = track(
      mount(RadioGroup, {
        props: {
          modelValue: "a",
          variant: "button",
          orientation: "horizontal",
          options: ["a", "b"],
          ariaLabel: "Mode",
        },
      }),
    )
    expect(btnGroup.attributes("data-variant")).toBe("button")
    await btnGroup.findAll(".miu-radio-group__item")[1]?.trigger("click")
    expect(btnGroup.emitted("update:modelValue")?.[0]?.[0]).toBe("b")

    const results = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
    })
    expect(
      results.violations.filter((v) => v.impact === "serious" || v.impact === "critical"),
    ).toEqual([])
  })

  it("supports NumberInput steppers, bounds, and FormField integration", async () => {
    const wrapper = track(
      mount(
        {
          components: { FormField, NumberInput },
          data: () => ({ count: 5 }),
          template: `
            <FormField label="Backups" density="compact">
              <NumberInput v-model="count" :min="1" :max="10" :step="1" />
            </FormField>
          `,
        },
        { attachTo: document.body },
      ),
    )
    await flushPromises()
    const root = wrapper.get(".miu-number-input")
    expect(root.attributes("data-miu-size")).toBe("sm")
    const steppers = wrapper.findAll(".miu-number-input__stepper")
    const makePointer = (type: string, pointerId: number) =>
      Object.assign(new MouseEvent(type, { bubbles: true, button: 0 }), {
        pointerId,
        pointerType: "mouse",
      })
    steppers[1]?.element.dispatchEvent(makePointer("pointerdown", 1))
    window.dispatchEvent(makePointer("pointerup", 1))
    await flushPromises()
    expect(wrapper.vm.count).toBe(6)
    steppers[0]?.element.dispatchEvent(makePointer("pointerdown", 2))
    window.dispatchEvent(makePointer("pointerup", 2))
    await flushPromises()
    expect(wrapper.vm.count).toBe(5)
    await wrapper.get("input").trigger("keydown", { key: "ArrowUp" })
    await flushPromises()
    expect(wrapper.vm.count).toBe(6)
  })

  it("opens Popconfirm, emits confirm/cancel, and supports imperative useConfirm()", async () => {
    const pop = track(
      mount(Popconfirm, {
        props: { title: "Delete file?", description: "Cannot undo", danger: true },
        slots: { trigger: '<button type="button" id="pop-trig">Delete</button>' },
        attachTo: document.body,
      }),
    )
    await pop.get("#pop-trig").trigger("click")
    await flushPromises()
    const content = document.querySelector(".miu-popconfirm")
    expect(content).not.toBeNull()
    const btns = content?.querySelectorAll("button") ?? []
    ;(btns[1] as HTMLButtonElement | undefined)?.click()
    await flushPromises()
    expect(pop.emitted("confirm")).toHaveLength(1)
    expect(document.querySelector(".miu-popconfirm")).toBeNull()

    track(mount(ThemeProvider, { attachTo: document.body }))
    const { confirm } = useConfirm()
    const promise = confirm({
      title: "Need game path",
      description: "Configure now?",
      danger: true,
    })
    await flushPromises()
    const dlg = document.querySelector(".miu-dialog__content")
    expect(dlg?.textContent).toContain("Need game path")
    const footerBtns = dlg?.querySelectorAll(".miu-dialog__footer button") ?? []
    ;(footerBtns[1] as HTMLButtonElement | undefined)?.click()
    await flushPromises()
    expect(await promise).toBe(true)

    const cancelPromise = confirm({ title: "Second confirm" })
    await flushPromises()
    const footerBtns2 = document.querySelectorAll(".miu-dialog__footer button")
    ;(footerBtns2[0] as HTMLButtonElement | undefined)?.click()
    await flushPromises()
    expect(await cancelPromise).toBe(false)
  })

  it("supports Select numeric values, Card title prop, Tooltip disabled, and minus icon", () => {
    const card = track(mount(Card, { props: { title: "Appearance" }, slots: { default: "Body" } }))
    expect(card.get(".miu-card__title").text()).toBe("Appearance")

    const sel = track(
      mount(Select, {
        props: {
          modelValue: 20,
          options: [
            { value: 20, label: "20 / page" },
            { value: 50, label: "50 / page" },
          ],
          ariaLabel: "Page size",
        },
      }),
    )
    expect(sel.text()).toContain("20 / page")

    const tip = track(
      mount(Tooltip, {
        props: { open: true, disabled: true },
        slots: { trigger: "<button>Trigger</button>", default: "Hidden tip" },
        attachTo: document.body,
      }),
    )
    expect(tip.exists()).toBe(true)

    const minus = track(mount(Icon, { props: { name: "minus", label: "Minimize" } }))
    expect(minus.find("path").attributes("d")).toBe("M5 12h14")
  })

  it("supports Dialog hideHeader while preserving accessible sr-only DialogTitle", async () => {
    const dlg = track(
      mount(
        {
          components: { ThemeProvider, Dialog },
          template:
            '<ThemeProvider><Dialog :open="true" hide-header aria-label="Image preview"><img alt="preview" /></Dialog></ThemeProvider>',
        },
        { attachTo: document.body },
      ),
    )
    await flushPromises()
    expect(document.querySelector(".miu-dialog__header")).toBeNull()
    const srTitle = document.querySelector(".miu-sr-only")
    expect(srTitle?.textContent?.trim()).toBe("Image preview")
    expect(dlg.exists()).toBe(true)
  })

  it("renders default slot inside .miu-button__icon when Button iconOnly is used without #icon", () => {
    const btn = track(
      mount(Button, {
        props: { iconOnly: true, ariaLabel: "Grid view" },
        slots: { default: '<svg data-testid="grid-svg"></svg>' },
      }),
    )
    expect(btn.find(".miu-button__icon [data-testid='grid-svg']").exists()).toBe(true)
    expect(btn.find(".miu-button__label").exists()).toBe(false)
  })

  it("supports SegmentedControl iconOnly, #item slot, sliding indicator measurement, and active re-click guard", async () => {
    const onUpdate = vi.fn()
    const seg = track(
      mount(SegmentedControl, {
        props: {
          modelValue: "grid",
          iconOnly: true,
          ariaLabel: "View mode",
          options: [
            { value: "grid", label: "Grid view" },
            { value: "split", label: "Split view" },
          ],
          "onUpdate:modelValue": onUpdate,
        },
        slots: {
          item: ({ option }: { option: { value: string } }) =>
            `<svg data-mode="${option.value}"></svg>`,
        },
        attachTo: document.body,
      }),
    )
    expect(seg.get(".miu-segmented").attributes("data-icon-only")).toBe("true")
    const items = seg.findAll(".miu-segmented__item")
    expect(items[0]?.attributes("aria-label")).toBe("Grid view")
    expect(items[0]?.html()).toContain('data-mode="grid"')

    for (const [idx, item] of items.entries()) {
      const el = item.element as HTMLElement
      Object.defineProperty(el, "offsetWidth", { configurable: true, value: 48 })
      Object.defineProperty(el, "offsetHeight", { configurable: true, value: 28 })
      Object.defineProperty(el, "offsetLeft", { configurable: true, value: idx * 52 + 4 })
      Object.defineProperty(el, "offsetTop", { configurable: true, value: 4 })
    }
    await seg.setProps({ modelValue: "split" })
    await flushPromises()
    const indicator = seg.find(".miu-segmented__indicator")
    expect(indicator.exists()).toBe(true)
    expect(indicator.attributes("style")).toContain("translate3d(56px, 4px, 0px)")

    await items[0]?.trigger("click")
    expect(onUpdate).toHaveBeenCalledWith("grid")
  })

  it("supports Toast position, 3-tier materials, styleVariants, custom/hidden icons, max cap, action, and #icon slot", async () => {
    const { toast, clear, setToastDefaults, resetToastDefaults } = useToast()
    clear()
    resetToastDefaults()
    const onAction = vi.fn()
    setToastDefaults({ max: 3, duration: 500 })
    const CustomIcon = { template: '<svg data-testid="comp-icon"></svg>' }

    track(
      mount(
        {
          components: { ThemeProvider, ToastViewport },
          template: `
            <ThemeProvider toast-position="top-center">
              <ToastViewport position="top-center" :max="3">
                <template #icon="{ toast: t }">
                  <span v-if="t.variant === 'info'" class="custom-slot-icon">I</span>
                </template>
              </ToastViewport>
            </ThemeProvider>
          `,
        },
        { attachTo: document.body },
      ),
    )

    toast({ title: "Evicted", variant: "default", icon: false })
    toast({
      title: "Solid glass",
      variant: "success",
      material: "glass",
      styleVariant: "solid",
      icon: CustomIcon,
    })
    toast({
      title: "Mica subtle",
      variant: "warning",
      material: "mica",
      styleVariant: "subtle",
      icon: "bell",
    })
    toast({
      title: "Slot icon",
      variant: "info",
      material: "solid",
      styleVariant: "outline",
      position: "bottom-left",
      action: { label: "Retry", onClick: onAction },
    })
    await flushPromises()

    const viewports = document.querySelectorAll(".miu-toast-viewport")
    const positions = Array.from(viewports).map((v) => v.getAttribute("data-position"))
    expect(positions).toContain("top-center")
    expect(positions).toContain("bottom-left")

    const toasts = Array.from(document.querySelectorAll(".miu-toast"))
    expect(toasts).toHaveLength(3)
    expect(toasts[0]?.getAttribute("data-material")).toBe("glass")
    expect(toasts[0]?.getAttribute("data-style-variant")).toBe("solid")
    expect(toasts[0]?.querySelector('[data-testid="comp-icon"]')).not.toBeNull()
    expect(toasts[1]?.getAttribute("data-material")).toBe("mica")
    expect(toasts[1]?.getAttribute("data-style-variant")).toBe("subtle")
    expect(toasts[2]?.getAttribute("data-style-variant")).toBe("outline")
    expect(toasts[2]?.querySelector(".custom-slot-icon")?.textContent).toBe("I")

    ;(toasts[2]?.querySelector(".miu-toast__action") as HTMLButtonElement | null)?.click()
    expect(onAction).toHaveBeenCalledTimes(1)

    clear()
    resetToastDefaults()
  })

  it("supports Tooltip maxWidth, maxHeight, and inherited ThemeProvider material", async () => {
    track(
      mount(
        {
          components: { ThemeProvider, Tooltip },
          template: `
            <ThemeProvider material="glass">
              <Tooltip :open="true" material="glass" max-width="380px" max-height="240px">
                <template #trigger><button type="button">Info</button></template>
                Long scrollable tooltip content
              </Tooltip>
            </ThemeProvider>
          `,
        },
        { attachTo: document.body },
      ),
    )
    await flushPromises()
    const tip = document.querySelector(".miu-tooltip")
    expect(tip).not.toBeNull()
    expect(tip?.getAttribute("data-material")).toBe("glass")
    expect(tip?.getAttribute("style")).toContain("max-width: 380px")
    expect(tip?.getAttribute("style")).toContain("max-block-size: 240px")
  })

  it("supports Input passwordToggle and eye/eyeOff icons", async () => {
    const inp = track(
      mount(Input, {
        props: { type: "password", passwordToggle: true, modelValue: "secret", ariaLabel: "Key" },
      }),
    )
    expect(inp.get("input").attributes("type")).toBe("password")
    const toggle = inp.get(".miu-input__toggle")
    expect(toggle.attributes("aria-pressed")).toBe("false")
    await toggle.trigger("click")
    expect(inp.get("input").attributes("type")).toBe("text")
    expect(toggle.attributes("aria-pressed")).toBe("true")
    await toggle.trigger("click")
    expect(inp.get("input").attributes("type")).toBe("password")
  })

  it("supports Pagination numeric mode with ellipsis, pageSize Select, and quick jumper", async () => {
    const onPage = vi.fn()
    const onSize = vi.fn()
    const pg = track(
      mount(Pagination, {
        props: {
          mode: "numeric",
          page: 5,
          pageSize: 20,
          total: 400,
          pageSizeOptions: [
            { label: "20", value: 20 },
            { label: "50", value: 50 },
          ],
          "onUpdate:page": onPage,
          "onUpdate:pageSize": onSize,
        },
      }),
    )
    expect(pg.find(".miu-pagination--numeric").exists()).toBe(true)
    expect(pg.findAll(".miu-pagination__ellipsis")).toHaveLength(2)
    const active = pg.get('[aria-current="page"]')
    expect(active.text()).toBe("5")
    await pg.findAll(".miu-pagination__page-btn")[1]?.trigger("click")
    expect(onPage).toHaveBeenCalled()
    pg.findComponent({ name: "Select" }).vm.$emit("update:modelValue", 50)
    expect(onSize).toHaveBeenCalledWith(50)
    pg.findComponent({ name: "NumberInput" }).vm.$emit("update:modelValue", 12)
    expect(onPage).toHaveBeenCalledWith(12)
  })

  it("supports Image fallback, error handling, and preview lightbox", async () => {
    const fallbackImg = track(mount(Image, { props: { src: null, alt: "Empty" } }))
    expect(fallbackImg.find(".miu-image__fallback").exists()).toBe(true)

    const previewImg = track(
      mount(
        {
          components: { ThemeProvider, Image },
          template:
            '<ThemeProvider><Image src="https://example.com/a.png" alt="Cover" previewable width="120px" height="80px" /></ThemeProvider>',
        },
        { attachTo: document.body },
      ),
    )
    await previewImg.get(".miu-image").trigger("click")
    await flushPromises()
    expect(document.querySelector(".miu-image__lightbox-img")?.getAttribute("src")).toBe(
      "https://example.com/a.png",
    )
    await previewImg.get(".miu-image__img").trigger("error")
    await flushPromises()
    expect(previewImg.find(".miu-image__fallback").exists()).toBe(true)
  })

  it("supports LoadingOverlay inline/fullscreen and toast shorthand helpers", async () => {
    const { toast, toasts, clear } = useToast()
    clear()
    toast.success("Done")
    toast.error("Oops")
    toast.warning("Careful")
    toast.info("FYI")
    expect(toasts.value.map((t) => t.variant)).toEqual(["success", "error", "warning", "info"])
    clear()

    const inline = track(
      mount(LoadingOverlay, {
        props: { loading: true, fullscreen: false, text: "Loading mods..." },
      }),
    )
    expect(inline.find(".miu-loading-overlay").exists()).toBe(true)
    expect(inline.find(".miu-loading-overlay__text").text()).toBe("Loading mods...")

    track(
      mount(LoadingOverlay, {
        props: { loading: true, fullscreen: true, text: "Syncing..." },
        attachTo: document.body,
      }),
    )
    await flushPromises()
    expect(document.querySelector(".miu-loading-overlay--fullscreen")?.textContent).toContain(
      "Syncing...",
    )
  })

  it("keeps PageHeader borderless by default and exposes data-divider when divider=true", () => {
    const plain = track(mount(PageHeader, { props: { title: "Library" } }))
    expect(plain.attributes("data-divider")).toBeUndefined()
    const withDivider = track(mount(PageHeader, { props: { title: "Docs", divider: true } }))
    expect(withDivider.attributes("data-divider")).toBe("true")
  })

  it("omits native title attribute on TruncateText when title is false", () => {
    const t = track(mount(TruncateText, { props: { text: "Full text", title: false } }))
    expect(t.attributes("title")).toBeUndefined()
  })

  it("measures sliding indicators on Tabs (underline + pills) and RadioGroup button variant", async () => {
    const tabs = track(
      mount(Tabs, {
        props: {
          modelValue: "one",
          variant: "underline",
          ariaLabel: "Sections",
          items: [
            { value: "one", label: "One" },
            { value: "two", label: "Two" },
          ],
        },
        attachTo: document.body,
      }),
    )
    const triggers = tabs.findAll(".miu-tabs__trigger")
    for (const [idx, trig] of triggers.entries()) {
      const el = trig.element as HTMLElement
      Object.defineProperty(el, "offsetWidth", { configurable: true, value: 64 })
      Object.defineProperty(el, "offsetHeight", { configurable: true, value: 32 })
      Object.defineProperty(el, "offsetLeft", { configurable: true, value: idx * 72 })
      Object.defineProperty(el, "offsetTop", { configurable: true, value: 0 })
    }
    await tabs.setProps({ modelValue: "two" })
    await flushPromises()
    const tabIndicator = tabs.find(".miu-tabs__indicator")
    expect(tabIndicator.exists()).toBe(true)
    expect(tabs.find(".miu-tabs").classes()).toContain("miu-tabs--has-indicator")
    expect(tabIndicator.attributes("style")).toContain("translate3d(72px, 0px, 0px)")

    await tabs.setProps({ variant: "pills" })
    await flushPromises()
    expect(tabs.find(".miu-tabs__indicator").attributes("style")).toContain("height: 32px")

    const rg = track(
      mount(RadioGroup, {
        props: {
          modelValue: "a",
          variant: "button",
          ariaLabel: "Layout",
          options: ["a", "b"],
        },
        attachTo: document.body,
      }),
    )
    const rgItems = rg.findAll(".miu-radio-group__item")
    for (const [idx, item] of rgItems.entries()) {
      const el = item.element as HTMLElement
      Object.defineProperty(el, "offsetWidth", { configurable: true, value: 50 })
      Object.defineProperty(el, "offsetHeight", { configurable: true, value: 30 })
      Object.defineProperty(el, "offsetLeft", { configurable: true, value: idx * 54 + 4 })
      Object.defineProperty(el, "offsetTop", { configurable: true, value: 4 })
    }
    await rg.setProps({ modelValue: "b" })
    await flushPromises()
    const rgIndicator = rg.find(".miu-radio-group__sliding-indicator")
    expect(rgIndicator.exists()).toBe(true)
    expect(rg.find(".miu-radio-group").classes()).toContain("miu-radio-group--has-indicator")
    expect(rgIndicator.attributes("style")).toContain("translate3d(58px, 4px, 0px)")
  })
})
