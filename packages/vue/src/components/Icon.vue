<script setup lang="ts">
import { computed } from "vue"
import {
  AlbumIcon,
  BarChartIcon,
  BellIcon,
  CalendarIcon,
  CassetteIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CloseIcon,
  CloudIcon,
  CommentIcon,
  DownloadIcon,
  DragHandleIcon,
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  FolderIcon,
  FontSizeIcon,
  HeartFilledIcon,
  HeartIcon,
  HelpIcon,
  HistoryIcon,
  HomeIcon,
  InfoCircleIcon,
  LibraryMusicIcon,
  LockIcon,
  LogoutIcon,
  MaximizeIcon,
  MaximizeRestoreIcon,
  MenuIcon,
  MessageIcon,
  MinimizeIcon,
  MinusIcon,
  MonitorIcon,
  MoonIcon,
  MoreHorizontalIcon,
  MusicNoteIcon,
  NotebookIcon,
  PauseIcon,
  PhoneIcon,
  PinFilledIcon,
  PinIcon,
  PlayIcon,
  PlaylistIcon,
  PlusIcon,
  QrCodeIcon,
  QueueIcon,
  RadioIcon,
  RefreshIcon,
  RepeatIcon,
  RepeatOneIcon,
  SearchIcon,
  SendIcon,
  SettingsIcon,
  ShareIcon,
  ShuffleIcon,
  SkipBackwardIcon,
  SkipForwardIcon,
  SmileIcon,
  SparklesIcon,
  SunIcon,
  ThumbsUpIcon,
  TimerIcon,
  TranslateIcon,
  TrashIcon,
  UserIcon,
  VideoIcon,
  VinylIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
  type IconDefinition,
  type IconName,
} from "@xcmm1543/miuui-icons"
import type { IconProps } from "../types"
import { useMiuIcons } from "../composables/useMiuIcons"

interface ResolvedSvgIcon {
  viewBox: string
  content: string
  fill: string
  stroke: string
  strokeWidth?: string
  strokeLinecap?: "inherit" | "round" | "butt" | "square"
  strokeLinejoin?: "inherit" | "round" | "miter" | "bevel"
  shapeRendering?: string
}

const parsedSvgCache = new Map<string, ResolvedSvgIcon>()

