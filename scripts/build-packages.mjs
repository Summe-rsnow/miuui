import { execFileSync } from "node:child_process"
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import vue from "@vitejs/plugin-vue"
import { build } from "vite"

function bundleCssImports(entryPath, seen = new Set()) {
  const abs = resolve(entryPath)
  if (seen.has(abs)) return ""
  seen.add(abs)
  const dir = dirname(abs)
  const source = readFileSync(abs, "utf8")
  return source.replace(/^\s*@import\s+["']([^"']+)["']\s*;\s*$/gm, (_, rel) => {
    if (!rel.startsWith(".")) return `@import "${rel}";`
    return `${bundleCssImports(resolve(dir, rel), seen).trimEnd()}\n`
  })
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const require = createRequire(import.meta.url)

const binEntries = {
  oxnode: require.resolve("@oxc-node/cli/dist/index.js"),
  tsc: require.resolve("typescript/bin/tsc"),
  "vue-tsc": require.resolve("vue-tsc/bin/vue-tsc.js"),
}

function runBin(name, args, cwd) {
  execFileSync(process.execPath, [binEntries[name], ...args], {
    cwd,
    stdio: "inherit",
  })
}

const packages = [
  {
    name: "tokens",
    vue: false,
    typeCmd: "tsc",
    prebuild: () => runBin("oxnode", ["scripts/build.ts"], resolve(root, "packages/tokens")),
    assets: [
      ["src/generated/tokens.css", "dist/tokens.css"],
      ["src/generated/tokens.dtcg.json", "dist/tokens.dtcg.json"],
    ],
  },
  {
    name: "icons",
    vue: false,
    typeCmd: "tsc",
    entries: {
      index: "src/index.ts",
      dynamic: "src/dynamic.ts",
      brand: "src/brand.ts",
    },
    assets: [],
  },
  {
    name: "core",
    vue: false,
    typeCmd: "tsc",
    assets: [],
  },
  {
    name: "materials",
    vue: false,
    typeCmd: "tsc",
    assets: [["src/style.css", "dist/style.css"]],
  },
  {
    name: "motions",
    vue: false,
    typeCmd: "tsc",
    assets: [["src/style.css", "dist/style.css"]],
  },
  {
    name: "vue",
    vue: true,
    typeCmd: "vue-tsc",
    assets: [["src/style.css", "dist/style.css"]],
    bundleCss: [["src/components.css", "dist/components.css"]],
  },
]

const filter = process.argv.slice(2)
const targets = filter.length > 0 ? packages.filter((pkg) => filter.includes(pkg.name)) : packages

if (targets.length === 0) {
  console.error(`Unknown package filter: ${filter.join(", ")}`)
  process.exit(1)
}

for (const pkg of targets) {
  const pkgDir = resolve(root, "packages", pkg.name)
  const distDir = resolve(pkgDir, "dist")

  if (pkg.prebuild) pkg.prebuild()
  rmSync(distDir, { recursive: true, force: true })

  await build({
    configFile: false,
    logLevel: "warn",
    plugins: pkg.vue ? [vue()] : [],
    build: {
      target: ["chrome111", "edge111", "firefox113", "safari15.4"],
      outDir: distDir,
      emptyOutDir: true,
      minify: false,
      lib: {
        entry: pkg.entries
          ? Object.fromEntries(Object.entries(pkg.entries).map(([k, v]) => [k, resolve(pkgDir, v)]))
          : resolve(pkgDir, "src/index.ts"),
        formats: ["es"],
      },
      rollupOptions: {
        external: (id) =>
          id === "vue" ||
          id === "reka-ui" ||
          id.startsWith("reka-ui/") ||
          id.startsWith("@xcmm1543/miuui-"),
        output: {
          format: "es",
          preserveModules: true,
          preserveModulesRoot: resolve(pkgDir, "src"),
          entryFileNames: "[name].js",
        },
      },
    },
  })

  runBin(pkg.typeCmd, ["-p", "tsconfig.build.json"], pkgDir)

  for (const [from, to] of pkg.assets) {
    const dest = resolve(pkgDir, to)
    mkdirSync(dirname(dest), { recursive: true })
    copyFileSync(resolve(pkgDir, from), dest)
  }

  for (const [from, to] of pkg.bundleCss ?? []) {
    const dest = resolve(pkgDir, to)
    mkdirSync(dirname(dest), { recursive: true })
    const bundled = bundleCssImports(resolve(pkgDir, from)).trimEnd()
    writeFileSync(dest, `${bundled}\n`, "utf8")
  }

  console.log(`Built @xcmm1543/miuui-${pkg.name} -> dist/`)
}
