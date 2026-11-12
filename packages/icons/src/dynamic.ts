import type { IconDefinition, IconName } from "./index"

const iconLoaders: Record<IconName, () => Promise<IconDefinition>> = {
  search: () => import("./index").then((m) => m.SearchIcon),
  plus: () => import("./index").then((m) => m.PlusIcon),
  check: () => import("./index").then((m) => m.CheckIcon),
  close: () => import("./index").then((m) => m.CloseIcon),
  chevron: () => import("./index").then((m) => m.ChevronIcon),
  settings: () => import("./index").then((m) => m.SettingsIcon),
  user: () => import("./index").then((m) => m.UserIcon),
  bell: () => import("./index").then((m) => m.BellIcon),
  play: () => import("./index").then((m) => m.PlayIcon),
  pause: () => import("./index").then((m) => m.PauseIcon),
  skipForward: () => import("./index").then((m) => m.SkipForwardIcon),
  skipBackward: () => import("./index").then((m) => m.SkipBackwardIcon),
  heart: () => import("./index").then((m) => m.HeartIcon),
  heartFilled: () => import("./index").then((m) => m.HeartFilledIcon),
  volumeHigh: () => import("./index").then((m) => m.VolumeHighIcon),
  volumeOff: () => import("./index").then((m) => m.VolumeOffIcon),
  repeat: () => import("./index").then((m) => m.RepeatIcon),
  shuffle: () => import("./index").then((m) => m.ShuffleIcon),
  moon: () => import("./index").then((m) => m.MoonIcon),
  sun: () => import("./index").then((m) => m.SunIcon),
  download: () => import("./index").then((m) => m.DownloadIcon),
  share: () => import("./index").then((m) => m.ShareIcon),
  edit: () => import("./index").then((m) => m.EditIcon),
  trash: () => import("./index").then((m) => m.TrashIcon),
}

export function hasIcon(name: string): name is IconName {
  return Object.hasOwn(iconLoaders, name)
}

export async function loadIcon(name: IconName): Promise<IconDefinition | undefined> {
  if (!hasIcon(name)) return undefined
  return iconLoaders[name]()
}
