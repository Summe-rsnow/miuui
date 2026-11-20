import { h } from "vue"
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils"
import axe from "axe-core"
import { afterEach, describe, expect, it } from "vitest"
import { registerMaterial } from "@xcmm1543/miuui-core"
import type { IconDefinition } from "@xcmm1543/miuui-icons"
import CategoryFilter from "./CategoryFilter.vue"
import Checkbox from "./Checkbox.vue"
import ColorPicker from "./ColorPicker.vue"
import FormField from "./FormField.vue"
import FormRow from "./FormRow.vue"
import Input from "./Input.vue"
import MessageComposer from "./MessageComposer.vue"
import NumberInput from "./NumberInput.vue"
import Pill from "./Pill.vue"
import PillGroup from "./PillGroup.vue"
import RadioGroup from "./RadioGroup.vue"
import SegmentedControl from "./SegmentedControl.vue"
import Select from "./Select.vue"
import Slider from "./Slider.vue"
import Switch from "./Switch.vue"
import Tabs from "./Tabs.vue"
import Textarea from "./Textarea.vue"
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

const customDiamondIcon: IconDefinition = {
  name: "v07-diamond",
  viewBox: "0 0 24 24",
  content: '<path d="M12 2L22 12L12 22L2 12Z"/>',
}

describe("v0.7.0 FormField integration, readonly, invalid & slots", () => {
  it("propagates id, labelId, combined describedBy, invalid, required, disabled, readonly, and slots across form controls", async () => {
    const wrapper = track(
      mount(
        {
          components: {
            FormField,
            Input,
            Textarea,
            Select,
            Checkbox,
            RadioGroup,
            Switch,
            NumberInput,
            Slider,
            ColorPicker,
            MessageComposer,
          },
          data: () => ({
            text: "abc",
            bio: "notes",
            choice: "vue",
            checked: false,
            radio: "a",
            enabled: false,
            num: 3,
            slide: 20,
            color: "#9A49E0",
            msg: "hi",
          }),
          template: `
            <div>
              <FormField id="ff-select" description="Pick one" error="Selection required" required readonly>
                <template #label><span class="custom-ff-label">Framework</span></template>
                <Select v-model="choice" :options="[{ value: 'vue', label: 'Vue' }]" />
              </FormField>
              <FormField id="ff-switch" label="Alerts" error="Must enable" required readonly>
                <Switch v-model="enabled" />
              </FormField>
              <FormField id="ff-radio" label="Mode" error="Pick mode" readonly>
                <RadioGroup v-model="radio" :options="['a', 'b']" />
              </FormField>
              <FormField id="ff-num" label="Count" error="Invalid" required readonly>
                <NumberInput v-model="num" />
              </FormField>
              <FormField id="ff-slider" label="Level" description="0-100" error="Too high" required readonly>
                <Slider v-model="slide" />
              </FormField>
              <FormField id="ff-color" label="Accent" error="Bad hex" required readonly>
                <ColorPicker v-model="color" />
              </FormField>
              <FormField id="ff-msg" label="Reply" disabled>
                <MessageComposer v-model="msg" show-cancel />
              </FormField>
              <FormField id="ff-hint" label="Hint field">
                <template #description>Custom desc</template>
                <template #hint>Custom hint</template>
                <Input v-model="text" />
              </FormField>
            </div>
          `,
        },
        { attachTo: document.body },
      ),
    )

    await flushPromises()

    expect(wrapper.get(".custom-ff-label").text()).toBe("Framework")

    const selectTrigger = wrapper.get("#ff-select")
    expect(selectTrigger.attributes("aria-invalid")).toBe("true")
    expect(selectTrigger.attributes("aria-required")).toBe("true")
    expect(selectTrigger.attributes("aria-readonly")).toBe("true")
    expect(selectTrigger.attributes("aria-describedby")).toBe(
      "ff-select-description ff-select-error",
    )
    expect(wrapper.get(".miu-select").classes()).toContain("miu-select--invalid")

    const sw = wrapper.get("#ff-switch")
    expect(sw.attributes("aria-invalid")).toBe("true")
    expect(sw.attributes("aria-required")).toBe("true")
    expect(sw.attributes("aria-readonly")).toBe("true")
    expect(wrapper.get(".miu-switch").classes()).toContain("miu-switch--invalid")

    const rg = wrapper.get('[role="radiogroup"]')
    expect(rg.attributes("aria-labelledby")).toBe("ff-radio-label")
    expect(rg.attributes("aria-invalid")).toBe("true")
    expect(rg.attributes("aria-readonly")).toBe("true")

    const numInput = wrapper.get("#ff-num")
    expect(numInput.attributes("aria-required")).toBe("true")
    expect(numInput.attributes("aria-readonly")).toBe("true")
    expect(numInput.attributes("aria-invalid")).toBe("true")

    const sliderThumb = wrapper.get("#ff-slider")
    expect(sliderThumb.attributes("aria-invalid")).toBe("true")
    expect(sliderThumb.attributes("aria-required")).toBe("true")
    expect(sliderThumb.attributes("aria-readonly")).toBe("true")
    expect(sliderThumb.attributes("aria-describedby")).toBe("ff-slider-description ff-slider-error")

    const colorHex = wrapper.get("#ff-color")
    expect(colorHex.attributes("aria-invalid")).toBe("true")
    expect(colorHex.attributes("aria-required")).toBe("true")
    expect(colorHex.attributes("aria-readonly")).toBe("true")

    const composerButtons = wrapper.findAll(".miu-message-composer__actions button")
    expect(composerButtons[0]?.attributes("disabled")).toBeDefined()
    expect(composerButtons[1]?.attributes("disabled")).toBeDefined()

    const hintInput = wrapper.get("#ff-hint")
    expect(hintInput.attributes("aria-describedby")).toBe("ff-hint-description ff-hint-hint")

    const results = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
    })
    expect(
      results.violations.filter((v) => v.impact === "serious" || v.impact === "critical"),
    ).toEqual([])
  })

  it("propagates compact FormField sizeHint to ColorPicker and CategoryFilter", () => {
    const wrapper = track(
      mount({
        components: { FormField, ColorPicker, CategoryFilter },
        template: `
          <FormField density="compact" label="Compact">
            <ColorPicker />
            <CategoryFilter :groups="[{ key: 'g', label: 'Group', subtags: [] }]" />
          </FormField>
        `,
      }),
    )
    expect(wrapper.get(".miu-color-picker").attributes("data-miu-size")).toBe("sm")
    expect(wrapper.get(".miu-category-filter").attributes("data-miu-size")).toBe("sm")
    expect(wrapper.get(".miu-tabs").attributes("data-miu-size")).toBe("sm")
  })
})