function extractAttr(attrs: string, attrName: string): string | undefined {
  const re = new RegExp(`\\b${attrName}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i")
  const match = attrs.match(re)
  return match?.[1] ?? match?.[2]
}

function parseRawSvg(raw: string): ResolvedSvgIcon {
  const cached = parsedSvgCache.get(raw)
  if (cached) return cached

  const match = raw.match(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/i)
  if (!match) {
    const fallback: ResolvedSvgIcon = {
      viewBox: "0 0 24 24",
      content: raw,
      fill: "currentColor",
      stroke: "none",
    }
    parsedSvgCache.set(raw, fallback)
    return fallback
  }

  const attrs = match[1] ?? ""
  const content = match[2] ?? ""
  const viewBox = extractAttr(attrs, "viewBox") ?? "0 0 24 24"
  const strokeAttr = extractAttr(attrs, "stroke")
  const fillAttr = extractAttr(attrs, "fill")
  const hasStroke = Boolean(strokeAttr && strokeAttr !== "none")
  const resolved: ResolvedSvgIcon = {
    viewBox,
    content,
    fill: fillAttr ?? (hasStroke ? "none" : "currentColor"),
    stroke: strokeAttr ?? "none",
    strokeWidth: extractAttr(attrs, "stroke-width"),
    strokeLinecap: extractAttr(attrs, "stroke-linecap") as ResolvedSvgIcon["strokeLinecap"],
    strokeLinejoin: extractAttr(attrs, "stroke-linejoin") as ResolvedSvgIcon["strokeLinejoin"],
    shapeRendering: extractAttr(attrs, "shape-rendering"),
  }
  parsedSvgCache.set(raw, resolved)
  return resolved
}

const props = withDefaults(defineProps<IconProps>(), { rotate: 0 })

const iconOverrides = useMiuIcons()

const iconMap: Record<IconName, IconDefinition> = {
  search: SearchIcon,
  plus: PlusIcon,
  check: CheckIcon,
  close: CloseIcon,
  chevron: ChevronIcon,
  chevronLeft: ChevronLeftIcon,
  chevronRight: ChevronRightIcon,
  chevronUp: ChevronUpIcon,
  chevronDown: ChevronDownIcon,
  settings: SettingsIcon,
  user: UserIcon,
  bell: BellIcon,
  play: PlayIcon,
  pause: PauseIcon,
  skipForward: SkipForwardIcon,
  skipBackward: SkipBackwardIcon,
  heart: HeartIcon,
  heartFilled: HeartFilledIcon,
  volumeHigh: VolumeHighIcon,
  volumeLow: VolumeLowIcon,
  volumeOff: VolumeOffIcon,
  repeat: RepeatIcon,
  repeatOne: RepeatOneIcon,
  shuffle: ShuffleIcon,
  moon: MoonIcon,
  sun: SunIcon,
  download: DownloadIcon,
  share: ShareIcon,
  edit: EditIcon,
  trash: TrashIcon,
  eye: EyeIcon,
  eyeOff: EyeOffIcon,
  minus: MinusIcon,
  help: HelpIcon,
  home: HomeIcon,
  calendar: CalendarIcon,
  libraryMusic: LibraryMusicIcon,
  barChart: BarChartIcon,
  radio: RadioIcon,
  playlist: PlaylistIcon,
  video: VideoIcon,
  notebook: NotebookIcon,
  folder: FolderIcon,
  cloud: CloudIcon,
  history: HistoryIcon,
  menu: MenuIcon,
  moreHorizontal: MoreHorizontalIcon,
  monitor: MonitorIcon,
  phone: PhoneIcon,
  lock: LockIcon,
  logout: LogoutIcon,
  qrCode: QrCodeIcon,
  album: AlbumIcon,
  musicNote: MusicNoteIcon,
  queue: QueueIcon,
  cassette: CassetteIcon,
  vinyl: VinylIcon,
  timer: TimerIcon,
  translate: TranslateIcon,
  sparkles: SparklesIcon,
  refresh: RefreshIcon,
  checkCircle: CheckCircleIcon,
  infoCircle: InfoCircleIcon,
  smile: SmileIcon,
  send: SendIcon,
  thumbsUp: ThumbsUpIcon,
  pin: PinIcon,
  pinFilled: PinFilledIcon,
  comment: CommentIcon,
  message: MessageIcon,
  minimize: MinimizeIcon,
  maximize: MaximizeIcon,
  maximizeRestore: MaximizeRestoreIcon,
  dragHandle: DragHandleIcon,
  fontSize: FontSizeIcon,
}

function fromDefinition(def: IconDefinition): ResolvedSvgIcon {
  return {
    viewBox: def.viewBox,
    content: def.content,
    fill: def.filled ? "currentColor" : "none",
    stroke: def.filled ? "none" : "currentColor",
    strokeWidth: def.filled ? undefined : "2.4",
    strokeLinecap: def.filled ? undefined : "round",
    strokeLinejoin: def.filled ? undefined : "round",
  }
}

const resolvedSvg = computed<ResolvedSvgIcon | undefined>(() => {
  if (typeof props.name === "object" && props.name !== null) {
    return fromDefinition(props.name)
  }
  if (typeof props.name === "string") {
    const override = iconOverrides.value?.[props.name]
    if (typeof override === "string") {
      return parseRawSvg(override)
    }
    const def = override ?? iconMap[props.name]
    return def ? fromDefinition(def) : undefined
  }
  return undefined
})
const semanticSize = computed(() => (typeof props.size === "string" ? props.size : undefined))
const iconStyle = computed(() => {
  const style: Record<string, string> = {
    "--miu-icon-rotation": `${props.rotate}deg`,
  }
  if (typeof props.size === "number") {
    style.width = `${props.size}px`
    style.height = `${props.size}px`
  }
  return style
})
</script>

<template>
  <svg
    v-if="resolvedSvg"
    class="miu-icon"
    :class="{ 'miu-icon--rotated': rotate !== 0 }"
    :viewBox="resolvedSvg.viewBox"
    :data-miu-icon-size="semanticSize"
    :style="iconStyle"
    :role="ariaLabel ? 'img' : undefined"
    :aria-label="ariaLabel"
    :aria-hidden="ariaLabel ? undefined : 'true'"
    :fill="resolvedSvg.fill"
    :stroke="resolvedSvg.stroke"
    :stroke-width="resolvedSvg.strokeWidth"
    :stroke-linecap="resolvedSvg.strokeLinecap"
    :stroke-linejoin="resolvedSvg.strokeLinejoin"
    :shape-rendering="resolvedSvg.shapeRendering"
    focusable="false"
    v-html="resolvedSvg.content"
  />
</template>
