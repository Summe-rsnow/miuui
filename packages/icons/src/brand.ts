export interface BrandMarkDefinition {
  name: string
  viewBox: string
  content: string
}

/**
 * Multi-layer Precision Violet squircle mark isolated to `@miuui/icons/brand`
 * so the main icon entry stays monochrome and tree-shakeable.
 */
export const MiuBrandMark: BrandMarkDefinition = {
  name: "miu-brand",
  viewBox: "0 0 64 64",
  content:
    '<defs><linearGradient id="miu-brand-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#A758EF"/><stop offset="100%" stop-color="#5A2687"/></linearGradient></defs><rect x="4" y="4" width="56" height="56" rx="16" fill="url(#miu-brand-grad)"/><path d="M19 42V22h5v11.5a4.5 4.5 0 0 0 9 0V22h5v20h-5v-2.4a7.5 7.5 0 0 1-9 0V46h-5v-4z" fill="#FCFBFD"/>',
}
