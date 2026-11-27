# μui（@xcmm1543/miuui-*）· 组件库本体

> 当前基线：**`1.0.0`**（Precision Violet 主题基线 · 69 组件 · 75 内置图标 · 6 个独立发布包）

独立的 pnpm monorepo，包含 6 个工作区包：

- [`@xcmm1543/miuui-core`](packages/core/README.md)：框架无关契约（`ComponentSemanticProps`、`regionClass`/`regionStyle`、`resolveIconSize`）、插件接口、内置 `zh-CN` / `en-US` Locale 注册表与主题辅助函数
- [`@xcmm1543/miuui-tokens`](packages/tokens/README.md)：OKLCH Precision Violet 色阶生成器、四层设计令牌、`Z_INDEX` 与 W3C DTCG 导出
- [`@xcmm1543/miuui-icons`](packages/icons/README.md)：75 枚 C 风格圆润线性/实心图标（静态、`dynamic` 与 `brand` 入口）
- [`@xcmm1543/miuui-materials`](packages/materials/README.md)：可插拔材质层（`solid` / `mica` / `glass`），隔离输出 `--miu-material-*` 令牌并运行于 `@layer miu-material`
- [`@xcmm1543/miuui-motions`](packages/motions/README.md)：可插拔动效层级（`full` / `reduced` / `none`）与 `@media (prefers-reduced-motion: reduce)` 适配
- [`@xcmm1543/miuui-vue`](packages/vue/README.md)：Vue 3.5+ / Reka UI 2.11+ 无障碍组件适配器（69 个组件 + `MiuUi` 插件 + 16 个 Composables）

```bash
pnpm install
pnpm tokens:build
pnpm check
```

## 文档与工程门禁

- **架构与设计规范**：[`website/guide/architecture.md`](../website/guide/architecture.md)（包边界、正交维度、语义区域、零硬编码与 Tree-Shaking 规范）
- **发布说明与迁移指南**：[`website/guide/release.md`](../website/guide/release.md)（1.0.0 破坏性变更、历史版本与替换对照表）
- **变更日志**：[`CHANGELOG.md`](./CHANGELOG.md)
- **Reka UI 兼容策略**：[`docs/adr/0001-reka-ui-compatibility.md`](./docs/adr/0001-reka-ui-compatibility.md)
- **核心门禁（`pnpm check`）**：依次执行 `tokens:build` -> `tokens:validate` -> `check:compat` -> `lint` -> `lint:hardcoded` -> `format:check` -> `typecheck` -> `build` -> `check:size` -> `test`（全量 10 项门禁，24 个测试文件 / 240 项单测；另提供 `pnpm check:visual` 执行 Playwright + axe-core 视觉回归）。

官网位于 `../website`（独立 `package.json` 与 `pnpm-lock.yaml`）；发布环境通过 `@xcmm1543/miuui-*` npm 依赖构建，当本地 `packages/*/dist` 已构建时，`website/.vitepress/local-aliases.mjs` 会自动解析本地工作区产物。
