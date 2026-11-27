# Changelog

All notable changes to `@xcmm1543/miuui-*` are documented in this file.

## [1.0.0] - 2026-11-27

### 新增组件（New Components — 64 → 69）

- **`Divider` / `Accordion` / `Steps` / `Combobox` / `TagInput`**：新增 5 个基础与表单组件（全库共 **69** 个组件，均在 `index.ts` 与 `plugin.ts` 注册并纳入文档、无障碍与单测门禁）。

### 破坏性变更与 API 清理（Breaking Changes & Cleanup）

- **`PopupPanelProps`**：`closable?: boolean` 重命名为 `showClose?: boolean`。
- **`ToastViewportProps`**：`styleVariant?: ToastStyleVariant` 重命名为 `variant?: ToastStyleVariant`（`ThemeProviderProps.toastStyleVariant` 与 `ToastOptions.styleVariant` / `ToastDefaults.styleVariant` 保持不变）。
- **`IconProps` & `SpinnerProps`**：`label?: string` 重命名为 `ariaLabel?: string`。
- **`SpinnerProps` & `LoadingOverlayProps`**：`size?: IconSize` 重命名为 `iconSize?: IconSize`（`LoadingOverlay` 根节点同步绑定 `:data-miu-icon-size="iconSize"`）。
- **`@xcmm1543/miuui-core`**：移除未使用的 `THEME_STORAGE_KEY` 导出。
- **`@xcmm1543/miuui-materials`**：移除未使用的 `--miu-material-gloss` 变量及其空样式规则。

### 基础设施与组件修复（Infrastructure & Component Fixes）

- **材质令牌隔离（`packages/materials`）**：`micaMaterial` 与 `glassMaterial` 移除 `glassBaseTokens(semantic)` 展开，仅内联注入 `--miu-material-*` 令牌，防止 `--miu-glass-*` 污染局部子树；新增 `materials.test.ts` 验证。
- **`@layer` 级联秩序**：`packages/materials/src/style.css` 与 `packages/motions/src/style.css` 统一声明 `@layer miu-reset, miu-tokens, miu-base, miu-material, miu-motion, miu-override;`；`packages/vue/dist/style.css` 保留 `@import "./components.css" layer(miu-base);` 将组件样式放入 `miu-base` 层，而 `packages/vue/dist/components.css` 保持未分层（unlayered），避免宿主未分层 reset（如 VitePress / Tailwind）覆盖组件样式。
- **减动效完整性（`packages/motions`）**：为 `[data-motion-tier="none"]` 与 `@media (prefers-reduced-motion: reduce)` 补全全部缺失的动画与过渡选择器（含清除按钮、遮罩、`Popover`、`ImagePreview`、环形进度及 1.0.0 新增组件），并新增 `motions.test.ts`。
- **CSS 状态令牌与 `:focus-visible` 收口**：`Select`、`Tabs`、`SegmentedControl`、`NumberInput` 与菜单项禁用态统一使用 `var(--miu-opacity-disabled)`；标准 `:focus-visible` 焦点环规则统一收拢至 `01-interactive.css`。
- **IME、无障碍、国际化与 `useControlSize` 对齐**：
  - `CommandPalette` 回车确认补充 `event.isComposing` 守卫；
  - `CategoryFilter` 移除向 `<Tabs>` 透传的无效 `:readonly` 并补全 `defineExpose({ focus, blur, tabsRef })`；
  - `MediaCard` 为可交互禁用/加载态绑定 `:aria-disabled`；
  - `@xcmm1543/miuui-core` `zh-CN` / `en-US` 新增 `table.actions`、`numberInput.decrement`、`numberInput.increment`、`image.preview`、`colorPicker.hex`；`NumberInput`、`Table`、`Image`、`HeroHeader` 与 `ColorPicker` 接入国际化文案与 ARIA 绑定；
  - `Breadcrumb`、`Code`、`Kbd`、`Pagination` 接入 `useControlSize()` 并绑定 `:data-miu-size`；`Input`、`Select`、`NumberInput` 内部图标统一使用 `resolvedIconSize.size`；
  - `Pagination` 向内部 `Select` / `NumberInput` 透传 `material` 与 `radius`；`PageLayout` 新增并透传 `backLabel`；`HelpTooltip` 补全 `defineExpose({ focus, blur, triggerRef })`；`VerticalSlider` 转发 `focus` / `blur` 事件；`ImagePreviewOriginRect` 补全字段 JSDoc。

