export type IconName =
  | "search"
  | "plus"
  | "check"
  | "close"
  | "chevron"
  | "settings"
  | "user"
  | "bell"
  | "play"
  | "pause"
  | "skipForward"
  | "skipBackward"
  | "heart"
  | "heartFilled"
  | "volumeHigh"
  | "volumeOff"
  | "repeat"
  | "shuffle"
  | "moon"
  | "sun"
  | "download"
  | "share"
  | "edit"
  | "trash"

export interface IconDefinition {
  name: IconName
  viewBox: string
  content: string
  filled?: boolean
}

export const SearchIcon: IconDefinition = {
  name: "search",
  viewBox: "0 0 24 24",
  content: '<circle cx="10.5" cy="10.5" r="6.4"/><path d="M15.3 15.3c1.6 1.6 3.2 3.2 4.7 4.7"/>',
}

export const PlusIcon: IconDefinition = {
  name: "plus",
  viewBox: "0 0 24 24",
  content: '<path d="M12 4.5v15M4.5 12h15"/>',
}

export const CheckIcon: IconDefinition = {
  name: "check",
  viewBox: "0 0 24 24",
  content: '<path d="M4.5 12.5c2 2 3.6 3.8 5 5.5 3.4-4.2 7-8.2 10-11.5"/>',
}

export const CloseIcon: IconDefinition = {
  name: "close",
  viewBox: "0 0 24 24",
  content: '<path d="M6 6c4 4 8 8 12 12M18 6c-4 4-8 8-12 12"/>',
}

export const ChevronIcon: IconDefinition = {
  name: "chevron",
  viewBox: "0 0 24 24",
  content: '<path d="M6.5 9.5c1.8 2 3.7 4 5.5 6 1.8-2 3.7-4 5.5-6"/>',
}

export const SettingsIcon: IconDefinition = {
  name: "settings",
  viewBox: "0 0 24 24",
  content:
    '<path d="M4 6.5h3M14 6.5H20M4 12h7M18 12H20M4 17.5h2M13 17.5H20"/><circle cx="10.5" cy="6.5" r="2.75" fill="currentColor" stroke="none"/><circle cx="14.5" cy="12" r="2.75" fill="currentColor" stroke="none"/><circle cx="9.5" cy="17.5" r="2.75" fill="currentColor" stroke="none"/>',
}

export const UserIcon: IconDefinition = {
  name: "user",
  viewBox: "0 0 24 24",
  content:
    '<circle cx="12" cy="7.9" r="3.8"/><path d="M4.5 20c0-4 3.4-6.8 7.5-6.8s7.5 2.8 7.5 6.8"/>',
}

export const BellIcon: IconDefinition = {
  name: "bell",
  viewBox: "0 0 24 24",
  content:
    '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M10.3 21a2 2 0 0 0 3.4 0"/>',
}

export const PlayIcon: IconDefinition = {
  name: "play",
  viewBox: "0 0 24 24",
  filled: true,
  content:
    '<path d="M7.5 5.4c0-.9 1-1.5 1.8-1l9.9 6.6c.7.5.7 1.5 0 2l-9.9 6.6c-.8.5-1.8-.1-1.8-1V5.4z"/>',
}

export const PauseIcon: IconDefinition = {
  name: "pause",
  viewBox: "0 0 24 24",
  filled: true,
  content:
    '<rect x="6.5" y="5" width="4" height="14" rx="1.5"/><rect x="13.5" y="5" width="4" height="14" rx="1.5"/>',
}

export const SkipForwardIcon: IconDefinition = {
  name: "skipForward",
  viewBox: "0 0 24 24",
  filled: true,
  content:
    '<path d="M5.5 6.2c0-.8.9-1.3 1.6-.9l8.2 5.8c.6.4.6 1.4 0 1.8l-8.2 5.8c-.7.4-1.6-.1-1.6-.9V6.2z"/><rect x="16.5" y="5.5" width="2.4" height="13" rx="1.2"/>',
}

export const SkipBackwardIcon: IconDefinition = {
  name: "skipBackward",
  viewBox: "0 0 24 24",
  filled: true,
  content:
    '<path d="M18.5 6.2c0-.8-.9-1.3-1.6-.9l-8.2 5.8c-.6.4-.6 1.4 0 1.8l8.2 5.8c.7.4 1.6-.1 1.6-.9V6.2z"/><rect x="5.1" y="5.5" width="2.4" height="13" rx="1.2"/>',
}

