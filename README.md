# μui（@xcmm1543/miuui-*）· 组件库本体

> 当前基线：**`0.7.0`**（Precision Violet 主题基线 · 59 组件 · 75 内置图标 · 6 个独立发布包）

独立的 pnpm monorepo，包含 6 个工作区包：

- `@xcmm1543/miuui-core`：框架无关契约（`ComponentSemanticProps`、`regionClass`/`regionStyle`、`resolveIconSize`）、插件接口、内置 `zh-CN` / `en-US` Locale 注册表与主题序列化
- `@xcmm1543/miuui-tokens`：OKLCH Precision Violet 色阶生成器、四层设计令牌、`Z_INDEX` 与 W3C DTCG 导出
- `@xcmm1543/miuui-icons`：75 枚 C 风格圆润线性/实心图标（静态、`dynamic` 与 `brand` 入口）
- `@xcmm1543/miuui-materials`：可插拔材质层（`solid` / `mica` / `glass`）与统一 `--miu-glass-*` 语义映射
- `@xcmm1543/miuui-motions`：可插拔动效层级（`full` / `reduced` / `none`）与系统减动适配
- `@xcmm1543/miuui-vue`：Vue 3.5+ / Reka UI 2.11+ 无障碍组件适配器（59 个组件 + `MiuUi` 插件 + 14 个 Composables）

```bash
pnpm install
pnpm tokens:build
pnpm check
```

## 文档与工程门禁

- **设计规范**：[`docs/design-rules.md`](./docs/design-rules.md)（0.7.0 正交维度、语义区域、零硬编码与 Tree-Shaking 红线）
- **0.7.0 迁移指南**：[`docs/migration.md`](./docs/migration.md)（行为变更、直接移除的旧版 Props/Slots 与替换对照表）
- **变更日志**：[`CHANGELOG.md`](./CHANGELOG.md)
- **Reka UI 兼容策略**：[`docs/adr/0001-reka-ui-compatibility.md`](./docs/adr/0001-reka-ui-compatibility.md)
- **核心门禁（`pnpm check`）**：依次执行 `tokens:build` -> `tokens:validate` -> `check:compat` -> `lint` -> `lint:hardcoded` -> `format:check` -> `typecheck` -> `build` -> `check:size` -> `test`（全量 10 项门禁；另提供 `pnpm check:visual` 执行 Playwright + axe-core 浏览器视觉/对比度回归）。

官网位于 `../website`（独立 `package.json` 与 `pnpm-lock.yaml`）；发布环境通过 `@xcmm1543/miuui-*` npm 依赖构建，当本地 `packages/*/dist` 已构建时，`website/.vitepress/config.ts` 会通过条件 `resolve.alias` 自动指向本地工作区产物。