### 文档与门禁（Documentation & Verification）

- **单仓单一事实源重构**：官网收敛为 69 篇三段式组件文档与 4 篇整合指南；移除 `miuui/docs/design-rules.md` 与 `miuui/docs/migration.md`（统一收归 `website/guide/architecture.md` 与 `website/guide/release.md` 维护）。
- **全量验证**：`pnpm check` 10 项门禁全通过（`check:compat` 校验 102 个 Reka UI 原语；`vitest` 24 个测试文件 / 240 项单测通过；单 `Button` 产物 `33575 B` raw / `9989 B` gzip，`PlusIcon` `127 B` raw / `135 B` gzip）。

## [0.8.2] - 2026-11-25

### 增强（Enhancements）

- **`ThemeProvider` 全局图片解析注入（`imageResolver`）**：新增 `imageResolver?: (url: string) => string | Promise<string>` Prop 与 `MIU_IMAGE_RESOLVER_KEY` / `useMiuImageResolver()` / `useResolvedImageSrc()`；`Image`（支持 `lazy` 视口触发）、`Avatar`、`HeroHeader`（含模糊背景 `backdrop` 与封面）、`ImageGroup` 与 `ImagePreview`（含舞台大图 `thumb` 即时占位与底部缩略图栏）全部自动经由该钩子解析图片地址，解析失败时自动回退原始 URL，未配置时零开销同步透传。
- **独立托管动效开关（`respectReducedMotion`）**：`ThemeProvider` 新增 `respectReducedMotion?: boolean`（默认 `true`），桌面端等显式托管 `motionTier` 的宿主可设为 `false`（输出 `data-respect-reduced-motion="false"`），避免因操作系统关闭窗口动画（`prefers-reduced-motion: reduce`）导致 `ImagePreview` FLIP 放大与 `Tabs` / `SegmentedControl` / `RadioGroup` 滑块指示器动画被静默禁用。
- **测试与发布**：新增 `v082.test.ts` 覆盖全局图片解析、缩略图占位回退与 `respectReducedMotion` 行为。

## [0.8.1] - 2026-11-25

### 增强（Enhancements）

- **`ThemeProvider` 浮层层级控制**：新增 `ZIndexLayer` 类型及 `zIndexOffset?: number`、`zIndex?: Partial<Record<ZIndexLayer, number>>` Props，支持通过统一偏移量或按层覆写内建 `--miu-z-*` 令牌，减少桌面端宿主手工重写全部层级变量的样板代码。
- **`PageLayout` & `EmptyState` 桌面满高填充**：两者新增 `fill?: boolean` Prop（`.miu-page-layout--fill` 与 `.miu-empty-state--fill`），提供桌面页最小满屏高度、内容区纵向弹性布局、顶部 `Tabs` / `CategoryFilter` 防压缩以及空状态自动居中撑满能力。
- **`PopupPanel` 页脚显式交互语义**：新增 `footerClickable?: boolean`（默认 `false`），开启时以原生 `<button type="button">` 渲染页脚并触发 `footerClick`（支持键盘 Tab 与焦点环），未开启时保持无点击监听的普通 `<div>`。
- **`CategoryFilter` 多维筛选与空折叠优化**：新增 `"filters"` 语义区域及 `#filters` 插槽，用于同一过滤栏下追加独立条件筛选（如频道 + 地区）；当所有分组均无 `subtags` 时自动跳过空 `<Collapse>` 渲染。
- **测试与工具链同步**：补充 `v081.test.ts` 覆盖上述新能力，同步更新 `vue`、`vitest`、`oxlint`、`oxfmt` 等开发依赖（保留 `typescript` `^6.0.3`）。

## [0.8.0] - 2026-11-24

### 新增组件（New Components）

- **`MediaCard`（`MiuMediaCard`）**：新增通用媒体展示卡片，支持 `vertical` / `horizontal` 布局、`square` / `video` / `circle` 比例、四角徽章插槽（`#top-start`、`#top-end`、`#bottom-start`、`#bottom-end`）、`#cover` 自定义封面与 `#action` 悬浮操作定位（`bottom-end` / `center`）、`lines` 标题截断、`loading` 骨架态及无障碍拉伸触发按钮。
- **`HeroHeader` / `PopupPanel` / `Scrollbar` / `VerticalSlider`**：将详情页头图头部、轻量弹出面板容器、绑定式悬浮滚动条以及离散/连续双模式纵向滑块（支持 `centerZero` 双向居中刻度）正式纳入 `@xcmm1543/miuui-vue`。

