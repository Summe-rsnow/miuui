# Changelog

All notable changes to `@miuui/*` are documented in this file.

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
  - `HelpTooltip`: Accessible `?` info trigger (`help` icon in `@miuui/icons`) wrapping `Tooltip`.
- **`@miuui/icons`**: Added `help` (`HelpIcon`) across index & dynamic exports.
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
  - Added gentle breathing float (`@keyframes miu-float`) to `EmptyState` icon with automatic pause in `@miuui/motions` for `reduced` / `none` / `prefers-reduced-motion`.
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
- Initial monorepo foundation: `@miuui/core`, `@miuui/tokens`, `@miuui/icons`, `@miuui/materials`, `@miuui/motions`, `@miuui/vue`, and `@miuui/codemod`.
