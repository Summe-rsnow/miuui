import { defineComponent } from "vue"
import { flushPromises, mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import Badge from "./Badge.vue"
import ContextMenu from "./ContextMenu.vue"
import DropdownMenu from "./DropdownMenu.vue"
import HeroHeader from "./HeroHeader.vue"
import IconButton from "./IconButton.vue"
import MediaCard from "./MediaCard.vue"
import Popover from "./Popover.vue"
import PopupPanel from "./PopupPanel.vue"
import Progress from "./Progress.vue"
import Scrollbar from "./Scrollbar.vue"
import VerticalSlider from "./VerticalSlider.vue"

describe("migrated components (0.8.0)", () => {
  it("renders Scrollbar, handles rapid container swap and unmount without clobbering userSelect", async () => {
    document.body.style.userSelect = "text"
    const containerA = document.createElement("div")
    const containerB = document.createElement("div")
    const wrapper = mount(Scrollbar, {
      props: { container: containerA, topOffset: 48, bottomOffset: 8 },
    })
    expect(wrapper.find(".miu-scrollbar").attributes("aria-hidden")).toBe("true")
    expect(typeof wrapper.vm.update).toBe("function")
    wrapper.vm.update()
    await wrapper.setProps({ container: containerB })
    wrapper.unmount()
    await flushPromises()
    expect(document.body.style.userSelect).toBe("text")
    document.body.style.userSelect = ""
  })

  it("renders VerticalSlider in discrete and continuous modes, validates a11y, decimal precision, centerZero and wheel", async () => {
    const discrete = mount(VerticalSlider, {
      props: {
        modelValue: 1,
        steps: ["+2", "+1", "0", "-1"],
        topLabel: "A",
        bottomLabel: "a",
        ariaLabel: "Level",
      },
    })
    expect(discrete.text()).toContain("+1")
    const track = discrete.get(".miu-vertical-slider__track")
    expect(track.attributes("aria-valuetext")).toBe("+1")
    await track.trigger("keydown.down")
    expect(discrete.emitted("update:modelValue")?.[0]).toEqual([2])
    expect(discrete.emitted("change")?.[0]).toEqual([2])
    await track.trigger("keydown.home")
    expect(discrete.emitted("update:modelValue")?.[1]).toEqual([3])
    await track.trigger("keydown.end")
    expect(discrete.emitted("update:modelValue")?.[2]).toEqual([0])
    discrete.unmount()

    const continuous = mount(VerticalSlider, {
      props: {
        modelValue: 0.1,
        mode: "continuous",
        min: -6,
        max: 12,
        step: 0.1,
        centerZero: true,
        ariaLabel: "Gain",
      },
    })
    const marker = continuous.find(".miu-vertical-slider__center-marker")
    expect(marker.exists()).toBe(true)
    expect(marker.attributes("style")).toContain("inset-block-start: 66.666")
    await continuous.get(".miu-vertical-slider__track").trigger("keydown.up")
    expect(continuous.emitted("update:modelValue")?.[0]).toEqual([0.2])
    await continuous.setProps({ disabled: true })
    const disabledWheel = new WheelEvent("wheel", { deltaY: -100, cancelable: true })
    continuous.get(".miu-vertical-slider__track").element.dispatchEvent(disabledWheel)
    expect(disabledWheel.defaultPrevented).toBe(false)
    continuous.unmount()
  })

  it("renders PopupPanel with title, closable button, body and footer", async () => {
    const wrapper = mount(PopupPanel, {
      props: { title: "Queue", closable: true, footerClickable: true },
      slots: {
        default: "<div class='body-item'>Song 1</div>",
        footer: "Clear",
      },
    })
    expect(wrapper.find(".miu-popup-panel__title").text()).toBe("Queue")
    expect(wrapper.find(".body-item").exists()).toBe(true)
    await wrapper.get(".miu-popup-panel__close").trigger("click")
    expect(wrapper.emitted("close")).toBeTruthy()
    await wrapper.get(".miu-popup-panel__footer").trigger("click")
    expect(wrapper.emitted("footerClick")).toBeTruthy()
    wrapper.unmount()
  })

  it("renders IconButton with aurora variant", () => {
    const wrapper = mount(IconButton, {
      props: { icon: "play", variant: "aurora", active: true, ariaLabel: "Play" },
    })
    expect(wrapper.classes()).toContain("miu-button--aurora")
    expect(wrapper.classes()).toContain("miu-icon-button--active")
    wrapper.unmount()
  })

  it("renders Badge with media variant", () => {
    const wrapper = mount(Badge, {
      props: { variant: "media", size: "xs", radius: "full", icon: "play" },
      slots: { default: "1.2w" },
    })
    expect(wrapper.classes()).toContain("miu-badge--media")
    expect(wrapper.text()).toContain("1.2w")
    wrapper.unmount()
  })

  it("renders HeroHeader with single-root attr fallthrough, quoted backdrop url, and loading preview reset", async () => {
    const loadingWrapper = mount(HeroHeader, {
      props: { loading: true, coverShape: "circle", actionCount: 2 },
      attrs: { class: "custom-hero" },
    })
    expect(loadingWrapper.classes()).toContain("miu-hero")
    expect(loadingWrapper.classes()).toContain("custom-hero")
    expect(loadingWrapper.find(".miu-hero--loading").exists()).toBe(true)
    expect(loadingWrapper.find(".miu-hero__cover--circle").exists()).toBe(true)
    loadingWrapper.unmount()

    const loadedWrapper = mount(HeroHeader, {
      props: {
        title: "Playlist",
        tag: "歌单",
        description: "Desc",
        cover: "https://example.com/my (cover).jpg",
        previewable: true,
        loading: false,
      },
      slots: { actions: "<button>Play</button>" },
      attachTo: document.body,
    })
    expect(loadedWrapper.find(".miu-hero__title").text()).toBe("Playlist")
    expect(loadedWrapper.find(".miu-hero__tag").text()).toBe("歌单")
    expect(loadedWrapper.find(".miu-hero__bg").attributes("style")).toContain(
      'url("https://example.com/my (cover).jpg")',
    )
    const coverEl = loadedWrapper.get(".miu-hero__cover")
    expect(coverEl.attributes("role")).toBe("button")
    await coverEl.trigger("click")
    await flushPromises()
    expect(document.querySelector(".miu-image-preview")).not.toBeNull()
    await loadedWrapper.setProps({ loading: true })
    await flushPromises()
    await loadedWrapper.setProps({ loading: false })
    await flushPromises()
    expect(document.querySelector(".miu-image-preview")).toBeNull()
    loadedWrapper.unmount()
  })

  it("renders MediaCard in vertical, horizontal, and loading modes with semantic regions", async () => {
    const loadingCard = mount(MediaCard, {
      props: { loading: true, aspect: "circle" },
    })
    expect(loadingCard.find(".miu-media-card--loading").exists()).toBe(true)
    expect(loadingCard.attributes("data-miu-radius")).toBe("lg")
    expect(loadingCard.find(".miu-media-card__skeleton-cover").attributes("data-miu-radius")).toBe(
      "full",
    )
    loadingCard.unmount()

    const card = mount(MediaCard, {
      props: {
        title: "Midnight Mix",
        subtitle: "Lo-Fi Radio",
        interactive: true,
        aspect: "video",
        actionPlacement: "center",
        classNames: {
          root: "mc-root",
          media: "mc-media",
          cover: "mc-cover",
          body: "mc-body",
          title: "mc-title",
          subtitle: "mc-subtitle",
          meta: "mc-meta",
          action: "mc-action",
        },
      },
      slots: {
        cover: '<div class="custom-cover">Cover</div>',
        "top-end": "1.2w",
        meta: "12 tracks",
        action: '<button type="button" class="play-btn">Play</button>',
      },
    })
    expect(card.classes()).toContain("mc-root")
    expect(card.classes()).toContain("miu-media-card--aspect-video")
    for (const cls of [
      "mc-media",
      "mc-cover",
      "mc-body",
      "mc-title",
      "mc-subtitle",
      "mc-meta",
      "mc-action",
    ]) {
      expect(card.find(`.${cls}`).exists()).toBe(true)
    }
    await card.get(".miu-media-card__trigger").trigger("click")
    expect(card.emitted("click")).toHaveLength(1)
    await card.setProps({ layout: "horizontal", disabled: true })
    expect(card.classes()).toContain("miu-media-card--horizontal")
    expect(card.find(".miu-media-card__trigger").exists()).toBe(false)
    card.unmount()
  })

  it("renders Progress in circular shape with center value, zero stroke guard, and accessible custom slot", () => {
    const circle = mount(Progress, {
      props: {
        shape: "circle",
        modelValue: 45,
        max: 100,
        size: "lg",
        showValue: true,
        ariaLabel: "Cloud usage",
      },
    })
    expect(circle.classes()).toContain("miu-progress--circle")
    expect(circle.find(".miu-progress__svg").exists()).toBe(true)
    expect(circle.find(".miu-progress__label").text()).toBe("45%")
    expect(circle.find(".miu-progress__label").attributes("aria-hidden")).toBe("true")
    expect(circle.get('[role="progressbar"]').attributes("aria-label")).toBe("Cloud usage")
    circle.unmount()

    const zero = mount(Progress, {
      props: { shape: "circle", modelValue: 0, max: 100, ariaLabel: "Zero" },
    })
    expect(zero.find(".miu-progress__circle-indicator").attributes("stroke-opacity")).toBe("0")
    zero.unmount()

    const customSlot = mount(Progress, {
      props: { shape: "circle", modelValue: 75, ariaLabel: "Storage" },
      slots: { default: "<strong>3/4</strong>" },
    })
    expect(customSlot.find(".miu-progress__label").text()).toBe("3/4")
    expect(customSlot.find(".miu-progress__label").attributes("aria-hidden")).toBeUndefined()
    customSlot.unmount()
  })

  it("supports virtual reference and autoMaxHeight on Popover, plus submenus on DropdownMenu & ContextMenu", async () => {
    const virtualRef = {
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        top: 100,
        right: 120,
        bottom: 100,
        left: 120,
        x: 120,
        y: 100,
        toJSON: () => ({}),
      }),
    }
    const Host = defineComponent({
      components: { Popover },
      data: () => ({ reference: virtualRef }),
      template: `<Popover open :reference="reference" auto-max-height>Virtual Body</Popover>`,
    })
    const pop = mount(Host, { attachTo: document.body })
    await flushPromises()
    const content = document.querySelector<HTMLElement>(".miu-popover")
    expect(content?.textContent).toContain("Virtual Body")
    expect(content?.getAttribute("data-auto-max-height")).toBe("true")
    pop.unmount()

    const items = [
      {
        label: "Add to",
        value: "add",
        children: [{ label: "Favorites", value: "fav" }],
      },
    ]
    const dd = mount(DropdownMenu, {
      props: { open: true, items },
      slots: { trigger: '<button type="button">Menu</button>' },
      attachTo: document.body,
    })
    await flushPromises()
    expect(document.querySelector(".miu-menu__sub-trigger")?.textContent).toContain("Add to")
    dd.unmount()

    const ctx = mount(ContextMenu, {
      props: { open: true, items },
      slots: { trigger: "<div>Zone</div>" },
      attachTo: document.body,
    })
    await flushPromises()
    expect(
      document.querySelector(".miu-context-menu .miu-menu__sub-trigger")?.textContent,
    ).toContain("Add to")
    ctx.unmount()
  })
})
