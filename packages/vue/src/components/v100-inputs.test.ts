import { createSSRApp, h } from "vue"
import { renderToString } from "vue/server-renderer"
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils"
import axe from "axe-core"
import { afterEach, describe, expect, it } from "vitest"
import { registerMaterial } from "@xcmm1543/miuui-core"
import Combobox from "./Combobox.vue"
import FormField from "./FormField.vue"
import TagInput from "./TagInput.vue"
import ThemeProvider from "./ThemeProvider.vue"

if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

const mounted: VueWrapper[] = []

function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
  document.body.innerHTML = ""
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
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target.join(" ")),
    }))
  expect(violations, `${label}: ${JSON.stringify(violations, null, 2)}`).toEqual([])
}

const frameworkOptions = [
  { value: "vue", label: "Vue", description: "Progressive framework", group: "Frontend" },
  { value: "nuxt", label: "Nuxt", description: "Vue meta-framework", group: "Frontend" },
  { value: "rust", label: "Rust", description: "Systems language", group: "Systems" },
  { value: "disabled-opt", label: "Legacy", disabled: true, group: "Systems" },
]

describe("Combobox", () => {
  it("supports single selection, search filtering, custom filterFn, groups, and clearable", async () => {
    const wrapper = track(
      mount(Combobox, {
        props: {
          modelValue: "vue",
          options: frameworkOptions,
          clearable: true,
          ariaLabel: "Framework",
          placeholder: "Pick framework",
        },
        attachTo: document.body,
      }),
    )

    await flushPromises()
    const input = wrapper.get("input")
    expect((input.element as HTMLInputElement).value).toBe("Vue")

    // Open via trigger
    await wrapper.get(".miu-combobox__trigger").trigger("click")
    await flushPromises()
    expect(wrapper.emitted("update:open")?.at(-1)).toEqual([true])

    const content = document.body.querySelector(".miu-combobox__content")
    expect(content).not.toBeNull()
    expect(content?.querySelectorAll(".miu-combobox__group-label").length).toBe(2)
    expect(content?.querySelectorAll(".miu-combobox__item").length).toBe(4)

    // Search filters options and emits search
    await input.setValue("framework")
    await flushPromises()
    expect(wrapper.emitted("search")?.at(-1)).toEqual(["framework"])
    expect(content?.querySelectorAll(".miu-combobox__item").length).toBe(2)

    // Clicking an option selects it and closes dropdown
    const itemsAfterSearch = content?.querySelectorAll(".miu-combobox__item")
    ;(itemsAfterSearch?.[1] as HTMLElement | undefined)?.click()
    await flushPromises()
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["nuxt"])
    expect(wrapper.emitted("change")?.at(-1)).toEqual(["nuxt"])

    // Reopen and verify no match shows empty region
    await wrapper.get(".miu-combobox__trigger").trigger("click")
    await flushPromises()
    await input.setValue("zzzz")
    await flushPromises()
    const reopenedContent = document.body.querySelector(".miu-combobox__content")
    expect(reopenedContent?.querySelector(".miu-combobox__empty")).not.toBeNull()

    // Clearable clears modelValue, emits clear, keeps focus on input
    await wrapper.get(".miu-combobox__clear").trigger("click")
    await flushPromises()
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([undefined])
    expect(wrapper.emitted("change")?.at(-1)).toEqual([undefined])
    expect(wrapper.emitted("clear")).toHaveLength(1)
    expect(document.activeElement).toBe(input.element)

    // Custom filterFn
    const customFilter = track(
      mount(Combobox, {
        props: {
          options: [
            { value: "a", label: "Alpha" },
            { value: "b", label: "Beta" },
          ],
          ariaLabel: "Custom filter",
          filterFn: (opt, q) => opt.value === q,
        },
        attachTo: document.body,
      }),
    )
    await customFilter.get(".miu-combobox__trigger").trigger("click")
    await customFilter.get("input").setValue("b")
    await flushPromises()
    const items = document.body.querySelectorAll(".miu-combobox__content .miu-combobox__item")
    expect(items.length).toBe(1)
    expect(items[0]?.textContent).toContain("Beta")
  })

  it("supports keyboard selection and guards IME Enter composition", async () => {
    const wrapper = track(
      mount(Combobox, {
        props: {
          options: [
            { value: "vue", label: "Vue" },
            { value: "vite", label: "Vite" },
          ],
          ariaLabel: "Tool",
        },
        attachTo: document.body,
      }),
    )

    const input = wrapper.get("input")
    await wrapper.get(".miu-combobox__trigger").trigger("click")
    await flushPromises()

    // IME composition Enter must be ignored
    await input.trigger("compositionstart")
    await input.trigger("keydown", { key: "Enter", isComposing: true })
    await flushPromises()
    expect(wrapper.emitted("update:modelValue")).toBeUndefined()

    // Standalone isComposing=true on keydown must also be ignored
    await input.trigger("compositionend")
    await input.trigger("keydown", { key: "Enter", isComposing: true })
    await flushPromises()
    expect(wrapper.emitted("update:modelValue")).toBeUndefined()

    // Navigate and select with keyboard
    await input.trigger("keydown", { key: "ArrowDown" })
    await input.trigger("keydown", { key: "Enter" })
    await flushPromises()
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toBeDefined()
    expect(wrapper.emitted("change")?.length).toBeGreaterThanOrEqual(1)
  })

  it("supports multiple mode, tag removal without stealing focus, and disabled/readonly guards", async () => {
    const wrapper = track(
      mount(Combobox, {
        props: {
          modelValue: ["vue", "nuxt"],
          multiple: true,
          clearable: true,
          options: frameworkOptions,
          ariaLabel: "Frameworks",
        },
        attachTo: document.body,
      }),
    )

    await flushPromises()
    const input = wrapper.get("input")
    ;(input.element as HTMLInputElement).focus()
    expect(document.activeElement).toBe(input.element)
    expect(wrapper.findAll(".miu-combobox__tag")).toHaveLength(2)

    // Remove first tag without stealing focus
    await wrapper.findAll(".miu-combobox__tag-remove")[0]?.trigger("click")
    await flushPromises()
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["nuxt"]])
    expect(wrapper.emitted("change")?.at(-1)).toEqual([["nuxt"]])
    expect(document.activeElement).toBe(input.element)

    // Readonly blocks opening, tag removal, and clear
    await wrapper.setProps({ readonly: true, modelValue: ["vue", "nuxt"] })
    await flushPromises()
    expect(wrapper.find(".miu-combobox__clear").exists()).toBe(false)
    await wrapper.get(".miu-combobox__trigger").trigger("click")
    await flushPromises()
    expect(document.body.querySelector(".miu-combobox__content")).toBeNull()
    await wrapper.findAll(".miu-combobox__tag-remove")[0]?.trigger("click")
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["nuxt"]])

    // Disabled blocks interaction
    await wrapper.setProps({ readonly: false, disabled: true })
    await flushPromises()
    expect(wrapper.get(".miu-combobox").attributes("data-disabled")).toBe("true")
    await wrapper.get(".miu-combobox__trigger").trigger("click")
    await flushPromises()
    expect(document.body.querySelector(".miu-combobox__content")).toBeNull()
  })

  it("integrates with FormField, portals material & iconSize, exposes focus/blur/inputRef, slots, and all 12 semantic regions", async () => {
    registerMaterial({
      name: "v100-cb-mat",
      fallback: "solid",
      generateTokens: () => ({ "--miu-material-surface": "var(--miu-color-bg-elevated)" }),
    })

    const formWrapper = track(
      mount(
        {
          components: { FormField, Combobox },
          data: () => ({ val: "vue" }),
          template: `
            <FormField id="ff-cb" label="Stack" description="Choose stack" error="Required" required readonly density="compact">
              <Combobox v-model="val" :options="[{ value: 'vue', label: 'Vue' }]" />
            </FormField>
          `,
        },
        { attachTo: document.body },
      ),
    )
    await flushPromises()
    const ffInput = formWrapper.get("#ff-cb")
    expect(ffInput.attributes("aria-invalid")).toBe("true")
    expect(ffInput.attributes("aria-required")).toBe("true")
    expect(ffInput.attributes("aria-readonly")).toBe("true")
    expect(ffInput.attributes("aria-describedby")).toBe("ff-cb-description ff-cb-error")
    expect(formWrapper.get(".miu-combobox").attributes("data-miu-size")).toBe("sm")

    const semantic = track(
      mount(Combobox, {
        props: {
          modelValue: ["vue"],
          multiple: true,
          clearable: true,
          open: true,
          material: "v100-cb-mat",
          iconSize: "lg",
          options: [{ value: "vue", label: "Vue" }],
          ariaLabel: "Semantic",
          classNames: {
            root: "cb-root",
            control: "cb-ctrl",
            input: "cb-in",
            tags: "cb-tags",
            tag: "cb-tag",
            clear: "cb-clr",
            trigger: "cb-trg",
            content: "cb-cnt",
            viewport: "cb-vp",
            item: "cb-itm",
            itemIndicator: "cb-ind",
          },
          styles: {
            root: { opacity: "0.99" },
            control: { gap: "var(--miu-space-2)" },
            input: { letterSpacing: "0.02em" },
            tags: { opacity: "0.98" },
            tag: { fontWeight: "600" },
            clear: { opacity: "0.97" },
            trigger: { opacity: "0.96" },
            content: { opacity: "0.95" },
            viewport: { opacity: "0.94" },
            item: { fontWeight: "500" },
            itemIndicator: { opacity: "0.93" },
          },
        },
        slots: {
          tag: ({ option }: { option: { label: string } }) =>
            h("span", { class: "slot-tag" }, option.label),
          option: ({ option, selected }: { option: { label: string }; selected: boolean }) =>
            h("span", { class: "slot-opt" }, `${option.label}:${selected}`),
        },
        attachTo: document.body,
      }),
    )
    await flushPromises()

    expect(semantic.get(".miu-combobox").classes()).toContain("cb-root")
    expect(semantic.get(".miu-combobox").attributes("style")).toContain("opacity: 0.99")
    expect(semantic.get(".miu-combobox__control").classes()).toContain("cb-ctrl")
    expect(semantic.get(".miu-combobox__input").classes()).toContain("cb-in")
    expect(semantic.get(".miu-combobox__tags").classes()).toContain("cb-tags")
    expect(semantic.get(".miu-combobox__tag").classes()).toContain("cb-tag")
    expect(semantic.get(".miu-combobox__clear").classes()).toContain("cb-clr")
    expect(semantic.get(".miu-combobox__trigger").classes()).toContain("cb-trg")
    expect(semantic.get(".slot-tag").text()).toBe("Vue")

    const content = document.body.querySelector(".miu-combobox__content")
    expect(content?.classList.contains("cb-cnt")).toBe(true)
    expect(content?.getAttribute("data-material")).toBe("v100-cb-mat")
    expect(content?.getAttribute("data-miu-icon-size")).toBe("lg")
    expect(content?.getAttribute("style")).toContain("--miu-material-surface")
    expect(content?.querySelector(".miu-combobox__viewport")?.classList.contains("cb-vp")).toBe(
      true,
    )
    expect(content?.querySelector(".miu-combobox__item")?.classList.contains("cb-itm")).toBe(true)
    expect(content?.querySelector(".slot-opt")?.textContent).toBe("Vue:true")

    // Default option slot verifies itemIndicator classNames/styles & empty slot verifies empty classNames/styles
    const emptySemantic = track(
      mount(Combobox, {
        props: {
          options: [{ value: "x", label: "X" }],
          modelValue: "x",
          open: true,
          ariaLabel: "Indicator & empty",
          classNames: { itemIndicator: "cb-ind-2", empty: "cb-emp" },
          styles: { itemIndicator: { opacity: "0.9" }, empty: { opacity: "0.8" } },
        },
        slots: {
          empty: () => h("span", { class: "slot-empty" }, "Nothing"),
        },
        attachTo: document.body,
      }),
    )
    await flushPromises()
    const indEl = document.body.querySelector(".cb-ind-2")
    expect(indEl).not.toBeNull()
    expect(indEl?.getAttribute("style")).toContain("opacity: 0.9")

    await emptySemantic.get("input").setValue("nomatch")
    await flushPromises()
    const empEl = document.body.querySelector(".cb-emp")
    expect(empEl).not.toBeNull()
    expect(empEl?.getAttribute("style")).toContain("opacity: 0.8")
    expect(empEl?.querySelector(".slot-empty")?.textContent).toBe("Nothing")

    // defineExpose
    const vm = emptySemantic.vm as unknown as {
      focus: () => void
      blur: () => void
      inputRef: unknown
    }
    expect(vm.inputRef).toBeTruthy()
    vm.focus()
    expect(document.activeElement).toBe(emptySemantic.get("input").element)
    vm.blur()
    expect(document.activeElement).not.toBe(emptySemantic.get("input").element)
  })
})