export const HeartIcon: IconDefinition = {
  name: "heart",
  viewBox: "0 0 24 24",
  content:
    '<path d="M12 19.5s-7-4.4-7-10.1A4.2 4.2 0 0 1 12 6.8a4.2 4.2 0 0 1 7 2.6c0 5.7-7 10.1-7 10.1z"/>',
}

export const HeartFilledIcon: IconDefinition = {
  name: "heartFilled",
  viewBox: "0 0 24 24",
  filled: true,
  content:
    '<path d="M12 20.2s-7.4-4.6-7.4-10.6a4.5 4.5 0 0 1 7.4-3.1 4.5 4.5 0 0 1 7.4 3.1c0 6-7.4 10.6-7.4 10.6z"/>',
}

export const VolumeHighIcon: IconDefinition = {
  name: "volumeHigh",
  viewBox: "0 0 24 24",
  content:
    '<path d="M11 5.5 6.8 9H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2.8L11 18.5V5.5z"/><path d="M15.2 8.8a4.5 4.5 0 0 1 0 6.4M18 6a8.5 8.5 0 0 1 0 12"/>',
}

export const VolumeOffIcon: IconDefinition = {
  name: "volumeOff",
  viewBox: "0 0 24 24",
  content:
    '<path d="M11 5.5 6.8 9H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2.8L11 18.5V5.5z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>',
}

export const RepeatIcon: IconDefinition = {
  name: "repeat",
  viewBox: "0 0 24 24",
  content:
    '<path d="m17 3.5 3 3-3 3"/><path d="M4 11V9a3 3 0 0 1 3-3h13"/><path d="m7 20.5-3-3 3-3"/><path d="M20 13v2a3 3 0 0 1-3 3H4"/>',
}

export const ShuffleIcon: IconDefinition = {
  name: "shuffle",
  viewBox: "0 0 24 24",
  content:
    '<path d="m17 4 3 3-3 3"/><path d="M4 17h4.2a3 3 0 0 0 2.3-1.1l4.8-5.8A3 3 0 0 1 17.6 9H20"/><path d="m17 14 3 3-3 3"/><path d="M4 7h4.2a3 3 0 0 1 2.3 1.1l.9 1.1M14.3 14.8l1 1.1a3 3 0 0 0 2.3 1.1H20"/>',
}

export const MoonIcon: IconDefinition = {
  name: "moon",
  viewBox: "0 0 24 24",
  content: '<path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z"/>',
}

export const SunIcon: IconDefinition = {
  name: "sun",
  viewBox: "0 0 24 24",
  content:
    '<circle cx="12" cy="12" r="4"/><path d="M12 3.5v1.5M12 19v1.5M4.9 4.9l1.1 1.1M18 18l1.1 1.1M3.5 12H5M19 12h1.5M4.9 19.1 6 18M18 6l1.1-1.1"/>',
}

export const DownloadIcon: IconDefinition = {
  name: "download",
  viewBox: "0 0 24 24",
  content: '<path d="M12 4.5v10.5M8 11.5l4 4 4-4M4.5 19.5h15"/>',
}

export const ShareIcon: IconDefinition = {
  name: "share",
  viewBox: "0 0 24 24",
  content:
    '<circle cx="17.5" cy="5.5" r="2.2"/><circle cx="6.5" cy="12" r="2.2"/><circle cx="17.5" cy="18.5" r="2.2"/><path d="m8.5 13 7 4.2M15.5 6.8l-7 4.2"/>',
}

export const EditIcon: IconDefinition = {
  name: "edit",
  viewBox: "0 0 24 24",
  content: '<path d="M4.5 19.5h4l10-10a2.1 2.1 0 0 0-3-3l-10 10v3z"/><path d="m13.5 8.5 3 3"/>',
}

export const TrashIcon: IconDefinition = {
  name: "trash",
  viewBox: "0 0 24 24",
  content:
    '<path d="M4.5 6.5h15M9.5 6.5V4.8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.7M6.5 6.5l1 12.2a1.5 1.5 0 0 0 1.5 1.3h6a1.5 1.5 0 0 0 1.5-1.3l1-12.2"/>',
}
