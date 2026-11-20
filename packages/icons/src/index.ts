export type IconName =
  | "search"
  | "plus"
  | "check"
  | "close"
  | "chevron"
  | "chevronLeft"
  | "chevronRight"
  | "chevronUp"
  | "chevronDown"
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
  | "volumeLow"
  | "volumeOff"
  | "repeat"
  | "repeatOne"
  | "shuffle"
  | "moon"
  | "sun"
  | "download"
  | "share"
  | "edit"
  | "trash"
  | "minus"
  | "eye"
  | "eyeOff"
  | "help"
  | "home"
  | "calendar"
  | "libraryMusic"
  | "barChart"
  | "radio"
  | "playlist"
  | "video"
  | "notebook"
  | "folder"
  | "cloud"
  | "history"
  | "menu"
  | "moreHorizontal"
  | "monitor"
  | "phone"
  | "lock"
  | "logout"
  | "qrCode"
  | "album"
  | "musicNote"
  | "queue"
  | "cassette"
  | "vinyl"
  | "timer"
  | "translate"
  | "sparkles"
  | "refresh"
  | "checkCircle"
  | "infoCircle"
  | "smile"
  | "send"
  | "thumbsUp"
  | "pin"
  | "pinFilled"
  | "comment"
  | "message"
  | "minimize"
  | "maximize"
  | "maximizeRestore"
  | "dragHandle"
  | "fontSize"

