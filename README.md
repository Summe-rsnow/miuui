# @miuui · 组件库本体

独立的 pnpm monorepo。包含：

- `@miuui/core`：框架无关契约、Registry、Locale、主题序列化
- `@miuui/tokens`：OKLCH 色阶、四层令牌、DTCG 导出
- `@miuui/icons`：C 柔和圆润图标命名导出
- `@miuui/materials`：`solid` / `mica` / `glass`
- `@miuui/motions`：`full` / `reduced` / `none`
- `@miuui/vue`：Vue 3.5+ / Reka UI 适配器

```bash
pnpm install
pnpm tokens:build
pnpm check
```

工具链：`oxlint` 负责 JS/TS/Vue lint 与 `core`/`tokens` 边界规则，`oxfmt` 负责格式化，`oxnode` 执行 TS 构建脚本。`pnpm check` 依次执行 Oxlint、硬编码样式门禁、Oxfmt 格式门禁、类型与单元测试。

官网在 `../website`，通过 `file:` 依赖引入本仓库的包；本仓库不包含官网源码。
