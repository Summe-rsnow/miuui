export type IconName =
  | "search"
  | "plus"
  | "check"
  | "close"
  | "chevron"
  | "settings"
  | "user"
  | "bell"

export interface IconDefinition {
  name: IconName
  viewBox: string
  content: string
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