describe("v0.7.0 events, clearable, readonly & defineExpose", () => {
  it("emits change, focus, blur and guards IME enter on Input", async () => {
    const input = track(
      mount(Input, {
        props: {
          modelValue: "hello",
          clearable: true,
          passwordToggle: true,
          showCount: true,
          classNames: { prefix: "p-cls", toggle: "t-cls", count: "c-cls" },
          styles: {
            prefix: { color: "red" },
            toggle: { opacity: "0.8" },
            count: { fontWeight: "700" },
          },
        },
        slots: { prefix: "@" },
        attachTo: document.body,
      }),
    )

    expect(input.get(".miu-input__prefix").classes()).toContain("p-cls")
    expect(input.get(".miu-input__prefix").attributes("style")).toContain("color: red")
    expect(input.get(".miu-input__count").classes()).toContain("c-cls")
    expect(input.get(".miu-input__count").attributes("style")).toContain("font-weight: 700")

    const native = input.get("input")
    await native.trigger("compositionstart")
    await native.trigger("keydown", { key: "Enter", isComposing: true })
    expect(input.emitted("enter")).toBeUndefined()
    await native.trigger("compositionend")
    await native.trigger("keydown.enter")
    expect(input.emitted("enter")).toHaveLength(1)

    await native.setValue("world")
    expect(input.emitted("update:modelValue")?.at(-1)).toEqual(["world"])
    expect(input.emitted("change")?.at(-1)).toEqual(["world"])

    await native.trigger("focus")
    expect(input.emitted("focus")).toHaveLength(1)
    await native.trigger("blur")
    expect(input.emitted("blur")).toHaveLength(1)

    const vm = input.vm as unknown as { focus: () => void; blur: () => void }
    vm.focus()
    expect(document.activeElement).toBe(native.element)
    vm.blur()
    expect(document.activeElement).not.toBe(native.element)

    await input.get(".miu-input__clear").trigger("click")
    expect(input.emitted("clear")).toHaveLength(1)
    expect(input.emitted("change")?.at(-1)).toEqual([""])
    expect(document.activeElement).toBe(native.element)
  })

  it("supports Textarea clearable, count region, readonly resizer hiding, and expose", async () => {
    const ta = track(
      mount(Textarea, {
        props: {
          modelValue: "draft",
          clearable: true,
          showCount: true,
          classNames: { count: "ta-cnt", clear: "ta-clr" },
          styles: { count: { letterSpacing: "1px" } },
        },
        attachTo: document.body,
      }),
    )

    expect(ta.get(".miu-textarea__count").classes()).toContain("ta-cnt")
    expect(ta.get(".miu-textarea__count").text()).toBe("5")
    expect(ta.find(".miu-textarea__resizer").exists()).toBe(true)

    await ta.get(".miu-textarea__clear").trigger("click")
    expect(ta.emitted("update:modelValue")?.[0]).toEqual([""])
    expect(ta.emitted("change")?.[0]).toEqual([""])
    expect(ta.emitted("clear")).toHaveLength(1)
    expect(document.activeElement).toBe(ta.get("textarea").element)

    await ta.setProps({ readonly: true, modelValue: "locked" })
    expect(ta.find(".miu-textarea__resizer").exists()).toBe(false)
    expect(ta.find(".miu-textarea__clear").exists()).toBe(false)

    const vm = ta.vm as unknown as { focus: () => void; blur: () => void }
    vm.focus()
    expect(document.activeElement).toBe(ta.get("textarea").element)
    vm.blur()
    expect(document.activeElement).not.toBe(ta.get("textarea").element)
  })

  it("supports Select clearable, loading, readonly, slots, and focus/blur", async () => {
    const sel = track(
      mount(Select, {
        props: {
          modelValue: "a",
          options: [
            { value: "a", label: "Alpha" },
            { value: "b", label: "Beta" },
          ],
          clearable: true,
          ariaLabel: "Pick",
          classNames: { clear: "sel-clr" },
        },
        slots: {
          trigger: ({ selectedOption }: { selectedOption?: { label: string } }) =>
            h("span", { class: "custom-trig" }, selectedOption?.label ?? "None"),
        },
        attachTo: document.body,
      }),
    )

    expect(sel.get(".custom-trig").text()).toBe("Alpha")
    await sel.get(".miu-select__clear").trigger("click")
    expect(sel.emitted("update:modelValue")?.[0]).toEqual([undefined])
    expect(sel.emitted("change")?.[0]).toEqual([undefined])
    expect(sel.emitted("clear")).toHaveLength(1)
    expect(document.activeElement).toBe(sel.get(".miu-select__trigger").element)

    await sel.setProps({ loading: true })
    expect(sel.get(".miu-select").attributes("data-loading")).toBe("true")
    expect(sel.find(".miu-spinner").exists()).toBe(true)
    expect(sel.find(".miu-select__clear").exists()).toBe(false)

    await sel.setProps({ loading: false, readonly: true, modelValue: "b" })
    await sel.get(".miu-select__trigger").trigger("click")
    await flushPromises()
    expect(document.querySelector(".miu-select__content")).toBeNull()

    const customItemSel = track(
      mount(Select, {
        props: {
          modelValue: "a",
          iconSize: "lg",
          options: [{ value: "a", label: "Alpha" }],
          ariaLabel: "Custom item",
        },
        slots: {
          item: ({ option, selected }: { option: { label: string }; selected: boolean }) =>
            h("span", { class: "custom-opt" }, `${option.label}:${selected}`),
        },
        attachTo: document.body,
      }),
    )
    await customItemSel.get(".miu-select__trigger").trigger("keydown", { key: "Enter" })
    await flushPromises()
    const content = document.body.querySelector(".miu-select__content")
    expect(content?.getAttribute("data-miu-icon-size")).toBe("lg")
    expect(content?.querySelector(".custom-opt")?.textContent).toBe("Alpha:true")

    const emptySel = track(
      mount(Select, {
        props: { options: [], ariaLabel: "Empty" },
        slots: { empty: "No items here" },
        attachTo: document.body,
      }),
    )
    const vm = emptySel.vm as unknown as { focus: () => void; blur: () => void }
    vm.focus()
    expect(document.activeElement).toBe(emptySel.get(".miu-select__trigger").element)
    vm.blur()
    expect(document.activeElement).not.toBe(emptySel.get(".miu-select__trigger").element)
  })

  it("blocks mutations in readonly mode on Checkbox, Switch, RadioGroup, Slider, and ColorPicker", async () => {
    const chk = track(
      mount(Checkbox, {
        props: { modelValue: false, readonly: true, label: "Chk" },
        attachTo: document.body,
      }),
    )
    await chk.get('[role="checkbox"]').trigger("click")
    await chk.get('[role="checkbox"]').trigger("keydown", { key: " " })
    expect(chk.emitted("update:modelValue")).toBeUndefined()
    const chkVm = chk.vm as unknown as { focus: () => void; blur: () => void }
    chkVm.focus()
    expect(document.activeElement).toBe(chk.get('[role="checkbox"]').element)
    chkVm.blur()

    const sw = track(
      mount(Switch, {
        props: { modelValue: false, readonly: true, label: "Sw" },
        attachTo: document.body,
      }),
    )
    await sw.get('[role="switch"]').trigger("click")
    await sw.get('[role="switch"]').trigger("keydown", { key: "Enter" })
    expect(sw.emitted("update:modelValue")).toBeUndefined()

    const rg = track(
      mount(RadioGroup, {
        props: { modelValue: "a", readonly: true, options: ["a", "b"], ariaLabel: "RG" },
        attachTo: document.body,
      }),
    )
    await rg.findAll(".miu-radio-group__item")[1]?.trigger("click")
    expect(rg.emitted("update:modelValue")).toBeUndefined()

    const slider = track(
      mount(Slider, {
        props: { modelValue: 30, readonly: true, ariaLabel: "Vol" },
        attachTo: document.body,
      }),
    )
    await slider.get('[role="slider"]').trigger("keydown", { key: "ArrowRight" })
    expect(slider.emitted("update:modelValue")).toBeUndefined()

    const cp = track(
      mount(ColorPicker, {
        props: { modelValue: "#9A49E0", readonly: true, presets: [] },
        attachTo: document.body,
      }),
    )
    expect(cp.find(".miu-color-picker__presets").exists()).toBe(false)
    const hex = cp.get(".miu-color-picker__input")
    await hex.setValue("#10B981")
    expect(cp.emitted("update:modelValue")).toBeUndefined()
    await cp.setProps({ modelValue: "" })
    expect((hex.element as HTMLInputElement).value).toBe("")
  })
})