### 增强（Enhancements）

- **`Progress` 环形进度形态**：`Progress` 新增 `shape?: "line" | "circle"` 与 `thickness?: number`，支持以 `ProgressRoot` 为无障碍语义核心的 SVG 环形进度指示器与中心 `#default` / `showValue` 展示。
- **`Popover` 虚拟锚点、焦点控制与自适应高度**：`Popover` 新增 `reference?: PopoverReference | null`（基于 `PopoverAnchor` 支持 DOM 或虚拟参考坐标）、`alignOffset`、`collisionPadding`、`autoMaxHeight` 与 `autoFocus`，可省略 `#trigger` 插槽独立受控弹出。
- **WAAPI FLIP 动效升级**：`ImagePreview` 新增 `originRect?: ImagePreviewOriginRect | null` 并配合新增辅助函数 `captureOriginRect()` 实现缩放收回动效（`Image` / `ImageGroup` / `HeroHeader` 自动采集原点）；`useSlidingIndicator` 升级为基于 WAAPI FLIP 的平滑滑块追踪并新增 `setIndicatorRef`。
- **`DropdownMenu` / `ContextMenu` 子菜单支持**：`MenuItem` 新增可选 `children?: MenuItem[]`，自动渲染 Reka `SubTrigger` 与便携子菜单浮层。
- **材质与视觉变体扩充**：`Button` / `IconButton` 新增 `aurora` 高对比度深色玻璃覆盖层材质（适配图片封面叠加按钮），`Badge` 新增高对比度 `media` 悬浮徽章变体；全局遮罩背景滤镜提取为 `--miu-overlay-backdrop-filter`（默认 `blur(var(--miu-space-2))`），便于上层主题按规范覆写。

## [0.7.0] - 2026-11-20

### 重构（Refactoring）

- **正交基础设施与 Composables 拆分**：将 `@xcmm1543/miuui-vue` 共享逻辑拆分为职责单一的文件（`useControlSize.ts`、`useFormField.ts` 含 `useFormFieldBinding` 与 `labelId`、`useListContext.ts` 含 `provideListDensity` / `useListDensity`、`useMounted.ts`、`useScrollLock.ts`、`useDocumentKeydown.ts`、`useFloatingPopover.ts`、`useMiuIcons.ts`、`useSlidingIndicator.ts`）并从包入口统一导出。
- **样式按功能域模块化**：将单体 `packages/vue/src/components.css` 拆分为 `packages/vue/src/styles/` 下按域划分的样式文件（如 `00-foundation.css`、`01-interactive.css` 等）并通过 `@import` 清单由 `scripts/build-packages.mjs` 内联打包；`@xcmm1543/miuui-vue/style.css` 与 `@xcmm1543/miuui-vue/components.css` 对外入口保持兼容。
- **浮层层级与确认流重构**：`@xcmm1543/miuui-tokens` `Z_INDEX` 新增 `loading: 1075`（严格位于 `tooltip (1070)` 与 `toast (1080)` 之间）；全屏 `LoadingOverlay` 绑定 `--miu-z-loading`，`ToastViewport` 使用 `isPrimaryToastViewport` 与 `useMounted()` 防止重复挂载，非模态/模态关闭统一经由受控取消链路。
- **内部冗余导出清理**：移除 `@xcmm1543/miuui-core` 中未使用的 `SemanticRegionMap`、`SizeContext`，`@xcmm1543/miuui-tokens` 中未使用的 `withAlpha`、`CONTROL_HEIGHT_BY_DENSITY`、`shadowToCss`，以及 `@xcmm1543/miuui-materials` 中的内部函数 `tokensFor`。

### 统一（Standardization & Unification）

