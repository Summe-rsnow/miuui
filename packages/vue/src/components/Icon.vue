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
import type { IconSize } from "@xcmm1543/miuui-core"
import { useMiuIcons } from "../composables/useMiu"

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

const props = withDefaults(
  defineProps<{
    name?: IconName | IconDefinition
    icon?: IconDefinition
    size?: IconSize | number
    label?: string
    rotate?: 0 | 90 | 180 | 270
  }>(),
  { rotate: 0 },
)

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

const resolvedSvg = computed<ResolvedSvgIcon | undefined>(() => {
  if (props.icon) {
    return {
      viewBox: props.icon.viewBox,
      content: props.icon.content,
      fill: props.icon.filled ? "currentColor" : "none",
      stroke: props.icon.filled ? "none" : "currentColor",
      strokeWidth: props.icon.filled ? undefined : "2.4",
      strokeLinecap: props.icon.filled ? undefined : "round",
      strokeLinejoin: props.icon.filled ? undefined : "round",
    }
  }
  if (typeof props.name === "object" && props.name !== null) {
    return {
      viewBox: props.name.viewBox,
      content: props.name.content,
      fill: props.name.filled ? "currentColor" : "none",
      stroke: props.name.filled ? "none" : "currentColor",
      strokeWidth: props.name.filled ? undefined : "2.4",
      strokeLinecap: props.name.filled ? undefined : "round",
      strokeLinejoin: props.name.filled ? undefined : "round",
    }
  }
  if (typeof props.name === "string") {
    const override = iconOverrides.value?.[props.name]
    if (typeof override === "string") {
      return parseRawSvg(override)
    }
    const def = override ?? iconMap[props.name]
    if (!def) return undefined
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
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
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
