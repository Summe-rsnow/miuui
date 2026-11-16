import "@xcmm1543/miuui-vue/style.css"
import "@xcmm1543/miuui-materials/style.css"
import "@xcmm1543/miuui-motions/style.css"

import { createApp, h, ref } from "vue"
import type { ControlSize, Density, MaterialName, MotionTier, Radius } from "@xcmm1543/miuui-core"
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Code,
  Dialog,
  FormField,
  IconButton,
  Input,
  Pill,
  SegmentedControl,
  Select,
  Switch,
  Table,
  Tabs,
  ThemeProvider,
} from "@xcmm1543/miuui-vue"

const params = new URLSearchParams(window.location.search)
const theme = (params.get("theme") === "dark" ? "dark" : "light") as "light" | "dark"
const material = (params.get("material") ?? "solid") as MaterialName
const motionTier = (params.get("motionTier") ?? "full") as MotionTier
const density = (params.get("density") ?? "default") as Density
const size = (params.get("size") ?? "md") as ControlSize
const radius = (params.get("radius") ?? "md") as Radius
const initialDialog = params.get("dialog") === "1"

const App = {
  setup() {
    const query = ref("Precision Violet")
    const framework = ref("vue")
    const checked = ref(true)
    const enabled = ref(true)
    const tab = ref("overview")
    const view = ref("grid")
    const dialogOpen = ref(initialDialog)

    return () =>
      h(ThemeProvider, { theme, material, motionTier, density, radius, locale: "en-US" }, () =>
        h("main", { class: "matrix-root" }, [
          h("h1", { style: { margin: "0 0 16px", fontSize: "24px" } }, "μui Visual Matrix"),
          h("div", { class: "matrix-grid" }, [
            h(Card, { material }, () => [
              h("div", { class: "matrix-row" }, [
                h(
                  Button,
                  { id: "btn-primary", size, radius, icon: "plus" },
                  () => "Primary Action",
                ),
                h(
                  Button,
                  { id: "btn-secondary", size, radius, variant: "secondary" },
                  () => "Secondary",
                ),
                h(Button, { id: "btn-outline", size, radius, variant: "outline" }, () => "Outline"),
                h(Button, { id: "btn-danger", size, radius, variant: "danger" }, () => "Danger"),
                h(
                  Button,
                  { id: "btn-glass", size, radius, variant: "glass", material: "glass" },
                  () => "Glass",
                ),
                h(Button, { size, radius, disabled: true }, () => "Disabled"),
                h(IconButton, { size, radius, label: "Settings", icon: "settings" }),
                h(
                  Button,
                  { id: "open-dialog-btn", size, radius, onClick: () => (dialogOpen.value = true) },
                  () => "Open Dialog",
                ),
              ]),
            ]),
            h(Card, { material }, () => [
              h("div", { class: "matrix-grid", style: { gap: "16px" } }, [
                h(
                  FormField,
                  {
                    id: "field-email",
                    label: "Email address",
                    description: "Used for workspace alerts",
                    error: "Use a valid domain",
                    required: true,
                  },
                  () =>
                    h(Input, {
                      id: "field-email",
                      modelValue: query.value,
                      size,
                      radius,
                      clearable: true,
                      "onUpdate:modelValue": (v: string) => (query.value = v),
                    }),
                ),
                h(FormField, { id: "field-framework", label: "Framework" }, () =>
                  h(Select, {
                    id: "field-framework",
                    modelValue: framework.value,
                    size,
                    radius,
                    options: [
                      { value: "vue", label: "Vue 3.5 + Reka UI" },
                      { value: "nuxt", label: "Nuxt / SSR" },
                    ],
                    "onUpdate:modelValue": (v: string) => (framework.value = v),
                  }),
                ),
                h("div", { class: "matrix-row" }, [
                  h(Checkbox, {
                    modelValue: checked.value,
                    label: "Accept constraints",
                    "onUpdate:modelValue": (v: boolean) => (checked.value = v),
                  }),
                  h(Switch, {
                    modelValue: enabled.value,
                    label: "Reduced transparency",
                    "onUpdate:modelValue": (v: boolean) => (enabled.value = v),
                  }),
                  h(Badge, { variant: "success", dot: true }, () => "Ready"),
                  h(Pill, { label: "Orthogonal", active: true, removable: true }),
                  h(Avatar, { alt: "Ada Lovelace", size }),
                ]),
              ]),
            ]),
            h(
              Alert,
              { variant: "info", title: "Contrast verified", icon: "bell" },
              () => "Normal text and UI boundaries stay above WCAG thresholds.",
            ),
            h(
              Tabs,
              {
                modelValue: tab.value,
                ariaLabel: "Sections",
                size,
                items: [
                  { value: "overview", label: "Overview" },
                  { value: "disabled", label: "Locked", disabled: true },
                  { value: "tokens", label: "Tokens" },
                ],
                "onUpdate:modelValue": (v: string) => (tab.value = v),
              },
              {
                panel: ({ value }: { value: string }) =>
                  h("div", { style: { paddingTop: "8px" } }, `Active tab: ${value}`),
              },
            ),
            h(SegmentedControl, {
              modelValue: view.value,
              ariaLabel: "Layout",
              size,
              radius,
              options: [
                { value: "grid", label: "Grid" },
                { value: "list", label: "List" },
              ],
              "onUpdate:modelValue": (v: string) => (view.value = v),
            }),
            h(
              Table,
              {
                striped: true,
                bordered: true,
                columns: [
                  { key: "name", label: "Component" },
                  { key: "pkg", label: "Package" },
                  { key: "status", label: "Status", align: "end" },
                ],
                rows: [
                  { id: 1, name: "Button", pkg: "@xcmm1543/miuui-vue", status: "Ready" },
                  { id: 2, name: "Dialog", pkg: "@xcmm1543/miuui-vue", status: "Ready" },
                  { id: 3, name: "Code", pkg: "@xcmm1543/miuui-tokens", status: "Ready" },
                ],
              },
              {
                "cell-pkg": ({ value }: { value: unknown }) =>
                  h(Code, { variant: "primary", size: "sm" }, () => String(value)),
              },
            ),
            h(
              Dialog,
              {
                open: dialogOpen.value,
                title: "Release verification",
                description: "Confirm visual and contrast gate.",
                material,
                "onUpdate:open": (v: boolean) => (dialogOpen.value = v),
              },
              {
                default: () => h("p", "Dialog focus trap and restore check."),
                footer: () => [
                  h(
                    Button,
                    { variant: "secondary", onClick: () => (dialogOpen.value = false) },
                    () => "Cancel",
                  ),
                  h(Button, { onClick: () => (dialogOpen.value = false) }, () => "Confirm"),
                ],
              },
            ),
          ]),
        ]),
      )
  },
}

createApp(App).mount("#app")