- **正交设计维度对齐**：全库统一使用 `size`、`iconSize`、`radius`、`material`、`density`、`disabled`、`readonly`、`invalid`、`loading`、`clearable` 与 `IconProp`（`IconName | IconDefinition`）；`CategoryFilter`、`Select`、`PillGroup`、`MessageComposer` 等均接入 `useControlSize()` 与 `useFormFieldBinding()`。
- **交互状态与 `:focus-visible` 令牌化**：统一 `[data-disabled]`（`--miu-opacity-disabled`）、`[data-readonly]`、`[data-invalid]` 与可聚焦控件的 `:focus-visible` 焦点环及 `--miu-glass-filter-*` 表面映射（`solid` 局部子树在 `<ThemeProvider material="glass">` 等场景可独立覆写），并保持全仓库零硬编码样式门禁通过。
- **语义区域 1:1 契约补全**：校准 `Input`（`toggle`、`count`）、`Textarea`（`count`、`clear`）、`Select`（`clear`）、`ImagePreview`（`content`）、`Popconfirm`（`arrow`）、`CategoryFilter`（`actions`）、`Drawer` / `CommandPalette`（移除无效 `root`）与 `IconButton`（`"root" | "icon" | "spinner"`），所有 `ComponentSemanticProps` 区域均在模板与测试中达成 1:1 绑定。
- **内置 Locale 键补全**：`@xcmm1543/miuui-core` 在 `zh-CN` 与 `en-US` 内置词典中新增 `common.select`、`truncate.expand`、`truncate.collapse`、`pillGroup.all`，消除组件内硬编码中英文按钮文案。

### 移除（Removals）

- **破坏性清理（Direct Removals in 0.7.0）**：直接移除全部 11 个历史冗余/别名 Props、`ListItem` `#suffix` 插槽以及 `@xcmm1543/miuui-codemod` 包（仓库收敛为 6 个发布包），详见 [`website/guide/release.md`](../website/guide/release.md)：
  - `IconProps.icon` -> `name`（`name: IconProp`）
  - `ButtonBaseProps.pill` / `BadgeProps.pill` / `SegmentedControlProps.pill` -> `radius="full"`
  - `IconButtonProps.shape` -> `radius="full"` / `radius`（同时在 `IconButtonProps` 中剔除无效继承字段 `iconRight` 与 `pill`）
  - `FormRowProps.dense` / `ListItemProps.dense` -> `density="compact"`
  - `ListItem` `#suffix` 插槽 -> `#actions`
  - `MessageComposerProps.compact` -> `density="compact"`
  - `HelpTooltipProps.size` -> `iconSize`
  - `CategoryFilterProps.allowDeselect` -> `clearable`
  - `ImageProps.cover` -> `fit="cover"` + 显式宽高
  - `@xcmm1543/miuui-codemod`（`packages/codemod/`）：随 0.7.0 直接移除旧版 API 一并删除，不再维护独立迁移工具包

### 修复（Fixes）

- **确认浮层与中止路径**：修复 `ConfirmDialog`、`Popconfirm` 与 `ThemeProvider`（`useConfirm()`）在 `loading=true` 异步提交时可被遮罩点击/ESC/关闭按钮静默关闭的问题，统一在取消时 emit `cancel`；修复 `MessageComposer` 在 `loading=true` 时误禁用 Cancel 中止按钮导致流式响应无法取消的问题。
- **无障碍与 IME 保护**：修复 `Collapse` 关闭态焦点可落入不可见元素的问题（绑定 `:inert`）；修复 `Breadcrumb` / `Toc` / `NavMenu` 空数据时渲染空 `<nav>` 噪音的问题；修复 `Input` / `MessageComposer` 中文输入法组词期间按 `Enter` 误提交（新增 `!event.isComposing` 守卫）；修复 `Popover` `disabled` 属性未阻断弹出层打开的问题；补齐 `IconButton` / `FormField` / `Breadcrumb` / `Toc` 的 ARIA 属性与焦点恢复。
- **门禁验证**：全量 10 项 `pnpm check` 门禁通过（`check:compat` 覆盖 18 组件 / 64 Reka UI 原语；17 个测试文件 / 200 项单测通过；单 `Button` 产物 32,821 B raw / 9,712 B gzip，`PlusIcon` 127 B raw / 135 B gzip）。

## [0.6.2] - 2026-11-19

### Fixed

- **`Textarea` 材质插件解析与透传**：引入 `useResolvedMaterial` 与 `mergeStyle`，对齐 `Input` 的三档材质解析、`materialTokens` 注入与 `[data-material]` 属性继承。
- **输入框玻璃高光与边框阴影优化**：为 `.miu-input[data-material]` 与 `.miu-textarea[data-material]` 补全显式边框、`backdrop-filter` / `-webkit-backdrop-filter` 与内嵌边缘高光（`--miu-material-highlight`），增强 `:focus-within` 聚焦态层次感。