describe("v0.7.0 selection components & edge cases", () => {
  it("prevents FormRow clickable bubble from nested interactive controls and honors density='compact'", async () => {
    const row = track(
      mount(FormRow, {
        props: { label: "Setting", density: "compact", clickable: true },
        slots: { default: '<button type="button" class="inner-btn">Toggle</button>' },
      }),
    )
    expect(row.attributes("data-density")).toBe("compact")
    await row.get(".inner-btn").trigger("click")
    expect(row.emitted("click")).toBeUndefined()
    await row.trigger("click")
    expect(row.emitted("click")).toHaveLength(1)
  })

  it("keeps MessageComposer Cancel enabled during loading, honors density='compact', and exposes focus/tools", async () => {
    const composer = track(
      mount(MessageComposer, {
        props: {
          modelValue: "hello",
          density: "compact",
          loading: true,
          showCancel: true,
          classNames: { tools: "mc-tools" },
        },
        slots: { tools: '<span class="tool">T</span>' },
        attachTo: document.body,
      }),
    )
    expect(composer.attributes("data-density")).toBe("compact")

    expect(composer.get(".miu-message-composer__tools").classes()).toContain("mc-tools")
    const buttons = composer.findAll(".miu-message-composer__actions button")
    expect(buttons[0]?.attributes("disabled")).toBeUndefined()
    expect(buttons[1]?.attributes("disabled")).toBeDefined()
    await buttons[0]?.trigger("click")
    expect(composer.emitted("cancel")).toHaveLength(1)

    const vm = composer.vm as unknown as { focus: () => void; blur: () => void }
    vm.focus()
    expect(document.activeElement).toBe(composer.get("textarea").element)
    vm.blur()
    expect(document.activeElement).not.toBe(composer.get("textarea").element)
  })

  it("prevents Tabs double-emit, supports disabled root & skeleton aria-busy, and SegmentedControl clearable + radius='full'", async () => {
    const tabs = track(
      mount(Tabs, {
        props: {
          modelValue: "one",
          items: [
            { value: "one", label: "One" },
            { value: "two", label: "Two" },
          ],
          ariaLabel: "Tabs",
        },
      }),
    )
    const triggers = tabs.findAll(".miu-tabs__trigger")
    await triggers[1]?.trigger("mousedown", { button: 0 })
    await triggers[1]?.trigger("click")
    expect(tabs.emitted("update:modelValue")).toHaveLength(1)
    expect(tabs.emitted("change")).toHaveLength(1)

    await tabs.setProps({ disabled: true })
    await triggers[0]?.trigger("click")
    expect(tabs.emitted("change")).toHaveLength(1)

    await tabs.setProps({ loading: true, styles: { trigger: { opacity: "0.7" } } })
    expect(tabs.get(".miu-tabs__skeleton").attributes("aria-busy")).toBe("true")
    expect(tabs.get(".miu-tabs__skeleton-item").attributes("style")).toContain("opacity: 0.7")

    const seg = track(
      mount(SegmentedControl, {
        props: {
          modelValue: "a",
          radius: "full",
          clearable: true,
          options: [
            { value: "a", label: "A" },
            { value: "b", label: "B" },
          ],
          ariaLabel: "Seg",
        },
      }),
    )
    expect(seg.attributes("data-miu-radius")).toBe("full")

    await seg.findAll(".miu-segmented__item")[0]?.trigger("click")
    expect(seg.emitted("update:modelValue")?.[0]).toEqual([""])
    expect(seg.emitted("change")?.[0]).toEqual([""])
    expect(seg.emitted("clear")).toHaveLength(1)
  })

  it("supports Pill material resolution & IconProp, PillGroup i18n/clearable, and CategoryFilter showDefault=false + clearable", async () => {
    registerMaterial({
      name: "v07-pill-mat",
      fallback: "solid",
      generateTokens: () => ({ "--miu-material-surface": "rgb(10 20 30)" }),
    })

    const pill = track(
      mount(Pill, {
        props: {
          label: "Custom",
          icon: customDiamondIcon,
          material: "v07-pill-mat",
        },
      }),
    )
    expect(pill.attributes("data-material")).toBe("v07-pill-mat")
    expect(pill.attributes("style")).toContain("--miu-material-surface: rgb(10 20 30)")
    expect(pill.find("svg path").attributes("d")).toBe("M12 2L22 12L12 22L2 12Z")

    const pg = track(
      mount({
        components: { ThemeProvider, PillGroup },
        template: `
          <ThemeProvider locale="en-US">
            <PillGroup
              model-value="rock"
              show-all-option
              clearable
              icon-size="md"
              :options="[{ value: 'rock', label: 'Rock', icon: 'sparkles' }]"
            />
          </ThemeProvider>
        `,
      }),
    )
    const buttons = pg.findAll(".miu-pill__main")
    expect(buttons[0]?.text()).toBe("All")
    const groupComp = pg.findComponent(PillGroup)
    await buttons[1]?.trigger("click")
    expect(groupComp.emitted("update:modelValue")?.[0]).toEqual([undefined])
    expect(groupComp.emitted("clear")).toHaveLength(1)

    const cf = track(
      mount(CategoryFilter, {
        props: {
          showDefault: false,
          clearable: true,
          groups: [
            {
              key: "genre",
              label: "Genre",
              subtags: [{ key: "pop", label: "Pop" }],
            },
          ],
          classNames: { actions: "cf-actions" },
        },
        slots: { actions: '<button type="button">Reset</button>' },
      }),
    )

    expect(cf.get(".miu-category-filter__actions").classes()).toContain("cf-actions")
    expect(cf.findAll(".miu-pill__main")).toHaveLength(1)
    await cf.setProps({ modelValue: "pop" })
    await cf.get(".miu-pill__main").trigger("click")
    expect(cf.emitted("update:modelValue")?.at(-1)).toEqual([""])
    expect(cf.emitted("clear")).toHaveLength(1)

    await cf.setProps({ disabled: true })
    expect(cf.get(".miu-category-filter").attributes("data-disabled")).toBe("true")
  })

  it("supports RadioGroup button indicator region and NumberInput/Slider/Tabs/SegmentedControl focus/blur + change", async () => {
    const rg = track(
      mount(RadioGroup, {
        props: {
          modelValue: "a",
          variant: "button",
          options: ["a", "b"],
          ariaLabel: "Button radio",
          classNames: { indicator: "rg-ind" },
          styles: { indicator: { opacity: "0.9" } },
        },
        attachTo: document.body,
      }),
    )
    const rgItems = rg.findAll(".miu-radio-group__item")
    for (const [idx, item] of rgItems.entries()) {
      const el = item.element as HTMLElement
      Object.defineProperty(el, "offsetWidth", { configurable: true, value: 40 })
      Object.defineProperty(el, "offsetHeight", { configurable: true, value: 28 })
      Object.defineProperty(el, "offsetLeft", { configurable: true, value: idx * 44 + 4 })
      Object.defineProperty(el, "offsetTop", { configurable: true, value: 4 })
    }
    await rg.setProps({ modelValue: "b" })
    await flushPromises()
    expect(rg.get(".miu-radio-group__sliding-indicator").classes()).toContain("rg-ind")
    expect(rg.get(".miu-radio-group__sliding-indicator").attributes("style")).toContain(
      "opacity: 0.9",
    )

    const num = track(
      mount(NumberInput, {
        props: { modelValue: 5, iconSize: "sm", ariaLabel: "Num" },
        attachTo: document.body,
      }),
    )
    const numVm = num.vm as unknown as { focus: () => void; blur: () => void }
    numVm.focus()
    expect(document.activeElement).toBe(num.get("input").element)
    numVm.blur()
    expect(document.activeElement).not.toBe(num.get("input").element)
    await num.get("input").trigger("keydown", { key: "ArrowUp" })
    await flushPromises()
    expect(num.emitted("change")?.[0]).toEqual([6])

    const slider = track(
      mount(Slider, { props: { modelValue: 10, ariaLabel: "Gain" }, attachTo: document.body }),
    )
    await flushPromises()
    const sliderVm = slider.vm as unknown as { focus: () => void; blur: () => void }
    sliderVm.focus()
    expect(document.activeElement).toBe(slider.get('[role="slider"]').element)
    expect(slider.emitted("focus")).toHaveLength(1)
    sliderVm.blur()
    expect(document.activeElement).not.toBe(slider.get('[role="slider"]').element)
    expect(slider.emitted("blur")).toHaveLength(1)

    const tabs = track(
      mount(Tabs, {
        props: {
          modelValue: "one",
          items: [{ value: "one", label: "One" }],
          ariaLabel: "Tabs focus",
        },
        attachTo: document.body,
      }),
    )
    const tabsVm = tabs.vm as unknown as { focus: () => void; blur: () => void }
    tabsVm.focus()
    expect(document.activeElement).toBe(tabs.get(".miu-tabs__trigger").element)
    tabsVm.blur()
    expect(document.activeElement).not.toBe(tabs.get(".miu-tabs__trigger").element)

    const seg = track(
      mount(SegmentedControl, {
        props: {
          modelValue: "x",
          options: [{ value: "x", label: "X" }],
          ariaLabel: "Seg focus",
        },
        attachTo: document.body,
      }),
    )
    const segVm = seg.vm as unknown as { focus: () => void; blur: () => void }
    segVm.focus()
    expect(document.activeElement).toBe(seg.get(".miu-segmented__item").element)
    segVm.blur()
    expect(document.activeElement).not.toBe(seg.get(".miu-segmented__item").element)
  })
})

