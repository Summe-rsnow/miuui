import { flushPromises, mount, type VueWrapper } from "@vue/test-utils"
import { afterEach, describe, expect, it, vi } from "vitest"
import Avatar from "./Avatar.vue"
import HeroHeader from "./HeroHeader.vue"
import Image from "./Image.vue"
import ImageGroup from "./ImageGroup.vue"
import ImagePreview from "./ImagePreview.vue"
import Tabs from "./Tabs.vue"
import ThemeProvider from "./ThemeProvider.vue"

const mounted: VueWrapper[] = []
const originalAnimateDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "animate")
const originalMatchMediaDescriptor = Object.getOwnPropertyDescriptor(window, "matchMedia")

function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
  document.body.innerHTML = ""
  if (originalAnimateDescriptor) {
    Object.defineProperty(HTMLElement.prototype, "animate", originalAnimateDescriptor)
  } else {
    delete (HTMLElement.prototype as { animate?: unknown }).animate
  }
  if (originalMatchMediaDescriptor) {
    Object.defineProperty(window, "matchMedia", originalMatchMediaDescriptor)
  } else {
    delete (window as { matchMedia?: unknown }).matchMedia
  }
  vi.restoreAllMocks()
})

describe("v0.8.2 enhancements", () => {
  it("ThemeProvider injects imageResolver across Image, Avatar, HeroHeader, ImageGroup and ImagePreview", async () => {
    const resolver = vi.fn(async (url: string) => `cached://${encodeURIComponent(url)}`)

    const wrapper = track(
      mount(
        {
          components: { ThemeProvider, Image, Avatar, HeroHeader, ImageGroup },
          template: `
            <ThemeProvider :image-resolver="resolver">
              <Avatar src="https://example.com/avatar.jpg" alt="User" />
              <Image src="https://example.com/pic.jpg" alt="Pic" />
              <HeroHeader title="Album" cover="https://example.com/hero.jpg" previewable />
              <ImageGroup
                :images="[{ thumb: 'https://example.com/thumb.jpg', src: 'https://example.com/origin.jpg', alt: 'Note' }]"
              />
            </ThemeProvider>
          `,
          setup() {
            return { resolver }
          },
        },
        { attachTo: document.body },
      ),
    )

    await flushPromises()

    expect(wrapper.get(".miu-avatar__image").attributes("src")).toBe(
      "cached://https%3A%2F%2Fexample.com%2Favatar.jpg",
    )
    expect(wrapper.get(".miu-image__img").attributes("src")).toBe(
      "cached://https%3A%2F%2Fexample.com%2Fpic.jpg",
    )
    expect(wrapper.get(".miu-hero__bg").attributes("style")).toContain(
      "cached://https%3A%2F%2Fexample.com%2Fhero.jpg",
    )
    expect(wrapper.get(".miu-image-group__item img").attributes("src")).toBe(
      "cached://https%3A%2F%2Fexample.com%2Fthumb.jpg",
    )

    await wrapper.get(".miu-image-group__item").trigger("click")
    await flushPromises()
    const previewImg = document.querySelector(".miu-image-preview__img")
    expect(previewImg?.getAttribute("src")).toBe("cached://https%3A%2F%2Fexample.com%2Forigin.jpg")
  })

  it("ImagePreview uses resolved thumb placeholder while full src is still resolving and falls back on error", async () => {
    let resolveOrigin: ((val: string) => void) | undefined
    const resolver = vi.fn((url: string) => {
      if (url.includes("thumb")) return Promise.resolve("cached://thumb")
      if (url.includes("fail")) return Promise.reject(new Error("cache miss"))
      return new Promise<string>((resolve) => {
        resolveOrigin = resolve
      })
    })

    const preview = track(
      mount(
        {
          components: { ThemeProvider, ImagePreview },
          template: `
            <ThemeProvider :image-resolver="resolver">
              <ImagePreview
                :open="true"
                :images="[{ thumb: 'https://example.com/thumb.jpg', src: 'https://example.com/origin.jpg', alt: 'Note' }]"
              />
            </ThemeProvider>
          `,
          setup() {
            return { resolver }
          },
        },
        { attachTo: document.body },
      ),
    )

    await flushPromises()
    const imgEl = document.querySelector(".miu-image-preview__img")
    expect(imgEl?.getAttribute("src")).toBe("cached://thumb")

    resolveOrigin?.("cached://origin")
    await flushPromises()
    expect(imgEl?.getAttribute("src")).toBe("cached://origin")
    preview.unmount()

    const fallbackWrapper = track(
      mount({
        components: { ThemeProvider, Image },
        template: `
          <ThemeProvider :image-resolver="resolver">
            <Image src="https://example.com/fail.jpg" alt="Fail" />
          </ThemeProvider>
        `,
        setup() {
          return { resolver }
        },
      }),
    )
    await flushPromises()
    expect(fallbackWrapper.get(".miu-image__img").attributes("src")).toBe(
      "https://example.com/fail.jpg",
    )
  })

  it("ThemeProvider respectReducedMotion=false sets data attribute and keeps WAAPI motion active", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn(
        (query: string) =>
          ({
            matches: query.includes("prefers-reduced-motion"),
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
          }) as unknown as MediaQueryList,
      ),
    })

    const animateSpy = vi.fn(() => ({
      finished: Promise.resolve(),
      cancel: vi.fn(),
      onfinish: null,
      oncancel: null,
    }))
    Object.defineProperty(HTMLElement.prototype, "animate", {
      configurable: true,
      writable: true,
      value: animateSpy,
    })

    const wrapper = track(
      mount(
        {
          components: { ThemeProvider, ImagePreview, Tabs },
          template: `
            <ThemeProvider :respect-reduced-motion="false">
              <Tabs model-value="a" :items="[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]" />
              <ImagePreview :open="true" src="https://example.com/1.png" />
            </ThemeProvider>
          `,
        },
        { attachTo: document.body },
      ),
    )

    await flushPromises()
    expect(wrapper.get(".miu-theme-provider").attributes("data-respect-reduced-motion")).toBe(
      "false",
    )
    expect(animateSpy).toHaveBeenCalled()
  })
})