## [0.6.0] - 2026-11-17

### Added
- **4 new components** (55 → 59 total) for media/desktop app migration:
  - `ImagePreview`: Standalone multi-image lightbox built on Reka UI `Dialog` with keyboard Left/Right/Esc navigation, counter badge, thumbnail dock, and `#actions` slot.
  - `ImageGroup`: Responsive 1 / 2×2 quad / 3×3 grid built on `Image` and `ImagePreview` with `maxDisplay` and `+N` overflow badge.
  - `CategoryFilter`: Two-level collapsible category filter built on `Tabs`, `Collapse`, and `PillGroup`.
  - `PageLayout`: Page shell container built on `PageHeader` with `contentMaxWidth`, `contentAlign`, `fitHeight`, and `#actions` / `#header-extra` slots.
- **`@xcmm1543/miuui-icons`**: Added 47 C-style rounded UI, window, navigation, and media icons (75 total across `index` & `dynamic`: `home`, `calendar`, `libraryMusic`, `barChart`, `radio`, `playlist`, `video`, `notebook`, `folder`, `cloud`, `history`, `menu`, `moreHorizontal`, `monitor`, `phone`, `lock`, `logout`, `qrCode`, `album`, `musicNote`, `queue`, `cassette`, `vinyl`, `timer`, `translate`, `sparkles`, `refresh`, `checkCircle`, `infoCircle`, `smile`, `send`, `thumbsUp`, `pin`, `pinFilled`, `comment`, `message`, `minimize`, `maximize`, `maximizeRestore`, `dragHandle`, `fontSize`, `chevronLeft`, `chevronRight`, `chevronUp`, `chevronDown`, `volumeLow`, `repeatOne`).

### Changed
- **`Icon`**: Added `icon?: IconDefinition` prop and numeric `size` support (`IconSize | number`).
- **`Button`**: Added `pill` prop (`radius="full"` shorthand).
- **`IconButton`**: Added `active`, `shape` (`"circle" | "squircle"`), and `title`/`ariaLabel` support.
- **`Tabs`**: Added `loading` skeleton state (with matching `.miu-tabs__list` / pill skeleton proportions), `variant="segmented"` capsule mode, and `@change` emit.
- **`SegmentedControl`**: Added `pill`, `block`, `clearable`, `@change` emit, and `color` / `locked` option metadata.
- **`TruncateText`**: Added `expandMode="popover"` with viewport-clamped glass hover popover, text selection guard, and wheel scroll isolation.
- **`Toast` & `ThemeProvider`**: Added `styleVariant="pill"`, click-to-dismiss, `ThemeProvider` `icons` registry override, and `.miu-section-header` / `FormRow` `variant="card"` / `CategoryFilter` `#actions` enhancements.
- **Unified Glass Material System**: Added multi-tier `--miu-glass-*` filter, surface, hairline, specular, sheen, well, and hover tokens across `@xcmm1543/miuui-tokens` and `@xcmm1543/miuui-materials` (`glass` / `mica` / `solid`).
- **`Avatar`**: Added `shape="squircle"`, `bordered`, `clickable`, `fallbackIcon`, and `@click` emit.
- **`Image`**: Added `cover` prop and applied computed `imgStyle` (`objectFit`).
- **`MessageComposer`**: Added `#tools` slot, `compact`, `showCount`, `showCancel`, `cancelLabel`, `@cancel`, and Enter-to-send with IME composition guard.

## [0.5.6] - 2026-11-16

### Changed
- **Package scope**: Renamed workspace packages to `@xcmm1543/miuui-*` (`core`, `tokens`, `icons`, `materials`, `motions`, `vue`, `codemod`) for publishing under the `xcmm1543` npm scope.
- **npm release readiness**: Replaced local `file:../...` inter-package dependencies with `workspace:^` so `pnpm publish` resolves SemVer ranges across `@xcmm1543/miuui-*` packages.
- **Package metadata**: Added `publishConfig.access: "public"`, `repository`, `homepage`, `bugs`, per-package `README.md` files, and root `release:dry` / `release:publish` scripts across all 7 workspace packages.

## [0.5.5] - 2026-11-14