describe("Wave 6B form & selection unification", () => {
  it("supports Textarea explicit/inherited material='glass' and iconSize", () => {
    registerMaterial({
      name: "w6b-glass-custom",
      fallback: "glass",
      generateTokens: () => ({ "--miu-material-surface": "rgb(12 24 36)" }),
    })

    const nested = track(
      mount({
        components: { ThemeProvider, Textarea },
        template: `
          <ThemeProvider material="solid">
            <ThemeProvider material="glass">
              <Textarea model-value="inherited" clearable icon-size="lg" />
              <Textarea model-value="explicit" material="glass" />
              <Textarea model-value="override" material="solid" />
            </ThemeProvider>
          </ThemeProvider>
        `,
      }),
    )

    const areas = nested.findAll(".miu-textarea")
    expect(areas[0]?.attributes("data-material")).toBeUndefined()
    expect(areas[0]?.attributes("data-miu-icon-size")).toBe("lg")
    expect(areas[0]?.get(".miu-textarea__clear svg").attributes("data-miu-icon-size")).toBe("lg")
    expect(areas[1]?.attributes("data-material")).toBe("glass")
    expect(areas[2]?.attributes("data-material")).toBe("solid")

    const custom = track(
      mount(Textarea, { props: { material: "w6b-glass-custom", modelValue: "x" } }),
    )
    expect(custom.attributes("data-material")).toBe("w6b-glass-custom")
    expect(custom.attributes("style")).toContain("--miu-material-surface: rgb(12 24 36)")
  })

  it("wires material on Checkbox, Switch (with radius), and Slider", () => {
    registerMaterial({
      name: "w6b-ctrl-mat",
      fallback: "mica",
      generateTokens: () => ({ "--miu-material-surface": "rgb(20 30 40)" }),
    })

    const chk = track(mount(Checkbox, { props: { label: "Agree", material: "w6b-ctrl-mat" } }))
    expect(chk.attributes("data-material")).toBe("w6b-ctrl-mat")
    expect(chk.attributes("style")).toContain("--miu-material-surface: rgb(20 30 40)")

    const swDefault = track(mount(Switch, { props: { label: "Notify", material: "glass" } }))
    expect(swDefault.attributes("data-material")).toBe("glass")
    expect(swDefault.attributes("data-miu-radius")).toBe("full")

    const swCustom = track(
      mount(Switch, { props: { label: "Notify", material: "w6b-ctrl-mat", radius: "sm" } }),
    )
    expect(swCustom.attributes("data-material")).toBe("w6b-ctrl-mat")
    expect(swCustom.attributes("data-miu-radius")).toBe("sm")
    expect(swCustom.attributes("style")).toContain("--miu-material-surface: rgb(20 30 40)")

    const slider = track(
      mount(Slider, { props: { modelValue: 50, material: "w6b-ctrl-mat", ariaLabel: "Level" } }),
    )
    expect(slider.attributes("data-material")).toBe("w6b-ctrl-mat")
    expect(slider.attributes("style")).toContain("--miu-material-surface: rgb(20 30 40)")
  })

  it("wires material, radius, iconSize, and clearable on MessageComposer", async () => {
    registerMaterial({
      name: "w6b-mc-mat",
      fallback: "glass",
      generateTokens: () => ({ "--miu-material-surface": "rgb(30 40 50)" }),
    })

    const mc = track(
      mount(MessageComposer, {
        props: {
          modelValue: "Hello",
          material: "w6b-mc-mat",
          radius: "lg",
          iconSize: "md",
          clearable: true,
          showCancel: true,
        },
        attachTo: document.body,
      }),
    )

    expect(mc.attributes("data-material")).toBe("w6b-mc-mat")
    expect(mc.attributes("data-miu-radius")).toBe("lg")
    expect(mc.attributes("data-miu-icon-size")).toBe("md")
    expect(mc.attributes("style")).toContain("--miu-material-surface: rgb(30 40 50)")
    expect(mc.get(".miu-textarea").attributes("data-material")).toBe("w6b-mc-mat")
    expect(mc.get(".miu-textarea").attributes("data-miu-radius")).toBe("lg")
    expect(mc.get(".miu-textarea").attributes("data-miu-icon-size")).toBe("md")

    const actionBtns = mc.findAll(".miu-message-composer__actions button")
    expect(actionBtns[0]?.attributes("data-miu-icon-size")).toBe("md")
    expect(actionBtns[1]?.attributes("data-miu-icon-size")).toBe("md")

    await mc.get(".miu-textarea__clear").trigger("click")
    expect(mc.emitted("clear")).toHaveLength(1)
    expect(mc.emitted("update:modelValue")?.[0]).toEqual([""])
  })

  it("supports NumberInput clearable and ColorPicker iconSize + clearable", async () => {
    const num = track(
      mount(NumberInput, {
        props: {
          modelValue: 42,
          clearable: true,
          iconSize: "md",
          classNames: { clear: "num-clr" },
          ariaLabel: "Qty",
        },
        attachTo: document.body,
      }),
    )

    const numClear = num.get(".miu-number-input__clear")
    expect(numClear.classes()).toContain("num-clr")
    await numClear.trigger("click")
    expect(num.emitted("update:modelValue")?.[0]).toEqual([undefined])
    expect(num.emitted("change")?.[0]).toEqual([undefined])
    expect(num.emitted("clear")).toHaveLength(1)
    expect(document.activeElement).toBe(num.get("input").element)

    await num.setProps({ modelValue: undefined })
    expect(num.find(".miu-number-input__clear").exists()).toBe(false)
    await num.setProps({ modelValue: 10, readonly: true })
    expect(num.find(".miu-number-input__clear").exists()).toBe(false)
    await num.setProps({ readonly: false, disabled: true })
    expect(num.find(".miu-number-input__clear").exists()).toBe(false)

    const cp = track(
      mount(ColorPicker, {
        props: {
          modelValue: "#9A49E0",
          presets: ["#9A49E0", "#10B981"],
          iconSize: "lg",
          clearable: true,
          classNames: { clear: "cp-clr" },
        },
        attachTo: document.body,
      }),
    )

    expect(cp.attributes("data-miu-icon-size")).toBe("lg")
    expect(cp.get(".miu-color-picker__preset--active svg").attributes("data-miu-icon-size")).toBe(
      "lg",
    )
    const cpClear = cp.get(".miu-color-picker__clear")
    expect(cpClear.classes()).toContain("cp-clr")
    await cpClear.trigger("click")
    expect(cp.emitted("update:modelValue")?.[0]).toEqual([""])
    expect(cp.emitted("change")?.[0]).toEqual([""])
    expect(cp.emitted("clear")).toHaveLength(1)
    expect(document.activeElement).toBe(cp.get(".miu-color-picker__input").element)
    expect(cp.find(".miu-color-picker__clear").exists()).toBe(false)
  })

  it("wires RadioGroup iconSize, SegmentedControl/PillGroup/CategoryFilter readonly + props, and FormRow disabled", async () => {
    const rg = track(
      mount(RadioGroup, {
        props: { modelValue: "a", options: ["a", "b"], iconSize: "lg", ariaLabel: "RG" },
      }),
    )
    expect(rg.attributes("data-miu-icon-size")).toBe("lg")

    const seg = track(
      mount(SegmentedControl, {
        props: {
          modelValue: "a",
          readonly: true,
          clearable: true,
          options: [
            { value: "a", label: "A" },
            { value: "b", label: "B" },
          ],
          ariaLabel: "Seg readonly",
        },
      }),
    )
    expect(seg.classes()).toContain("miu-segmented--readonly")
    expect(seg.attributes("data-readonly")).toBe("true")
    expect(seg.attributes("aria-readonly")).toBe("true")
    await seg.findAll(".miu-segmented__item")[0]?.trigger("click")
    await seg.findAll(".miu-segmented__item")[1]?.trigger("click")
    await seg.findAll(".miu-segmented__item")[1]?.trigger("keydown", { key: "Enter" })
    expect(seg.emitted("update:modelValue")).toBeUndefined()
    expect(seg.emitted("clear")).toBeUndefined()

    const pg = track(
      mount(PillGroup, {
        props: {
          modelValue: "rock",
          readonly: true,
          clearable: true,
          showAllOption: true,
          options: ["rock", "jazz"],
          ariaLabel: "PG readonly",
        },
      }),
    )
    expect(pg.classes()).toContain("miu-pill-group--readonly")
    expect(pg.attributes("data-readonly")).toBe("true")
    expect(pg.attributes("aria-readonly")).toBe("true")
    await pg.findAll(".miu-pill__main")[0]?.trigger("click")
    await pg.findAll(".miu-pill__main")[1]?.trigger("click")
    await pg.findAll(".miu-pill__main")[2]?.trigger("click")
    expect(pg.emitted("update:modelValue")).toBeUndefined()
    expect(pg.emitted("clear")).toBeUndefined()

    const cf = track(
      mount(CategoryFilter, {
        props: {
          modelValue: "pop",
          material: "glass",
          radius: "lg",
          iconSize: "md",
          readonly: true,
          groups: [{ key: "genre", label: "Genre", subtags: [{ key: "pop", label: "Pop" }] }],
          ariaLabel: "CF",
        },
      }),
    )
    expect(cf.classes()).toContain("miu-category-filter--readonly")
    expect(cf.attributes("data-readonly")).toBe("true")
    expect(cf.attributes("aria-readonly")).toBe("true")
    expect(cf.attributes("data-miu-radius")).toBe("lg")
    expect(cf.attributes("data-miu-icon-size")).toBe("md")
    expect(cf.get(".miu-tabs").attributes("data-material")).toBe("glass")
    expect(cf.get(".miu-tabs").attributes("data-miu-radius")).toBe("lg")
    expect(cf.get(".miu-tabs").attributes("data-miu-icon-size")).toBe("md")
    expect(cf.get(".miu-pill-group").attributes("data-readonly")).toBe("true")
    expect(cf.get(".miu-pill-group").attributes("data-miu-radius")).toBe("lg")
    expect(cf.get(".miu-pill").attributes("data-material")).toBe("glass")
    await cf.findAll(".miu-tabs__trigger")[0]?.trigger("click")
    await cf.get(".miu-pill__main").trigger("click")
    expect(cf.emitted("update:modelValue")).toBeUndefined()
    expect(cf.emitted("clear")).toBeUndefined()

    const row = track(
      mount(FormRow, {
        props: { label: "Disabled row", clickable: true, disabled: true },
      }),
    )
    expect(row.classes()).toContain("miu-form-row--disabled")
    expect(row.attributes("data-disabled")).toBe("true")
    expect(row.attributes("aria-disabled")).toBe("true")
    expect(row.attributes("tabindex")).toBeUndefined()
    await row.trigger("click")
    await row.trigger("keydown", { key: "Enter" })
    await row.trigger("keydown", { key: " " })
    expect(row.emitted("click")).toBeUndefined()
  })
})
