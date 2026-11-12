import { mount } from "@vue/test-utils"
import { h } from "vue"
import { describe, expect, it } from "vitest"
import Button from "./Button.vue"
import Table from "./Table.vue"

describe("dense 1000-node render performance baseline", () => {
  it("renders 1000 Button nodes within budget", () => {
    const start = performance.now()
    const wrapper = mount({
      render: () =>
        h(
          "div",
          Array.from({ length: 1000 }, (_, index) =>
            h(Button, { key: index, size: "sm" }, () => `Item ${index}`),
          ),
        ),
    })
    const elapsed = performance.now() - start
    expect(wrapper.findAll(".miu-button")).toHaveLength(1000)
    expect(elapsed).toBeLessThan(5000)
    wrapper.unmount()
  })

  it("renders a 1000-row Table within budget", () => {
    const rows = Array.from({ length: 1000 }, (_, index) => ({
      id: index,
      name: `Component ${index}`,
      status: index % 2 === 0 ? "Ready" : "Beta",
    }))
    const start = performance.now()
    const wrapper = mount(Table, {
      props: {
        columns: [
          { key: "name", label: "Name" },
          { key: "status", label: "Status", align: "end" },
        ],
        rows,
        density: "compact",
      },
    })
    const elapsed = performance.now() - start
    expect(wrapper.findAll("tbody .miu-table__row")).toHaveLength(1000)
    expect(elapsed).toBeLessThan(5000)
    wrapper.unmount()
  })
})