export interface IconDefinition {
  name: IconName | (string & {})
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
    '<path d="m17 4 3 3-3 3"/><path d="m17 14 3 3-3 3"/><path d="M4 17h2.5q1.75 0 3.1-1.8l4.8-6.4Q15.75 7 17.5 7H20"/><path d="M4 7h2.5q1.75 0 3.1 1.8l4.8 6.4Q15.75 17 17.5 17H20"/>',
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

export const MinusIcon: IconDefinition = {
  name: "minus",
  viewBox: "0 0 24 24",
  content: '<path d="M5 12h14"/>',
}

export const EyeIcon: IconDefinition = {
  name: "eye",
  viewBox: "0 0 24 24",
  content:
    '<path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.5"/>',
}

export const EyeOffIcon: IconDefinition = {
  name: "eyeOff",
  viewBox: "0 0 24 24",
  content:
    '<path d="M3.5 3.5 20.5 20.5"/><path d="M9.8 5.8C10.5 5.6 11.2 5.5 12 5.5c6 0 9.5 6.5 9.5 6.5s-.7 1.3-2 2.7"/><path d="M4.5 9.3C3.2 10.7 2.5 12 2.5 12s3.5 6.5 9.5 6.5c.8 0 1.5-.1 2.2-.3"/>',
}

export const HelpIcon: IconDefinition = {
  name: "help",
  viewBox: "0 0 24 24",
  content:
    '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.5a2.6 2.6 0 0 1 5 .8c0 1.7-2.6 2.3-2.6 3.7"/><circle cx="12" cy="17.2" r="0.8" fill="currentColor" stroke="none"/>',
}

export const ChevronLeftIcon: IconDefinition = {
  name: "chevronLeft",
  viewBox: "0 0 24 24",
  content: '<path d="M14.5 6.5c-2 1.8-4 3.7-6 5.5 2 1.8 4 3.7 6 5.5"/>',
}

export const ChevronRightIcon: IconDefinition = {
  name: "chevronRight",
  viewBox: "0 0 24 24",
  content: '<path d="M9.5 6.5c2 1.8 4 3.7 6 5.5-2 1.8-4 3.7-6 5.5"/>',
}

export const ChevronUpIcon: IconDefinition = {
  name: "chevronUp",
  viewBox: "0 0 24 24",
  content: '<path d="M6.5 14.5c1.8-2 3.7-4 5.5-6 1.8 2 3.7 4 5.5 6"/>',
}

export const ChevronDownIcon: IconDefinition = {
  name: "chevronDown",
  viewBox: "0 0 24 24",
  content: '<path d="M6.5 9.5c1.8 2 3.7 4 5.5 6 1.8-2 3.7-4 5.5-6"/>',
}

export const VolumeLowIcon: IconDefinition = {
  name: "volumeLow",
  viewBox: "0 0 24 24",
  content:
    '<path d="M11 5.5 6.8 9H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2.8L11 18.5V5.5z"/><path d="M15.2 8.8a4.5 4.5 0 0 1 0 6.4"/>',
}

export const RepeatOneIcon: IconDefinition = {
  name: "repeatOne",
  viewBox: "0 0 24 24",
  content:
    '<path d="m17 3.5 3 3-3 3"/><path d="M4 11V9a3 3 0 0 1 3-3h13"/><path d="m7 20.5-3-3 3-3"/><path d="M20 13v2a3 3 0 0 1-3 3H4"/><path d="M11 10.5l1.3-1v5"/>',
}

export const HomeIcon: IconDefinition = {
  name: "home",
  viewBox: "0 0 24 24",
  content:
    '<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9.5v9.5a1.5 1.5 0 0 0 1.5 1.5h3.2v-5.5h3.6v5.5H17a1.5 1.5 0 0 0 1.5-1.5V9.5"/>',
}

export const CalendarIcon: IconDefinition = {
  name: "calendar",
  viewBox: "0 0 24 24",
  content:
    '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M8 3v3.5M16 3v3.5M3.5 9.5h17"/>',
}

export const LibraryMusicIcon: IconDefinition = {
  name: "libraryMusic",
  viewBox: "0 0 24 24",
  content:
    '<rect x="6.5" y="3.5" width="14" height="14" rx="2.5"/><path d="M3 8v10.5a2.5 2.5 0 0 0 2.5 2.5H16"/><circle cx="12" cy="12.8" r="1.9" fill="currentColor" stroke="none"/><path d="M13.3 12.8V7.4l2.7-.7"/>',
}

export const BarChartIcon: IconDefinition = {
  name: "barChart",
  viewBox: "0 0 24 24",
  content: '<path d="M6 19.5V13M12 19.5V5.5M18 19.5V9.5"/>',
}

export const RadioIcon: IconDefinition = {
  name: "radio",
  viewBox: "0 0 24 24",
  content:
    '<circle cx="12" cy="12" r="2"/><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.5 5.5a9 9 0 0 0 0 13M18.5 5.5a9 9 0 0 1 0 13"/>',
}

export const PlaylistIcon: IconDefinition = {
  name: "playlist",
  viewBox: "0 0 24 24",
  content:
    '<path d="M4 6.5h12M4 11.5h12M4 16.5h7"/><circle cx="16.5" cy="17.5" r="2"/><path d="M18.5 17.5v-6l2-.6"/>',
}

export const VideoIcon: IconDefinition = {
  name: "video",
  viewBox: "0 0 24 24",
  content:
    '<rect x="3" y="6.5" width="13" height="11" rx="2.5"/><path d="m16 10.5 4.8-2.8a.6.6 0 0 1 .9.5v7.6a.6.6 0 0 1-.9.5L16 13.5"/>',
}

export const NotebookIcon: IconDefinition = {
  name: "notebook",
  viewBox: "0 0 24 24",
  content:
    '<rect x="5" y="3.5" width="14.5" height="17" rx="2.5"/><path d="M9.5 3.5v17M13 8.5h3.5M13 12.5h3.5"/>',
}

export const FolderIcon: IconDefinition = {
  name: "folder",
  viewBox: "0 0 24 24",
  content:
    '<path d="M3.5 7a2 2 0 0 1 2-2h4.2l2 2.5h6.8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7z"/>',
}

export const CloudIcon: IconDefinition = {
  name: "cloud",
  viewBox: "0 0 24 24",
  content:
    '<path d="M6.5 18.5h11a4 4 0 0 0 .8-7.9A5.5 5.5 0 0 0 7.7 8.8 4.2 4.2 0 0 0 6.5 18.5z"/>',
}

export const HistoryIcon: IconDefinition = {
  name: "history",
  viewBox: "0 0 24 24",
  content: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v4.8l3.2 2"/>',
}

export const MenuIcon: IconDefinition = {
  name: "menu",
  viewBox: "0 0 24 24",
  content: '<path d="M4.5 7h15M4.5 12h15M4.5 17h15"/>',
}

export const MoreHorizontalIcon: IconDefinition = {
  name: "moreHorizontal",
  viewBox: "0 0 24 24",
  content:
    '<circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
}

export const MonitorIcon: IconDefinition = {
  name: "monitor",
  viewBox: "0 0 24 24",
  content: '<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8.5 20h7M12 16.5V20"/>',
}

export const PhoneIcon: IconDefinition = {
  name: "phone",
  viewBox: "0 0 24 24",
  content:
    '<rect x="6.5" y="3" width="11" height="18" rx="2.2"/><circle cx="12" cy="17.5" r=".8" fill="currentColor" stroke="none"/>',
}

export const LockIcon: IconDefinition = {
  name: "lock",
  viewBox: "0 0 24 24",
  content:
    '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/>',
}

export const LogoutIcon: IconDefinition = {
  name: "logout",
  viewBox: "0 0 24 24",
  content: '<path d="M10 4.5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h4M15.5 16l4-4-4-4M19.5 12H9.5"/>',
}

export const QrCodeIcon: IconDefinition = {
  name: "qrCode",
  viewBox: "0 0 24 24",
  content:
    '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="12.8" y="12.8" width="2.6" height="2.6" rx="0.5" fill="currentColor" stroke="none"/><rect x="18.6" y="12.8" width="2.6" height="2.6" rx="0.5" fill="currentColor" stroke="none"/><rect x="12.8" y="18.6" width="2.6" height="2.6" rx="0.5" fill="currentColor" stroke="none"/><path d="M17.5 20H20v-2.5"/>',
}

export const AlbumIcon: IconDefinition = {
  name: "album",
  viewBox: "0 0 24 24",
  content: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.5"/>',
}

export const MusicNoteIcon: IconDefinition = {
  name: "musicNote",
  viewBox: "0 0 24 24",
  content:
    '<circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="15.5" r="2.5"/><path d="M10 17.5V6.5l10-2v11"/>',
}

export const QueueIcon: IconDefinition = {
  name: "queue",
  viewBox: "0 0 24 24",
  content: '<path d="M4 6.5h16M4 12h16M4 17.5h10"/>',
}

export const CassetteIcon: IconDefinition = {
  name: "cassette",
  viewBox: "0 0 24 24",
  content:
    '<rect x="3" y="6" width="18" height="12" rx="2.2"/><circle cx="8" cy="11.5" r="1.7"/><circle cx="16" cy="11.5" r="1.7"/><path d="M7.5 18l1.2-2.5h6.6l1.2 2.5"/>',
}

export const VinylIcon: IconDefinition = {
  name: "vinyl",
  viewBox: "0 0 24 24",
  content:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.2"/><path d="M8.2 8.2a5.5 5.5 0 0 1 7.6 0"/>',
}

export const TimerIcon: IconDefinition = {
  name: "timer",
  viewBox: "0 0 24 24",
  content: '<circle cx="12" cy="13" r="8"/><path d="M12 13l3-3M9.5 3h5M18 6.5l1.5-1.5"/>',
}

export const TranslateIcon: IconDefinition = {
  name: "translate",
  viewBox: "0 0 24 24",
  content:
    '<path d="M4 7h9M8.5 4.5V7M11 7c-.5 3.5-2.5 6.5-6 8.5M6.5 10c1 2 2.5 3.5 4.5 4.5M13.5 19l3.2-8.5L20 19M14.7 16.5h4.1"/>',
}

export const SparklesIcon: IconDefinition = {
  name: "sparkles",
  viewBox: "0 0 24 24",
  content:
    '<path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z"/><path d="M18.5 15.5v3M17 17h3"/>',
}

export const RefreshIcon: IconDefinition = {
  name: "refresh",
  viewBox: "0 0 24 24",
  content:
    '<path d="M20 11a8 8 0 0 0-14.3-4.8L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.8L20 16M20 20v-4h-4"/>',
}

export const CheckCircleIcon: IconDefinition = {
  name: "checkCircle",
  viewBox: "0 0 24 24",
  content: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.2 2.4 2.4 4.8-5.2"/>',
}

export const InfoCircleIcon: IconDefinition = {
  name: "infoCircle",
  viewBox: "0 0 24 24",
  content:
    '<circle cx="12" cy="12" r="9"/><path d="M12 11.5v5"/><circle cx="12" cy="8.2" r=".8" fill="currentColor" stroke="none"/>',
}

export const SmileIcon: IconDefinition = {
  name: "smile",
  viewBox: "0 0 24 24",
  content:
    '<circle cx="12" cy="12" r="9"/><path d="M8.8 14.2a4.2 4.2 0 0 0 6.4 0"/><circle cx="9.2" cy="10" r=".9" fill="currentColor" stroke="none"/><circle cx="14.8" cy="10" r=".9" fill="currentColor" stroke="none"/>',
}

export const SendIcon: IconDefinition = {
  name: "send",
  viewBox: "0 0 24 24",
  content: '<path d="M20.5 4.5 10.5 14.5M20.5 4.5l-6.5 16-3.5-6-6-3.5z"/>',
}

export const ThumbsUpIcon: IconDefinition = {
  name: "thumbsUp",
  viewBox: "0 0 24 24",
  content:
    '<path d="M7 11v9H4.5a1.5 1.5 0 0 1-1.5-1.5v-6A1.5 1.5 0 0 1 4.5 11H7zm0 0 3.5-6.5a2 2 0 0 1 3.5 1.3V10h4.5a2 2 0 0 1 2 2.4l-1.2 6A2 2 0 0 1 17.3 20H7"/>',
}

export const PinIcon: IconDefinition = {
  name: "pin",
  viewBox: "0 0 24 24",
  content:
    '<path d="M15 4 20 9l-2 .5-2.5 2.5-.5 4.5-7.5-7.5 4.5-.5L14.5 6z"/><path d="M11.25 12.75 4.5 19.5"/>',
}

export const PinFilledIcon: IconDefinition = {
  name: "pinFilled",
  viewBox: "0 0 24 24",
  filled: true,
  content:
    '<path d="M14.7 3.6a1.1 1.1 0 0 1 1.56 0l4.14 4.14a1.1 1.1 0 0 1-.48 1.84l-2.12.62-2.8 2.8.56 3.5a1 1 0 0 1-1.7.85l-3.4-3.4-5.4 5.4a.75.75 0 0 1-1.06-1.06l5.4-5.4-3.4-3.4a1 1 0 0 1 .85-1.7l3.5.56 2.8-2.8.62-2.12a1.1 1.1 0 0 1 .23-.33z"/>',
}

export const CommentIcon: IconDefinition = {
  name: "comment",
  viewBox: "0 0 24 24",
  content:
    '<path d="M4.5 6a2.5 2.5 0 0 1 2.5-2.5h10A2.5 2.5 0 0 1 19.5 6v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5v-3.5H7A2.5 2.5 0 0 1 4.5 14V6z"/>',
}

export const MessageIcon: IconDefinition = {
  name: "message",
  viewBox: "0 0 24 24",
  content:
    '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7 7.5 5.5L19.5 7"/>',
}

export const MinimizeIcon: IconDefinition = {
  name: "minimize",
  viewBox: "0 0 24 24",
  content: '<path d="M5 12h14"/>',
}

export const MaximizeIcon: IconDefinition = {
  name: "maximize",
  viewBox: "0 0 24 24",
  content: '<rect x="5" y="5" width="14" height="14" rx="2.5"/>',
}

export const MaximizeRestoreIcon: IconDefinition = {
  name: "maximizeRestore",
  viewBox: "0 0 24 24",
  content:
    '<rect x="4.5" y="7.5" width="12" height="12" rx="2"/><path d="M7.5 7.5V6a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 19.5 6v9a1.5 1.5 0 0 1-1.5 1.5h-1.5"/>',
}

export const DragHandleIcon: IconDefinition = {
  name: "dragHandle",
  viewBox: "0 0 24 24",
  content:
    '<circle cx="9" cy="6.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="6.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="9" cy="17.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="17.5" r="1.2" fill="currentColor" stroke="none"/>',
}

export const FontSizeIcon: IconDefinition = {
  name: "fontSize",
  viewBox: "0 0 24 24",
  content: '<path d="M4 18 8.5 6 13 18M5.5 14h6M15.5 18v-5.5a2 2 0 0 1 4 0V18M15.5 15.5h4"/>',
}
