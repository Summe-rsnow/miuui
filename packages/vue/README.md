# @xcmm1543/miuui-vue

μui `1.0.0` Vue 3.5+ component adapter built on Reka UI (`>=2.11.0 <3.0.0`) — 69 accessible components, `MiuUi` plugin installer, and composables.

## Installation

```bash
pnpm add @xcmm1543/miuui-vue @xcmm1543/miuui-tokens reka-ui vue
```

Optional pluggable layers:

```bash
pnpm add @xcmm1543/miuui-materials @xcmm1543/miuui-motions
```

## Usage

```ts
import "@xcmm1543/miuui-tokens/style.css"
import "@xcmm1543/miuui-vue/style.css"
import { MiuUi } from "@xcmm1543/miuui-vue"

app.use(MiuUi)
```

For tree-shaking and named imports, import components directly from `@xcmm1543/miuui-vue` (single `Button` gzipped size gate <= 25 KB; `packages/vue` ships with `"sideEffects": ["*.css"]` and `@layer miu-base` cascade rules). For 1.0.0 release notes and migration details, see [the release guide](../../../website/guide/release.md) or the [repository](https://github.com/Summe-rsnow/miuui).