describe("TagInput", () => {
  it("adds, splits by delimiter, validates max/duplicate, removes, and clears tags", async () => {
    const wrapper = track(
      mount(TagInput, {
        props: {
          modelValue: ["alpha"],
          max: 3,
          delimiter: ",",
          duplicate: false,
          clearable: true,
          ariaLabel: "Tags",
        },
        attachTo: document.body,
      }),
    )

    const input = wrapper.get("input")

    // Add via Enter
    await input.setValue("beta")
    await input.trigger("keydown", { key: "Enter" })
    await flushPromises()
    expect(wrapper.emitted("add")?.at(-1)).toEqual(["beta"])
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["alpha", "beta"]])
    expect(wrapper.emitted("change")?.at(-1)).toEqual([["alpha", "beta"]])

    // Sync parent modelValue prop and test duplicate rejection
    await wrapper.setProps({ modelValue: ["alpha", "beta"] })
    await input.setValue("alpha")
    await input.trigger("keydown", { key: "Enter" })
    await flushPromises()
    expect(wrapper.emitted("invalid")?.at(-1)).toEqual(["alpha"])
    expect(wrapper.emitted("update:modelValue")).toHaveLength(1)

    // Add via delimiter input
    const inputEl = input.element as HTMLInputElement
    inputEl.value = "gamma,"
    await input.trigger("input", { data: "," })
    await flushPromises()
    expect(wrapper.emitted("add")?.at(-1)).toEqual(["gamma"])
    await wrapper.setProps({ modelValue: ["alpha", "beta", "gamma"] })

    // Max limit reached -> emits invalid
    await input.setValue("delta")
    await input.trigger("keydown", { key: "Enter" })
    await flushPromises()
    expect(wrapper.emitted("invalid")?.at(-1)).toEqual(["delta"])

    // Delete single tag
    await wrapper.findAll(".miu-tag-input__tag-delete")[1]?.trigger("click")
    await flushPromises()
    expect(wrapper.emitted("remove")?.at(-1)).toEqual(["beta"])
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["alpha", "gamma"]])

    // Clear all
    await wrapper.setProps({ modelValue: ["alpha", "gamma"] })
    await wrapper.get(".miu-tag-input__clear").trigger("click")
    await flushPromises()
    expect(wrapper.emitted("clear")).toHaveLength(1)
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[]])
    expect(document.activeElement).toBe(inputEl)

    // Duplicate: true allows repeated tags and focus/blur events fire
    const dupWrapper = track(
      mount(TagInput, {
        props: { modelValue: ["dup"], duplicate: true, ariaLabel: "Dup tags" },
        attachTo: document.body,
      }),
    )
    const dupInput = dupWrapper.get("input")
    await dupInput.trigger("focus")
    expect(dupWrapper.emitted("focus")).toHaveLength(1)
    await dupInput.setValue("dup")
    await dupInput.trigger("keydown", { key: "Enter" })
    await flushPromises()
    expect(dupWrapper.emitted("update:modelValue")?.at(-1)).toEqual([["dup", "dup"]])
    await dupInput.trigger("blur")
    expect(dupWrapper.emitted("blur")).toHaveLength(1)
  })

  it("supports addOnBlur, addOnPaste, IME guard, readonly, and disabled", async () => {
    const wrapper = track(
      mount(TagInput, {
        props: {
          modelValue: ["one"],
          addOnBlur: true,
          addOnPaste: true,
          delimiter: ",",
          ariaLabel: "Blur & paste tags",
        },
        attachTo: document.body,
      }),
    )

    const input = wrapper.get("input")

    // IME composition Enter guard
    await input.setValue("ime")
    await input.trigger("compositionstart")
    await input.trigger("keydown", { key: "Enter", isComposing: true })
    await flushPromises()
    expect(wrapper.emitted("add")).toBeUndefined()
    await input.trigger("compositionend")
    await input.trigger("keydown", { key: "Enter", isComposing: true })
    await flushPromises()
    expect(wrapper.emitted("add")).toBeUndefined()

    // addOnBlur
    await input.trigger("blur")
    await flushPromises()
    expect(wrapper.emitted("add")?.at(-1)).toEqual(["ime"])

    // addOnPaste
    const pasteEvent = new Event("paste", { bubbles: true, cancelable: true }) as ClipboardEvent
    Object.defineProperty(pasteEvent, "clipboardData", {
      value: { getData: () => "two,three" },
    })
    input.element.dispatchEvent(pasteEvent)
    await flushPromises()
    expect(wrapper.emitted("add")?.map((e) => e[0])).toContain("two")
    expect(wrapper.emitted("add")?.map((e) => e[0])).toContain("three")

    // Readonly blocks Enter, delete, clear
    const ro = track(
      mount(TagInput, {
        props: {
          modelValue: ["locked"],
          readonly: true,
          clearable: true,
          ariaLabel: "Readonly tags",
        },
        attachTo: document.body,
      }),
    )
    expect(ro.find(".miu-tag-input__clear").exists()).toBe(false)
    await ro.get("input").setValue("new")
    await ro.get("input").trigger("keydown", { key: "Enter" })
    await ro.get(".miu-tag-input__tag-delete").trigger("click")
    expect(ro.emitted("update:modelValue")).toBeUndefined()

    // Disabled blocks interaction
    const dis = track(
      mount(TagInput, {
        props: {
          modelValue: ["disabled"],
          disabled: true,
          ariaLabel: "Disabled tags",
        },
        attachTo: document.body,
      }),
    )
    expect(dis.get(".miu-tag-input").attributes("data-disabled")).toBe("true")
    expect(dis.get("input").attributes("disabled")).toBeDefined()
  })

  it("integrates with FormField, exposes focus/blur/inputRef, #tag slot, and all 6 semantic regions", async () => {
    const formWrapper = track(
      mount(
        {
          components: { FormField, TagInput },
          data: () => ({ tags: ["vue"] }),
          template: `
            <FormField id="ff-tags" label="Keywords" description="Add tags" error="Too few" required readonly density="compact">
              <TagInput v-model="tags" />
            </FormField>
          `,
        },
        { attachTo: document.body },
      ),
    )
    await flushPromises()
    const ffInput = formWrapper.get("#ff-tags")
    expect(ffInput.attributes("aria-invalid")).toBe("true")
    expect(ffInput.attributes("aria-required")).toBe("true")
    expect(ffInput.attributes("aria-readonly")).toBe("true")
    expect(ffInput.attributes("aria-describedby")).toBe("ff-tags-description ff-tags-error")
    expect(formWrapper.get(".miu-tag-input").attributes("data-miu-size")).toBe("sm")

    const semantic = track(
      mount(TagInput, {
        props: {
          modelValue: ["a", "b"],
          clearable: true,
          material: "glass",
          ariaLabel: "Semantic tags",
          classNames: {
            root: "ti-root",
            tag: "ti-tag",
            tagText: "ti-txt",
            tagDelete: "ti-del",
            input: "ti-in",
            clear: "ti-clr",
          },
          styles: {
            root: { opacity: "0.99" },
            tag: { opacity: "0.98" },
            tagText: { fontWeight: "600" },
            tagDelete: { opacity: "0.97" },
            input: { letterSpacing: "0.02em" },
            clear: { opacity: "0.96" },
          },
        },
        attachTo: document.body,
      }),
    )
    expect(semantic.get(".miu-tag-input").classes()).toContain("ti-root")
    expect(semantic.get(".miu-tag-input").attributes("data-material")).toBe("glass")
    expect(semantic.get(".miu-tag-input").attributes("style")).toContain("opacity: 0.99")
    expect(semantic.get(".miu-tag-input__tag").classes()).toContain("ti-tag")
    expect(semantic.get(".miu-tag-input__tag-text").classes()).toContain("ti-txt")
    expect(semantic.get(".miu-tag-input__tag-delete").classes()).toContain("ti-del")
    expect(semantic.get(".miu-tag-input__input").classes()).toContain("ti-in")
    expect(semantic.get(".miu-tag-input__clear").classes()).toContain("ti-clr")

    const vm = semantic.vm as unknown as {
      focus: () => void
      blur: () => void
      inputRef: unknown
    }
    expect(vm.inputRef).toBeTruthy()
    vm.focus()
    expect(document.activeElement).toBe(semantic.get("input").element)
    vm.blur()
    expect(document.activeElement).not.toBe(semantic.get("input").element)

    // Custom #tag slot
    const customTag = track(
      mount(TagInput, {
        props: { modelValue: ["x", "y"], ariaLabel: "Custom slot" },
        slots: {
          tag: ({ value, index, remove }: { value: string; index: number; remove: () => void }) =>
            h(
              "button",
              { type: "button", class: "custom-tag-btn", onClick: remove },
              `${index}:${value}`,
            ),
        },
        attachTo: document.body,
      }),
    )
    const customBtns = customTag.findAll(".custom-tag-btn")
    expect(customBtns[0]?.text()).toBe("0:x")
    await customBtns[0]?.trigger("click")
    expect(customTag.emitted("update:modelValue")?.at(-1)).toEqual([["y"]])
    expect(customTag.emitted("remove")?.at(-1)).toEqual(["x"])
  })
})

