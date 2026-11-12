import type { MaterialName, MotionTier } from "./types"
import type { ThemeContext } from "./theme"

export interface MaterialPlugin {
  name: MaterialName
  generateTokens(theme: ThemeContext, motionTier: string): Record<string, string>
  fallback: string | null
  fallbackCondition?: string
}

export type LoopAnimationPolicy = "play" | "pause" | "replace-static"

export interface MotionTierPlugin {
  name: MotionTier
  getTokenOverrides(): Record<string, string>
  getLoopAnimationPolicy(): LoopAnimationPolicy
}

export interface FrameworkAdapter {
  name: string
  version: string
  peerRange: Record<string, string>
}

export interface MaterialResolution {
  requested: string
  plugin: MaterialPlugin | undefined
  chain: string[]
  fallbackUsed: boolean
}

export interface MotionResolution {
  requested: string
  plugin: MotionTierPlugin | undefined
  chain: string[]
  fallbackUsed: boolean
}

export class MiuRegistry {
  private readonly materials = new Map<string, MaterialPlugin>()
  private readonly motions = new Map<string, MotionTierPlugin>()
  private readonly adapters = new Map<string, FrameworkAdapter>()

  registerMaterial(plugin: MaterialPlugin): void {
    this.materials.set(plugin.name, plugin)
  }

  registerMotionTier(plugin: MotionTierPlugin): void {
    this.motions.set(plugin.name, plugin)
  }

  registerAdapter(adapter: FrameworkAdapter): void {
    this.adapters.set(adapter.name, adapter)
  }

  getMaterial(name: string): MaterialPlugin | undefined {
    return this.materials.get(name)
  }

  getMotionTier(name: string): MotionTierPlugin | undefined {
    return this.motions.get(name)
  }

  getAdapter(name: string): FrameworkAdapter | undefined {
    return this.adapters.get(name)
  }

  resolveMaterial(name: string): MaterialResolution {
    const requested = this.materials.get(name)

    if (!requested) {
      const baseline = this.materials.get("solid")
      return {
        requested: name,
        plugin: baseline,
        chain: baseline ? ["solid"] : [],
        fallbackUsed: name !== "solid",
      }
    }

    const chain: string[] = [requested.name]
    let cursor: MaterialPlugin | undefined = requested

    while (cursor?.fallback && !chain.includes(cursor.fallback)) {
      const next = this.materials.get(cursor.fallback)
      if (!next) break
      chain.push(next.name)
      cursor = next
    }

    return {
      requested: name,
      plugin: requested,
      chain,
      fallbackUsed: false,
    }
  }

  resolveMotionTier(name: string): MotionResolution {
    const requested = this.motions.get(name)

    if (!requested) {
      const baseline = this.motions.get("full")
      return {
        requested: name,
        plugin: baseline,
        chain: baseline ? ["full"] : [],
        fallbackUsed: name !== "full",
      }
    }

    return {
      requested: name,
      plugin: requested,
      chain: requested.name === "full" ? ["full"] : [requested.name, "full"],
      fallbackUsed: false,
    }
  }
}

export const registry = new MiuRegistry()

export function registerMaterial(plugin: MaterialPlugin): void {
  registry.registerMaterial(plugin)
}

export function registerMotionTier(plugin: MotionTierPlugin): void {
  registry.registerMotionTier(plugin)
}

export function registerAdapter(adapter: FrameworkAdapter): void {
  registry.registerAdapter(adapter)
}