### Fixed
- **`@xcmm1543/miuui-vue` exports**: Exported `ConfirmDialog` directly from `@xcmm1543/miuui-vue` entry alongside its `packages/vue/src/plugin.ts` registration (55/55 components exported).
- **`Popover` arrow material inheritance**: Added `[data-material]` fill alignment for `.miu-popover__arrow` so `mica`/`glass` popovers match their arrow surface.

## [0.5.4] - 2026-11-14

### Fixed
- **`Tooltip` & `HelpTooltip`**: Inherited `ThemeProvider`'s active `[data-material]` (`solid` / `mica` / `glass`) surface, border, text, backdrop blur, and glass specular rim automatically even when `:material` is not explicitly passed on individual tooltips.

## [0.5.3] - 2026-11-14

### Changed
- **`Badge` surface-adaptive palette & high-chroma dark tones**: Switched base badge tints from mixing against `--miu-color-bg-surface` to `transparent` so badges blend cleanly on any card surface, and raised dark-mode semantic chroma (`--miu-*-500/600` mixed with white) for crisp Emerald, Amber, Rose, and Sky tones.

## [0.5.2] - 2026-11-13

### Changed
- **`Badge` modern OKLCH tinted palette**: Replaced heavy dark semantic fills with airy OKLCH tinted surfaces (`color-mix`), crisp matching hairline borders, and WCAG AA-verified foreground tones across `solid`, `mica`, and `glass` materials in both light and dark modes.

## [0.5.1] - 2026-11-13

### Fixed
- **`Badge`**: Added full three-tier material resolution (`solid` / `mica` / `glass`) via `useResolvedMaterial` and dedicated `mica` / `glass` translucent surfaces & borders across all 6 semantic variants (`neutral`, `primary`, `success`, `warning`, `danger`, `info`).
- **`ColorPicker`**: Removed native `<input type="color">` inner swatch wrapper padding and default bevel border so the chosen color fills the rounded swatch edge-to-edge.

## [0.5.0] - 2026-11-13

### Added
- **5 new components** (50 → 55 total):
  - `Collapse`: CSS grid height expand/collapse container (`open` prop, `reduced`/`none` motion aware).
  - `ColorPicker`: Native color input + hex text field + preset swatch selector with active checkmark.
  - `List` & `ListItem`: Structured list container (`gap`, `bordered`, `dividers`) and interactive row (`title`, `subtitle`, `active`, `clickable`, `dense`, `#prefix`/`#badges`/`#actions` slots).
  - `HelpTooltip`: Accessible `?` info trigger (`help` icon in `@xcmm1543/miuui-icons`) wrapping `Tooltip`.
- **`@xcmm1543/miuui-icons`**: Added `help` (`HelpIcon`) across index & dynamic exports.
- **Enhancements to existing components**:
  - `Button`: Added `"tonal"` variant and `iconRight` prop.
  - `Badge`: Added `pulse` prop with pinging status indicator (paused under `reduced`/`none` motion tiers).
  - `Image`: Added `pixelated` rendering mode and `fallbackSrc` fallback URL before `#fallback`.
  - `Pagination`: Added `hasNext` and `loading` support for cursor/unknown-total numeric mode.
  - `Tabs` & `PageHeader`: Added `#trigger` slot on `Tabs` and `#lead` slot on `PageHeader`.

### Fixed
- Aligned `RadioGroup` (`variant="button"`) layout, bound `Image` hover scale to `--miu-motion-scale-hover`, and scoped `LoadingOverlay` portal rendering.

## [0.4.1] - 2026-11-13

### Fixed
- **`Tooltip`**: Isolated scrollable text inside `.miu-tooltip__body` while keeping `.miu-tooltip__arrow` outside the scroll container, eliminating false vertical scrollbars on short tooltips and preventing arrow clipping.
- **`Drawer` & `CommandPalette`**: Unified overlay `backdrop-filter: blur(var(--miu-space-2))` with `Dialog` so all modal backdrops share identical frosted dimming.

## [0.4.0] - 2026-11-13

### Added
- **6 new components** (44 → 50 total):
  - Form & input controls: `RadioGroup` (`radio` & `button` variants), `Progress` (determinate/indeterminate), `NumberInput` (step/precision/clamping).
  - Overlays & media: `Popconfirm`, `Image` (fallback + lightbox preview), `LoadingOverlay` (inline + fullscreen teleport), plus `useConfirm()` composable and `toast.success` / `error` / `warning` / `info` shorthand helpers.