describe("SSR and Accessibility", () => {
  it("renders Combobox and TagInput via renderToString without DOM crashes", async () => {
    const app = createSSRApp({
      render: () =>
        h(ThemeProvider, { theme: "dark", material: "mica" }, () => [
          h(Combobox, {
            modelValue: "vue",
            options: frameworkOptions,
            clearable: true,
            ariaLabel: "SSR Combobox",
          }),
          h(Combobox, {
            modelValue: ["vue", "nuxt"],
            multiple: true,
            options: frameworkOptions,
            ariaLabel: "SSR Multi Combobox",
          }),
          h(TagInput, {
            modelValue: ["vue", "vite"],
            clearable: true,
            ariaLabel: "SSR TagInput",
          }),
        ]),
    })
    const html = await renderToString(app)
    expect(html).toContain("miu-combobox")
    expect(html).toContain("miu-tag-input")
    expect(html).toContain("vite")
  })

  it("passes axe-core a11y checks for Combobox and TagInput inside FormField", async () => {
    track(
      mount(
        {
          components: { FormField, Combobox, TagInput },
          data: () => ({
            single: "vue",
            multi: ["vue"],
            tags: ["typescript", "vue"],
            options: [
              { value: "vue", label: "Vue" },
              { value: "nuxt", label: "Nuxt" },
            ],
          }),
          template: `
            <div>
              <FormField id="a11y-cb-single" label="Single framework" description="Pick one">
                <Combobox v-model="single" :options="options" clearable />
              </FormField>
              <FormField id="a11y-cb-multi" label="Multi framework" error="Pick at least one" required>
                <Combobox v-model="multi" :options="options" multiple />
              </FormField>
              <FormField id="a11y-ti" label="Project tags" description="Press Enter to add">
                <TagInput v-model="tags" clearable />
              </FormField>
            </div>
          `,
        },
        { attachTo: document.body },
      ),
    )

    await expectNoSeriousViolations("Combobox + TagInput FormField")
  })
})
