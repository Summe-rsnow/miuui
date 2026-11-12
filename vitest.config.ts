import { fileURLToPath, URL } from "node:url"
import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@miuui/core": fileURLToPath(new URL("./packages/core/src", import.meta.url)),
      "@miuui/tokens": fileURLToPath(new URL("./packages/tokens/src", import.meta.url)),
      "@miuui/icons/dynamic": fileURLToPath(
        new URL("./packages/icons/src/dynamic.ts", import.meta.url),
      ),
      "@miuui/icons/brand": fileURLToPath(
        new URL("./packages/icons/src/brand.ts", import.meta.url),
      ),
      "@miuui/icons": fileURLToPath(new URL("./packages/icons/src", import.meta.url)),
      "@miuui/materials": fileURLToPath(new URL("./packages/materials/src", import.meta.url)),
      "@miuui/motions": fileURLToPath(new URL("./packages/motions/src", import.meta.url)),
      "@miuui/vue": fileURLToPath(new URL("./packages/vue/src", import.meta.url)),
      "@miuui/codemod": fileURLToPath(new URL("./packages/codemod/src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    include: ["packages/**/*.test.ts"],
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "packages/core/src/**/*.ts",
        "packages/tokens/src/**/*.ts",
        "packages/vue/src/**/*.ts",
        "packages/vue/src/**/*.vue",
        "packages/codemod/src/**/*.ts",
      ],
      exclude: ["**/*.test.ts", "**/generated/**", "**/index.ts"],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
})