- **Unified spring motion language across all 50 components**:
  - Added sliding active indicator (`ResizeObserver` + `translate3d`) to `Tabs` (`underline` & `pills`) and `RadioGroup` (`variant="button"`), matching `SegmentedControl`.
  - Added gentle breathing float (`@keyframes miu-float`) to `EmptyState` icon with automatic pause in `@xcmm1543/miuui-motions` for `reduced` / `none` / `prefers-reduced-motion`.
  - Unified `--miu-motion-ease-spring` press & hover transitions across `Select`, `DropdownMenu`, `ContextMenu`, `CommandPalette`, `FormRow`, `Pill`, `ToastViewport` actions, `Image`, `LoadingOverlay`, `Avatar`, `Badge`, `Table`, `Pagination`, `NumberInput`, `Slider`, `Toc`, `Breadcrumb`, `Kbd`, and `Code`.
- **Enhancements & fixes**:
  - `TruncateText`: `title?: string | false` allows suppressing native browser `title` tooltips when wrapped in custom `<Tooltip>`.
  - `PageHeader`: opt-in `divider` prop (borderless by default).
  - `Card`: restored hover elevation, primary border glow, and glass/mica surface brightening order after `[data-material]` rules.
  - `Tooltip`: added `max-block-size` scroll containment and opaque light-mode material backdrop contrast.
  - `Input`: password visibility toggle (`eye` / `eyeOff` icons) and localized i18n strings.
  - `Pagination`: added `numeric` page bar mode (`total`, `page`, `pageSize`, `showPageSize`, `showQuickJumper`).

### Verified
- `pnpm check` (DTCG token validation, Reka UI compat matrix, Oxlint, hard-coded CSS & physical property lint, Oxfmt, `vue-tsc`, workspace build, bundle size gate, 136 unit tests across 13 files).
- `pnpm test:coverage` (~94.5% statements / ~85.6% branches) and `pnpm check:visual` (Playwright screenshot matrix, `axe-core` contrast, `motionTier=none`, keyboard E2E).

## [0.3.0] - 2026-11-13

### Changed
- Refined dark-mode 5-tier surface hierarchy (`--miu-color-bg-overlay`, `--miu-color-bg-muted`), added `--miu-color-specular` / `--miu-color-primary-specular` top highlights and layered `--miu-shadow-1`..`--miu-shadow-5` shadows across `@xcmm1543/miuui-tokens` & `@xcmm1543/miuui-vue`.
- Polished visual proportions and styling for `Switch`, `SegmentedControl`, `Badge`, `Code`, `Kbd`, and `NavMenu`, and updated component visual baselines.

## [0.2.0] - 2026-11-12

### Added
- **2 new components** (42 → 44 total): `Slider` and `PillGroup`.
- **Dynamic OKLCH Seed Palette**: Added `semanticTokensForSeed()` in `@xcmm1543/miuui-tokens` and `accentSeed` prop on `ThemeProvider`.
- **Icons & Codemod**: Expanded `@xcmm1543/miuui-icons` to 28 icons with `/dynamic` and `/brand` subpath exports; added `@xcmm1543/miuui-codemod` package.
- **Runtime & Quality Gates**: Added `usePluginResolution` (`MiuRegistry` runtime material/motion resolution), `scripts/check-reka-compat.mjs` + `docs/adr/0001-reka-ui-compatibility.md`, `scripts/check-hardcoded.mjs` CSS logical property lint, and floating pill scrollbar tokens.
- **Component enhancements**: `Input` `showCount`, `Dialog` width variants, `Tabs` `align` (`start` / `center` / `end`), `TruncateText` `expandable` toggle, and `FormRow` deprecation path toward `FormField`.

## [0.1.0] - 2026-11-12

### Added
- Initial monorepo foundation (`@miuui/core`, `@miuui/tokens`, `@miuui/icons`, `@miuui/materials`, `@miuui/motions`, `@miuui/vue`; later scoped to `@xcmm1543/miuui-*` in `0.5.6`) with 42 core & shell components, Precision Violet OKLCH palette (`VIOLET_SEED`), 4-layer design tokens, `solid` / `mica` / `glass` materials, and `full` / `reduced` / `none` motion tiers.
