import { createSSRApp, h } from "vue"
import { renderToString } from "vue/server-renderer"
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils"
import axe from "axe-core"
import { afterEach, describe, expect, it, vi } from "vitest"
import { registerMaterial } from "@xcmm1543/miuui-core"
import Accordion from "./Accordion.vue"
import Divider from "./Divider.vue"
import Steps from "./Steps.vue"

const mounted: VueWrapper[] = []

function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
  document.body.innerHTML = ""
  vi.restoreAllMocks()
})

async function expectNoSeriousViolations(label: string): Promise<void> {
  await flushPromises()
  const results = await axe.run(document.body, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    rules: {
      "color-contrast": { enabled: false },
      region: { enabled: false },
      "landmark-one-main": { enabled: false },
      "page-has-heading-one": { enabled: false },
    },
  })
  const violations = results.violations
    .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    }))
  expect(violations, `${label}: ${JSON.stringify(violations, null, 2)}`).toEqual([])
}

describe("v1.0.0 Layout & Navigation components", () => {
  describe("Divider", () => {
    it("renders horizontal and vertical separators with dashed and spacing modifiers", () => {
      const horiz = track(
        mount(Divider, {
          props: { dashed: true, spacing: "lg" },
        }),
      )
      expect(horiz.attributes("role")).toBe("separator")
      expect(horiz.attributes("data-orientation")).toBe("horizontal")
      expect(horiz.attributes("data-dashed")).toBe("true")
      expect(horiz.attributes("data-spacing")).toBe("lg")
      expect(horiz.classes()).toContain("miu-divider--dashed")
      expect(horiz.classes()).toContain("miu-divider--spacing-lg")

      const vert = track(
        mount(Divider, {
          props: { orientation: "vertical", decorative: true, spacing: "none" },
        }),
      )
      expect(vert.attributes("role")).toBe("none")
      expect(vert.attributes("data-orientation")).toBe("vertical")
      expect(vert.classes()).toContain("miu-divider--vertical")
      expect(vert.classes()).toContain("miu-divider--spacing-none")
    })

    it("supports label prop, labelAlign, default slot, and all semantic regions", () => {
      const labeled = track(
        mount(Divider, {
          props: {
            label: "OR",
            labelAlign: "start",
            classNames: { root: "div-root", line: "div-line", label: "div-label" },
            styles: {
              root: { opacity: "0.9" },
              line: { borderColor: "currentColor" },
              label: { letterSpacing: "0.05em" },
            },
          },
        }),
      )
      expect(labeled.classes()).toContain("div-root")
      expect(labeled.classes()).toContain("miu-divider--with-label")
      expect(labeled.classes()).toContain("miu-divider--align-start")
      expect(labeled.attributes("style")).toContain("opacity: 0.9")

      const lines = labeled.findAll(".miu-divider__line")
      expect(lines).toHaveLength(2)
      for (const line of lines) {
        expect(line.classes()).toContain("div-line")
        expect(line.attributes("style")?.toLowerCase()).toContain("border-color: currentcolor")
      }

      const labelEl = labeled.get(".miu-divider__label")
      expect(labelEl.text()).toBe("OR")
      expect(labelEl.classes()).toContain("div-label")
      expect(labelEl.attributes("style")).toContain("letter-spacing: 0.05em")

      const slotted = track(
        mount(Divider, {
          props: { label: "Fallback", labelAlign: "end" },
          slots: { default: "<strong>Custom Slot</strong>" },
        }),
      )
      expect(slotted.get(".miu-divider__label strong").text()).toBe("Custom Slot")
      expect(slotted.attributes("data-label-align")).toBe("end")

      const plain = track(
        mount(Divider, {
          props: {
            classNames: { root: "plain-root", line: "plain-line" },
            styles: { line: { opacity: "0.7" } },
          },
        }),
      )
      expect(plain.classes()).toContain("plain-root")
      expect(plain.get(".miu-divider__line").classes()).toContain("plain-line")
      expect(plain.get(".miu-divider__line").attributes("style")).toContain("opacity: 0.7")
    })

    it("passes SSR renderToString and axe-core checks", async () => {
      const html = await renderToString(
        createSSRApp({
          render: () => [
            h(Divider, { spacing: "sm" }),
            h(Divider, { label: "Section", labelAlign: "center", dashed: true }),
            h(Divider, { orientation: "vertical", decorative: true }),
          ],
        }),
      )
      expect(html).toContain("miu-divider")
      expect(html).toContain("Section")

      const wrapper = track(
        mount(
          {
            components: { Divider },
            template: `
              <div>
                <Divider />
                <Divider label="Middle" label-align="center" />
                <Divider orientation="vertical" decorative />
              </div>
            `,
          },
          { attachTo: document.body },
        ),
      )
      expect(wrapper.exists()).toBe(true)
      await expectNoSeriousViolations("Divider")
    })
  })

  describe("Accordion", () => {
    const items = [
      {
        value: "general",
        title: "General",
        description: "Basic preferences",
        content: "General body",
        icon: "settings" as const,
      },
      {
        value: "security",
        title: "Security",
        content: "Security body",
      },
      {
        value: "locked",
        title: "Locked",
        content: "Locked body",
        disabled: true,
      },
    ]

    it("handles single and multiple modes, collapsible, icons, and events", async () => {
      const single = track(
        mount(Accordion, {
          props: {
            items,
            defaultValue: "general",
            collapsible: true,
            variant: "bordered",
            size: "lg",
            iconSize: "sm",
            radius: "lg",
            density: "compact",
          },
        }),
      )

      expect(single.attributes("data-variant")).toBe("bordered")
      expect(single.attributes("data-miu-size")).toBe("lg")
      expect(single.attributes("data-miu-icon-size")).toBe("sm")
      expect(single.attributes("data-miu-radius")).toBe("lg")
      expect(single.attributes("data-density")).toBe("compact")
      expect(single.find("svg.miu-accordion__icon").exists()).toBe(true)
      expect(single.get(".miu-accordion__description").text()).toBe("Basic preferences")
      expect(single.text()).toContain("General body")
      expect(single.text()).not.toContain("Security body")

      const triggers = single.findAll(".miu-accordion__trigger")
      await triggers[1]!.trigger("click")
      expect(single.emitted("update:modelValue")?.at(-1)).toEqual(["security"])
      expect(single.emitted("change")?.at(-1)).toEqual(["security"])
      expect(single.text()).toContain("Security body")
      expect(single.text()).not.toContain("General body")

      // Collapsible single item closes when clicked again
      await triggers[1]!.trigger("click")
      expect(single.emitted("update:modelValue")?.at(-1)).toEqual([undefined])
      expect(single.text()).not.toContain("Security body")

      // Disabled item cannot be opened
      await triggers[2]!.trigger("click")
      expect(single.text()).not.toContain("Locked body")

      // Multiple mode
      const multi = track(
        mount(Accordion, {
          props: {
            items,
            multiple: true,
            defaultValue: ["general"],
            variant: "separated",
          },
        }),
      )
      const multiTriggers = multi.findAll(".miu-accordion__trigger")
      await multiTriggers[1]!.trigger("click")
      expect(multi.emitted("update:modelValue")?.at(-1)).toEqual([["general", "security"]])
      expect(multi.text()).toContain("General body")
      expect(multi.text()).toContain("Security body")
    })

    it("supports controlled modelValue, disabled root, custom material, slots, and all semantic regions", async () => {
      registerMaterial({
        name: "frost-accordion",
        fallback: "solid",
        generateTokens: () => ({
          "--miu-material-surface": "var(--miu-color-bg-elevated)",
        }),
      })

      const wrapper = track(
        mount(Accordion, {
          props: {
            items,
            modelValue: "general",
            material: "frost-accordion",
            classNames: {
              root: "acc-root",
              item: "acc-item",
              header: "acc-header",
              trigger: "acc-trigger",
              indicator: "acc-indicator",
              content: "acc-content",
            },
            styles: {
              root: { opacity: "0.98" },
              item: { marginBlockEnd: "0" },
              header: { letterSpacing: "0.01em" },
              trigger: { fontWeight: "700" },
              indicator: { opacity: "0.7" },
              content: { opacity: "0.95" },
            },
          },
          slots: {
            trigger: `<template #trigger="{ item, index }"><span class="slot-trg">{{ index }}:{{ item.title }}</span></template>`,
            content: `<template #content="{ item, index }"><p class="slot-cnt">{{ index }}-{{ item.content }}</p></template>`,
          },
        }),
      )

      expect(wrapper.classes()).toContain("acc-root")
      expect(wrapper.attributes("data-material")).toBe("frost-accordion")
      expect(wrapper.attributes("style")).toContain("--miu-material-surface")
      expect(wrapper.attributes("style")).toContain("opacity: 0.98")
      expect(wrapper.get(".miu-accordion__item").classes()).toContain("acc-item")
      expect(wrapper.get(".miu-accordion__header").classes()).toContain("acc-header")
      expect(wrapper.get(".miu-accordion__trigger").classes()).toContain("acc-trigger")
      expect(wrapper.get(".miu-accordion__indicator").classes()).toContain("acc-indicator")
      expect(wrapper.get(".miu-accordion__content").classes()).toContain("acc-content")
      expect(wrapper.get(".slot-trg").text()).toBe("0:General")
      expect(wrapper.get(".slot-cnt").text()).toBe("0-General body")

      const disabledRoot = track(
        mount(Accordion, {
          props: { items, disabled: true, defaultValue: "general" },
        }),
      )
      expect(disabledRoot.attributes("data-disabled")).toBe("true")
      await disabledRoot.findAll(".miu-accordion__trigger")[1]!.trigger("click")
      expect(disabledRoot.emitted("update:modelValue")).toBeUndefined()
    })

    it("supports keyboard arrow navigation and passes SSR + axe-core checks", async () => {
      const wrapper = track(
        mount(Accordion, {
          props: { items, defaultValue: "general" },
          attachTo: document.body,
        }),
      )

      const triggers = wrapper.findAll(".miu-accordion__trigger")
      ;(triggers[0]!.element as HTMLElement).focus()
      await triggers[0]!.trigger("keydown", { key: "ArrowDown" })
      expect(document.activeElement).toBe(triggers[1]!.element)

      await expectNoSeriousViolations("Accordion")

      const html = await renderToString(
        createSSRApp({
          render: () => h(Accordion, { items, defaultValue: "general", variant: "bordered" }),
        }),
      )
      expect(html).toContain("miu-accordion")
      expect(html).toContain("General body")
    })
  })

  describe("Steps", () => {
    const stepItems = [
      { key: "account", title: "Account", description: "Create login" },
      { key: "profile", title: "Profile", description: "Fill details", icon: "user" as const },
      { key: "confirm", title: "Confirm", description: "Review" },
    ]

    it("computes 1-based step statuses, supports explicit status override, and handles clicks", async () => {
      const wrapper = track(
        mount(Steps, {
          props: {
            items: stepItems,
            modelValue: 2,
            size: "lg",
            iconSize: "md",
            radius: "full",
            ariaLabel: "Checkout steps",
          },
        }),
      )

      expect(wrapper.element.tagName.toLowerCase()).toBe("nav")
      expect(wrapper.attributes("aria-label")).toBe("Checkout steps")
      expect(wrapper.attributes("data-miu-size")).toBe("lg")
      expect(wrapper.attributes("data-miu-icon-size")).toBe("md")
      expect(wrapper.attributes("data-miu-radius")).toBe("full")

      const renderedItems = wrapper.findAll(".miu-steps__item")
      expect(renderedItems[0]!.attributes("data-status")).toBe("finish")
      expect(renderedItems[1]!.attributes("data-status")).toBe("process")
      expect(renderedItems[2]!.attributes("data-status")).toBe("wait")

      // Step 2 has custom icon, Step 1 shows finish check icon, Step 3 shows number 3
      expect(renderedItems[0]!.find(".miu-steps__indicator svg").exists()).toBe(true)
      expect(renderedItems[1]!.find(".miu-steps__indicator svg").exists()).toBe(true)
      expect(renderedItems[2]!.get(".miu-steps__indicator").text()).toBe("3")

      const triggers = wrapper.findAll(".miu-steps__trigger")
      await triggers[2]!.trigger("mousedown", { button: 0 })
      expect(wrapper.emitted("update:modelValue")).toEqual([[3]])
      expect(wrapper.emitted("change")).toEqual([[3]])

      const errorSteps = track(
        mount(Steps, {
          props: {
            modelValue: 2,
            items: [
              { title: "One" },
              { title: "Two", status: "error" },
              { title: "Three", disabled: true },
            ],
          },
        }),
      )
      const errorItems = errorSteps.findAll(".miu-steps__item")
      expect(errorItems[1]!.attributes("data-status")).toBe("error")
      expect(errorItems[1]!.find(".miu-steps__indicator svg").exists()).toBe(true)
      await errorSteps.findAll(".miu-steps__trigger")[2]!.trigger("mousedown", { button: 0 })
      expect(errorSteps.emitted("update:modelValue")).toBeUndefined()
    })

    it("respects linear, clickable=false, disabled, and unsupported size fallback", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
      const linearSteps = track(
        mount(Steps, {
          props: {
            items: stepItems,
            linear: true,
            size: "xl" as unknown as "md",
          },
        }),
      )
      expect(linearSteps.attributes("data-miu-size")).toBe("md")
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("[μui] Steps: unsupported size"))

      // Default 1-based step is 1; linear allows step 2 but blocks step 3
      const triggers = linearSteps.findAll(".miu-steps__trigger")
      await triggers[2]!.trigger("mousedown", { button: 0 })
      expect(linearSteps.emitted("update:modelValue")).toBeUndefined()

      await triggers[1]!.trigger("mousedown", { button: 0 })
      expect(linearSteps.emitted("update:modelValue")).toEqual([[2]])

      const nonClickable = track(
        mount(Steps, {
          props: { items: stepItems, clickable: false },
        }),
      )
      expect(nonClickable.attributes("data-clickable")).toBe("false")
      await nonClickable.findAll(".miu-steps__trigger")[1]!.trigger("mousedown", { button: 0 })
      expect(nonClickable.emitted("update:modelValue")).toBeUndefined()

      const disabledSteps = track(
        mount(Steps, {
          props: { items: stepItems, disabled: true },
        }),
      )
      expect(disabledSteps.attributes("data-disabled")).toBe("true")
      await disabledSteps.findAll(".miu-steps__trigger")[1]!.trigger("mousedown", { button: 0 })
      expect(disabledSteps.emitted("update:modelValue")).toBeUndefined()
    })

    it("binds all 8 semantic regions and scoped slots", () => {
      const wrapper = track(
        mount(Steps, {
          props: {
            items: stepItems,
            modelValue: 2,
            orientation: "vertical",
            classNames: {
              root: "st-root",
              item: "st-item",
              trigger: "st-trigger",
              indicator: "st-indicator",
              content: "st-content",
              title: "st-title",
              description: "st-description",
              separator: "st-separator",
            },
            styles: {
              root: { opacity: "0.9" },
              item: { gap: "0.5rem" },
              trigger: { opacity: "0.95" },
              indicator: { borderWidth: "2px" },
              content: { minWidth: "0" },
              title: { fontWeight: "700" },
              description: { opacity: "0.8" },
              separator: { opacity: "0.6" },
            },
          },
          slots: {
            indicator: `<template #indicator="{ index, status }"><span class="slot-ind">{{ index }}-{{ status }}</span></template>`,
            title: `<template #title="{ item, status }"><span class="slot-ttl">{{ item.title }}({{ status }})</span></template>`,
            description: `<template #description="{ item }"><span class="slot-dsc">{{ item.description }}!</span></template>`,
          },
        }),
      )

      expect(wrapper.attributes("data-orientation")).toBe("vertical")
      expect(wrapper.classes()).toContain("st-root")
      expect(wrapper.get(".miu-steps__item").classes()).toContain("st-item")
      expect(wrapper.get(".miu-steps__trigger").classes()).toContain("st-trigger")
      expect(wrapper.get(".miu-steps__indicator").classes()).toContain("st-indicator")
      expect(wrapper.get(".miu-steps__content").classes()).toContain("st-content")
      expect(wrapper.get(".miu-steps__title").classes()).toContain("st-title")
      expect(wrapper.get(".miu-steps__description").classes()).toContain("st-description")
      expect(wrapper.get(".miu-steps__separator").classes()).toContain("st-separator")

      expect(wrapper.get(".miu-steps__indicator").attributes("style")).toContain(
        "border-width: 2px",
      )
      expect(wrapper.get(".miu-steps__separator").attributes("style")).toContain("opacity: 0.6")

      expect(wrapper.get(".slot-ind").text()).toBe("0-finish")
      expect(wrapper.get(".slot-ttl").text()).toBe("Account(finish)")
      expect(wrapper.get(".slot-dsc").text()).toBe("Create login!")
    })

    it("supports keyboard navigation and passes SSR + axe-core checks", async () => {
      const wrapper = track(
        mount(Steps, {
          props: { items: stepItems, modelValue: 1, ariaLabel: "Progress" },
          attachTo: document.body,
        }),
      )

      const triggers = wrapper.findAll(".miu-steps__trigger")
      ;(triggers[0]!.element as HTMLElement).focus()
      await triggers[0]!.trigger("keydown", { key: "ArrowRight" })
      expect(document.activeElement).toBe(triggers[1]!.element)

      await triggers[1]!.trigger("keydown", { key: "Enter" })
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([2])

      await expectNoSeriousViolations("Steps horizontal")

      const vertical = track(
        mount(Steps, {
          props: {
            items: [{ title: "First" }, { title: "Second" }],
            orientation: "vertical",
            modelValue: 1,
          },
          attachTo: document.body,
        }),
      )
      expect(vertical.exists()).toBe(true)
      await expectNoSeriousViolations("Steps vertical")

      const html = await renderToString(
        createSSRApp({
          render: () => h(Steps, { items: stepItems, modelValue: 2, orientation: "vertical" }),
        }),
      )
      expect(html).toContain("miu-steps")
      expect(html).toContain("Account")
    })
  })
})
