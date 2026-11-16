# Changelog

All notable changes to `@xcmm1543/miuui-*` are documented in this file.

## [0.5.6] - 2026-11-16

### Changed
- **Package scope**: Renamed workspace packages to `@xcmm1543/miuui-*` (`core`, `tokens`, `icons`, `materials`, `motions`, `vue`, `codemod`) for publishing under the `xcmm1543` npm scope.
- **npm release readiness**: Replaced local `file:../...` inter-package dependencies with `workspace:^` so `pnpm publish` resolves SemVer ranges across `@xcmm1543/miuui-*` packages.
- **Package metadata**: Added `publishConfig.access: "public"`, `repository`, `homepage`, `bugs`, per-package `README.md` files, and root `release:dry` / `release:publish` scripts across all 7 workspace packages.

## [0.5.5] - 2026-11-14

### Fixed
- **`@xcmm1543/miuui-vue` exports**: Exported `ConfirmDialog` directly from `@xcmm1543/miuui-vue` entry alongside its `plugin.ts` registration (55/55 components exported).
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

## [0.4.1] - 2026-11-13

### Fixed
- **`Tooltip`**: Isolated scrollable text inside `.miu-tooltip__body` while keeping `.miu-tooltip__arrow` outside the scroll container, eliminating false vertical scrollbars on short tooltips and preventing arrow clipping.
- **`Drawer` & `CommandPalette`**: Unified overlay `backdrop-filter: blur(var(--miu-space-2))` with `Dialog` so all modal backdrops share identical frosted dimming.

## [0.4.0] - 2026-11-13

### Added
- **23 new components** completing the 50-component catalog:
  - Form & input controls: `RadioGroup` (`radio` & `button` variants), `Slider` (horizontal/vertical, single/range), `Progress` (determinate/indeterminate), `NumberInput` (step/precision/clamping).
  - Overlays & media: `Popconfirm`, `Image` (fallback + lightbox preview), `LoadingOverlay` (inline + fullscreen teleport), plus `toast.success` / `error` / `warning` / `info` shorthand helpers.
  - Navigation & layout primitives (`AppBar`, `SideNav` / `NavMenu`, `Breadcrumb`, `Toc`, `Pagination` numeric + link modes, `SectionHeader`, `PageHeader`, `EmptyState`, `Skeleton`, `Spinner`, `Avatar`, `Badge`, `Card`, `Pill`, `PillGroup`, `Alert`, `Code`, `Kbd`, `CommandPalette`, `ContextMenu`, `DropdownMenu`, `Drawer`, `Table`, `TruncateText`, `MessageComposer`, `FormRow`).
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

### Verified
- `pnpm check` (DTCG token validation, Reka UI compat matrix, Oxlint, hard-coded CSS & physical property lint, Oxfmt, `vue-tsc`, workspace build, bundle size gate, 136 unit tests across 13 files).
- `pnpm test:coverage` (~94.5% statements / ~85.6% branches) and `pnpm check:visual` (Playwright screenshot matrix, `axe-core` contrast, `motionTier=none`, keyboard E2E).

## [0.3.0] - 2026-11-13

### Added
- Refined OKLCH color scale generation, token export, and component visual baselines across light/dark/mica/glass themes.

## [0.2.0] - 2026-11-13

### Added
- `Input` `showCount`, `Dialog` width variants, `Tabs` alignment (`start` / `center` / `end`), `TruncateText` expandable toggle, and `FormRow` deprecation path toward `FormField`.

## [0.1.0] - 2026-11-13

### Added
- Initial monorepo foundation: `@xcmm1543/miuui-core`, `@xcmm1543/miuui-tokens`, `@xcmm1543/miuui-icons`, `@xcmm1543/miuui-materials`, `@xcmm1543/miuui-motions`, `@xcmm1543/miuui-vue`, and `@xcmm1543/miuui-codemod`.
