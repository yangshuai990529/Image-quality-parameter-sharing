import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ChefHat,
  BookOpen,
  Share2,
  Play,
  Mic,
  MicOff,
  Check,
  Download,
  Upload,
  ChevronRight,
  Zap,
  Sun,
  Moon,
  Eye,
  Activity,
  ArrowLeft,
  SlidersHorizontal,
  Users,
  ShieldCheck,
  Save,
  Film,
  X,
  ChevronDown,
  Info,
  AlertTriangle,
  Trash2,
} from "lucide-react";

type Page = "home" | "ai" | "preview" | "recommended" | "myrecipes" | "share";

const assetPath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
const HERO_IMAGE = assetPath("media/tcl-imax-poster.jpg");
const DEMO_VIDEO = assetPath("media/tcl-picture-demo.mp4");
const MOVIE_IMAGES = [
  "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&h=340&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=340&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&h=340&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600&h=340&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=600&h=340&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1585951237318-9ea5e175b891?w=600&h=340&fit=crop&auto=format",
];

type PictureParameter = { label: string; value: string; note: string };
type ParameterDefinition = { id: string; label: string; control: string };
type ParameterGroup = { id: string; title: string; subtitle: string; advanced?: boolean; items: ParameterDefinition[] };
type PictureMode = {
  id: string;
  title: string;
  description: string;
  image: string;
  rating: number;
  users: string;
  tags: string[];
  coreParameterIds: string[];
  coreNotes: Record<string, string>;
  values: Record<string, string>;
  metadata: { recipeType: string; scene: string; signal: string; device: string[]; compatibility: string };
  ignored: { label: string; reason: string }[];
};

const MENU_TREE: ParameterGroup[] = [
  { id: "pictureModeGroup", title: "图效模式 / Picture mode", subtitle: "显示当前信号类型：SDR、HDR、HLG、HDR10+、Dolby Vision 等", items: [
    { id: "pictureMode", label: "图效", control: "杜比：TSR计算画质 / 明亮 / 柔和 / 游戏 / IQ；HDR/HLG/SDR：TSR计算画质 / 标准 / FILMMAKER MODE / 电影或IMAX / 游戏 / 办公 / 专家" },
  ]},
  { id: "brightness", title: "亮度", subtitle: "高级设置 · 亮度", items: [
    { id: "screenBrightness", label: "亮度", control: "0~100" },
    { id: "contrast", label: "对比度", control: "0~100" },
    { id: "gamma", label: "伽马", control: "-4~4 / 1.8~2.6 / 1886 左右切换" },
    { id: "autoHdrConversion", label: "自动HDR转换", control: "开 / 关" },
    { id: "dynamicToneMapping", label: "HDR动态色调映射", control: "细节优先 / 平衡 / 亮度优先 / 关" },
    { id: "blackLevel", label: "黑电平", control: "0~100" },
    { id: "blackLevelExtension", label: "黑电平延伸", control: "关 / 低 / 高" },
    { id: "dynamicContrast", label: "动态对比度", control: "设置2.2：关 / 低 / 高；设置3.0：关 / 低 / 高 / 智能" },
    { id: "localDimming", label: "区域背光", control: "关 / 低 / 中 / 高" },
    { id: "peakBrightness", label: "峰值亮度", control: "关 / 低 / 高 / 高动态" },
    { id: "naturalLight", label: "自然光", control: "关闭 / 节能 / 动态" },
    { id: "intelligentLocalDimming", label: "智能局域控光", control: "开 / 关" },
  ]},
  { id: "color", title: "色彩", subtitle: "高级设置 · 色彩", items: [
    { id: "color", label: "饱和度", control: "0~100" },
    { id: "tint", label: "色调", control: "0~100" },
    { id: "colorTemperature", label: "色温", control: "标准 / 冷 / 防蓝光护眼" },
    { id: "adaptiveColorTemperature", label: "环境色温感应", control: "开 / 关" },
    { id: "colorEnhancement", label: "色彩增强", control: "开 / 关；RGB及超高色域产品：高 / 低 / 关" },
    { id: "whiteBalance", label: "白平衡", control: "进入二级校准" },
    { id: "whiteBalance2", label: "2点", control: "开 / 关" },
    { id: "redGain", label: "红色增益", control: "-30~0" },
    { id: "greenGain", label: "绿色增益", control: "-30~0" },
    { id: "blueGain", label: "蓝色增益", control: "-30~0" },
    { id: "redOffset", label: "红色偏差", control: "-15~15" },
    { id: "greenOffset", label: "绿色偏差", control: "-15~15" },
    { id: "blueOffset", label: "蓝色偏差", control: "-15~15" },
    { id: "restoreWhiteBalance2", label: "重置2点白平衡", control: "Restore the 2-point default value" },
    { id: "whiteBalance20", label: "20点", control: "开 / 关" },
    { id: "whiteBalanceSegment", label: "分段", control: "1~20段" },
    { id: "whiteBalanceRed", label: "红色", control: "-30~30" },
    { id: "whiteBalanceGreen", label: "绿色", control: "-30~30" },
    { id: "whiteBalanceBlue", label: "蓝色", control: "-30~30" },
    { id: "restoreWhiteBalance20", label: "重置20点白平衡", control: "Restore the 20-point default" },
    { id: "colorSpace", label: "色彩空间", control: "自动 / 原始 / 自定义 / 扩展" },
    { id: "colorSpaceColor", label: "颜色", control: "红色 / 绿色 / 蓝色 / 黄色 / 青色 / 紫色" },
    { id: "colorSpaceRed", label: "红", control: "0~100" },
    { id: "colorSpaceGreen", label: "绿", control: "0~100" },
    { id: "colorSpaceBlue", label: "蓝", control: "0~100" },
    { id: "restoreColorSpace", label: "重置色彩空间", control: "Restores the color space defaults" },
  ]},
  { id: "motion", title: "运动", subtitle: "高级设置 · 运动", items: [
    { id: "memc", label: "运动补偿", control: "关闭 / 弱 / 中 / 强 / 120Hz / 240Hz / 自定义" },
    { id: "memcUnified", label: "运动补偿（统一规划）", control: "关闭 / 弱 / 中 / 强 / 24P原彩电影 / 自定义" },
    { id: "judderReduction", label: "运动平滑", control: "0~10" },
    { id: "blurReduction", label: "运动清晰", control: "0~10" },
    { id: "dlg", label: "120/240Hz动态加速", control: "开 / 关" },
    { id: "bfi", label: "LED运动清晰", control: "BFI2.0：关 / 低 / 高；其他：开 / 关" },
    { id: "film24p", label: "24p原帧电影", control: "开 / 关" },
  ]},
  { id: "sharpnessGroup", title: "清晰度", subtitle: "高级设置 · 清晰度", items: [
    { id: "sharpness", label: "锐利度", control: "0~100" },
    { id: "smoothGradation", label: "水印平滑", control: "关 / 低 / 高" },
    { id: "mpegNoiseReduction", label: "MPEG降噪", control: "关 / 低 / 中 / 高" },
    { id: "noiseReduction", label: "降噪", control: "关 / 低 / 中 / 高 / 自动" },
    { id: "superResolution", label: "超清分辨率", control: "开 / 关" },
    { id: "precisionDetail", label: "精准细节 / Precision Detail", control: "开 / 关" },
  ]},
  { id: "signalRangeGroup", title: "信号范围", subtitle: "高级设置 · 信号范围", items: [
    { id: "signalRange", label: "信号范围", control: "自动 / 有限 / 完全" },
  ]},
  { id: "displayStandardGroup", title: "显示标准", subtitle: "高级设置 · 显示标准", items: [
    { id: "displayStandard", label: "显示标准", control: "自动 / HDR视频 / HLG视频 / HDTV视频 / NTSC视频 / PAL和SECAM视频 / 数字电影(P3-D65) / 互联网和网络 / Adobe RGB / 自定义" },
    { id: "sourceColorGamut", label: "片源色域", control: "自动 / Native / BT.2020 / BT.709 / SMPET-C / AdobeRGB / P3 / sRGB / EBU" },
    { id: "sourceWhitePoint", label: "片源白点--隐藏", control: "D65" },
    { id: "sourceOetf", label: "片源OETF", control: "2.2 / 2.4 / 2.6 / ST.2084 / HLG / BT.1886 / sRGB" },
  ]},
  { id: "resetAdvancedGroup", title: "重置高级设置", subtitle: "Reset the current picture effect settings", items: [
    { id: "resetAdvanced", label: "重置高级设置", control: "恢复当前图效高级设置" },
  ]},
  { id: "otherSettings", title: "其他设置 / Other Settings", subtitle: "内容识别与健康护眼", items: [
    { id: "contentRecognition", label: "内容自动识别", control: "开 / 关" },
    { id: "eyeHealthProtection", label: "健康护眼 / Eye Health Protection", control: "进入二级设置" },
    { id: "adaptiveBrightness", label: "环境亮度感应 / Adaptive Brightness", control: "开 / 关" },
    { id: "lowBlueLight", label: "低蓝光模式 / Blue light filter", control: "开 / 关" },
  ]},
];

const DEFAULT_PICTURE_VALUES: Record<string, string> = {
  autoHdrConversion: "关",
  blackLevelExtension: "低",
  dynamicContrast: "关",
  naturalLight: "关闭",
  intelligentLocalDimming: "开",
  adaptiveColorTemperature: "关",
  whiteBalance: "默认",
  whiteBalance2: "关",
  redGain: "0",
  greenGain: "0",
  blueGain: "0",
  redOffset: "0",
  greenOffset: "0",
  blueOffset: "0",
  restoreWhiteBalance2: "未操作",
  whiteBalance20: "关",
  whiteBalanceSegment: "1段",
  whiteBalanceRed: "0",
  whiteBalanceGreen: "0",
  whiteBalanceBlue: "0",
  restoreWhiteBalance20: "未操作",
  colorSpaceColor: "红色",
  colorSpaceRed: "50",
  colorSpaceGreen: "50",
  colorSpaceBlue: "50",
  restoreColorSpace: "未操作",
  memcUnified: "弱",
  film24p: "开",
  signalRange: "自动",
  displayStandard: "自动",
  sourceColorGamut: "自动",
  sourceWhitePoint: "D65",
  sourceOetf: "ST.2084",
  resetAdvanced: "未操作",
  contentRecognition: "开",
  eyeHealthProtection: "关",
};

const DEFAULT_PARAMETER_IDS = ["pictureMode","screenBrightness","contrast","blackLevel","color","colorTemperature","sharpness","peakBrightness","localDimming","memc","noiseReduction","lowBlueLight"];

const PARAMETER_BY_ID = Object.fromEntries(
  MENU_TREE.flatMap((group) => group.items).map((item) => [item.id, item]),
) as Record<string, ParameterDefinition>;

function getCoreParameters(mode: PictureMode): PictureParameter[] {
  return mode.coreParameterIds.map((id) => ({
    label: PARAMETER_BY_ID[id]?.label ?? id,
    value: mode.values[id] ?? DEFAULT_PICTURE_VALUES[id] ?? "未调整",
    note: mode.coreNotes[id] ?? PARAMETER_BY_ID[id]?.control ?? "",
  }));
}

const PARAMETER_TABLE_GROUPS = MENU_TREE.filter((group) => group.id !== "expert");
const COMPACT_MENU_GROUP_IDS = ["brightness", "color", "motion", "sharpnessGroup"];

function getMenuGroupById(id: string) {
  return MENU_TREE.find((group) => group.id === id);
}

function getGroupItems(mode: PictureMode, group: ParameterGroup, limit?: number) {
  return group.items.slice(0, limit ?? group.items.length).map((item) => ({
    ...item,
    value: mode.values[item.id] ?? DEFAULT_PICTURE_VALUES[item.id] ?? "未调整",
  }));
}

function getPictureSettingGroups(mode: PictureMode) {
  const value = (id: string, fallback = "未调整") => mode.values[id] ?? DEFAULT_PICTURE_VALUES[id] ?? fallback;
  return [
    {
      title: "亮度",
      items: [
        ["亮度", value("screenBrightness")],
        ["区域背光", value("localDimming")],
        ["动态对比度", value("dynamicContrast")],
        ["峰值亮度", value("peakBrightness")],
      ],
    },
    {
      title: "色彩",
      items: [
        ["饱和度", value("color")],
        ["色调", value("tint")],
        ["色温", value("colorTemperature")],
        ["色彩增强", value("colorEnhancement")],
        ["白平衡", value("whiteBalance")],
        ["色彩空间", value("colorSpace")],
      ],
    },
    {
      title: "运动",
      items: [
        ["运动补偿", value("memc")],
        ["DLG", value("dlg")],
        ["LED运动清晰", value("bfi")],
      ],
    },
    {
      title: "清晰度",
      items: [
        ["锐利度", value("sharpness")],
        ["水印平滑", value("smoothGradation")],
        ["MPEG降噪", value("mpegNoiseReduction")],
        ["降噪", value("noiseReduction")],
        ["超清分辨率", value("superResolution")],
        ["精准细节", value("precisionDetail")],
      ],
    },
  ];
}

const DIRECTOR_MODES: PictureMode[] = [
  {
    id: "lin-night-cinema",
    title: "夜间影院增强",
    description: "夜间观影时压住字幕高光，同时保留暗场层次。",
    image: MOVIE_IMAGES[0],
    rating: 4.9,
    users: "12.8 万",
    tags: ["HDR10", "MiniLED", "电影"],
    coreParameterIds: ["blackLevel", "dynamicToneMapping", "colorTemperature"],
    coreNotes: { blackLevel: "保留深黑层次", dynamicToneMapping: "压制字幕高光", colorTemperature: "还原创作白点" },
    values: { pictureMode:"TSR计算画质",screenBrightness:"25",contrast:"48",blackLevel:"47",color:"52",tint:"52",sharpness:"5",colorTemperature:"防蓝光护眼",peakBrightness:"中",brightnessMode:"标准",localDimming:"高",dynamicToneMapping:"开",hdrEnhancer:"中",shadowDetail:"3",highlightDetail:"4",colorEnhancement:"低",dynamicColor:"关",colorSpace:"自动",skinTone:"0",redGain:"0",greenGain:"0",blueGain:"0",superResolution:"中",aiSuperResolution:"开",precisionDetail:"低",edgeEnhancement:"关",smoothGradation:"低",memc:"低",judderReduction:"2",blurReduction:"2",dynamicClarity:"低",bfi:"关",dlg:"关",noiseReduction:"低",mpegNoiseReduction:"自动",digitalNoiseReduction:"低",eyeCare:"低",lowBlueLight:"低",adaptiveBrightness:"关",adaptiveColorTemperature:"关",nightMode:"开",gameMode:"关",lowLatency:"关",vrr:"关",allm:"关",gameShadowEnhancer:"0",gameHighlightProtection:"0",gamma:"2.4",whiteBalance2:"轻微暖调",whiteBalance20:"未调整",cms:"未调整" },
    metadata: { recipeType:"KOL Certified",scene:"Movie · Night",signal:"HDR10",device:["MiniLED","120Hz","Local Dimming Supported","MEMC Supported","AI SR Supported"],compatibility:"Auto Adapted" },
    ignored: [{ label:"黑帧插入 BFI",reason:"当前 HDR10 信号不支持" },{ label:"动态加速 DLG",reason:"当前模式不可调" }],
  },
  {
    id: "kai-game-hdr",
    title: "主机游戏 HDR",
    description: "为主机 HDR 输入优先降低延迟，并保留高光冲击力。",
    image: MOVIE_IMAGES[4],
    rating: 4.8,
    users: "8.6 万",
    tags: ["PS5", "VRR", "120Hz"],
    coreParameterIds: ["memc", "peakBrightness", "dlg"],
    coreNotes: { memc: "降低运动处理延迟", peakBrightness: "强化 HDR 高光", dlg: "适配高刷输入" },
    values: { pictureMode:"游戏",screenBrightness:"72",contrast:"55",blackLevel:"50",color:"56",tint:"0",sharpness:"8",colorTemperature:"标准",peakBrightness:"高",brightnessMode:"明亮",localDimming:"高",dynamicToneMapping:"开",hdrEnhancer:"高",shadowDetail:"4",highlightDetail:"6",colorEnhancement:"中",dynamicColor:"低",colorSpace:"BT.2020",skinTone:"0",redGain:"0",greenGain:"0",blueGain:"0",superResolution:"低",aiSuperResolution:"开",precisionDetail:"中",edgeEnhancement:"低",smoothGradation:"关",memc:"关",judderReduction:"0",blurReduction:"0",dynamicClarity:"高",bfi:"关",dlg:"开",noiseReduction:"关",mpegNoiseReduction:"关",digitalNoiseReduction:"关",eyeCare:"关",lowBlueLight:"关",adaptiveBrightness:"关",adaptiveColorTemperature:"关",nightMode:"关",gameMode:"开",lowLatency:"开",vrr:"开",allm:"开",gameShadowEnhancer:"4",gameHighlightProtection:"5",gamma:"2.2",whiteBalance2:"标准",whiteBalance20:"未调整",cms:"BT.2020 游戏校准" },
    metadata: { recipeType:"KOL Certified",scene:"Game · HDR",signal:"Game HDMI",device:["MiniLED","144Hz","VRR Supported","DLG Supported","AI SR Supported"],compatibility:"Partially Applied" },
    ignored: [{ label:"运动补偿 MEMC",reason:"VRR 生效时自动关闭" },{ label:"黑帧插入 BFI",reason:"高刷信号限制" },{ label:"MPEG 降噪",reason:"游戏模式限制" }],
  },
  {
    id: "qiao-natural-color",
    title: "自然人像纪实",
    description: "让肤色更自然，减少偏黄并保留真实纪录片质感。",
    image: MOVIE_IMAGES[5],
    rating: 4.9,
    users: "10.4 万",
    tags: ["肤色", "DCI-P3", "护眼"],
    coreParameterIds: ["colorTemperature", "colorEnhancement", "superResolution"],
    coreNotes: { colorTemperature: "降低偏黄问题", colorEnhancement: "保持克制鲜活", superResolution: "保留真实纹理" },
    values: { pictureMode:"自定义",screenBrightness:"42",contrast:"46",blackLevel:"49",color:"54",tint:"0",sharpness:"6",colorTemperature:"标准",peakBrightness:"中",brightnessMode:"标准",localDimming:"中",dynamicToneMapping:"开",hdrEnhancer:"低",shadowDetail:"2",highlightDetail:"5",colorEnhancement:"低",dynamicColor:"关",colorSpace:"DCI-P3",skinTone:"-1",redGain:"-2",greenGain:"0",blueGain:"1",superResolution:"低",aiSuperResolution:"开",precisionDetail:"低",edgeEnhancement:"关",smoothGradation:"中",memc:"低",judderReduction:"1",blurReduction:"2",dynamicClarity:"低",bfi:"关",dlg:"关",noiseReduction:"低",mpegNoiseReduction:"自动",digitalNoiseReduction:"自动",eyeCare:"低",lowBlueLight:"低",adaptiveBrightness:"开",adaptiveColorTemperature:"开",nightMode:"关",gameMode:"关",lowLatency:"关",vrr:"关",allm:"关",gameShadowEnhancer:"0",gameHighlightProtection:"0",gamma:"2.2",whiteBalance2:"肤色校准",whiteBalance20:"已校准 20 点",cms:"DCI-P3 纪实色彩" },
    metadata: { recipeType:"KOL Certified",scene:"Streaming · Documentary",signal:"SDR",device:["MiniLED","OLED","QLED","60Hz","AI SR Supported"],compatibility:"Fully Applied" },
    ignored: [{ label:"动态加速 DLG",reason:"当前设备刷新率不需要" }],
  },
];

DIRECTOR_MODES.push(
  {
    ...DIRECTOR_MODES[1],
    id: "chen-nba-live",
    title: "NBA 比赛模式",
    description: "看球时提升运动清晰度，让高速传球和镜头横移更稳。",
    image: MOVIE_IMAGES[1],
    rating: 4.8,
    users: "9.2 万",
    tags: ["SDR", "Live TV", "运动"],
    values: { ...DIRECTOR_MODES[1].values, pictureMode:"运动", screenBrightness:"58", color:"55", peakBrightness:"中", localDimming:"中", memc:"高", judderReduction:"6", blurReduction:"7", dynamicClarity:"中", gameMode:"关", lowLatency:"关", vrr:"关", allm:"关", noiseReduction:"低" },
    metadata: { recipeType:"KOL Certified", scene:"Sports · Live TV", signal:"SDR", device:["MiniLED","120Hz","MEMC Supported","QLED"], compatibility:"Auto Adapted" },
    ignored: [{ label:"VRR", reason:"直播信号不需要" }],
  },
  {
    ...DIRECTOR_MODES[2],
    id: "mika-anime-vivid",
    title: "动漫鲜艳模式",
    description: "强化线条和高饱和色块，适合动画、二次元和亲子内容。",
    image: MOVIE_IMAGES[2],
    rating: 4.7,
    users: "7.5 万",
    tags: ["SDR", "动漫", "高色彩"],
    values: { ...DIRECTOR_MODES[2].values, pictureMode:"动态", screenBrightness:"52", contrast:"52", color:"64", sharpness:"9", colorTemperature:"标准", colorEnhancement:"高", dynamicColor:"中", colorSpace:"DCI-P3", superResolution:"中", aiSuperResolution:"开", edgeEnhancement:"低", eyeCare:"低" },
    metadata: { recipeType:"Official Recommended", scene:"Anime · Streaming", signal:"SDR", device:["MiniLED","QLED","AI SR Supported"], compatibility:"Fully Applied" },
    ignored: [{ label:"黑帧插入 BFI", reason:"当前内容帧率不建议开启" }],
  },
  {
    ...DIRECTOR_MODES[0],
    id: "anran-kids-eye",
    title: "儿童护眼模式",
    description: "降低蓝光和高光刺激，适合儿童动画和长时间观看。",
    image: MOVIE_IMAGES[3],
    rating: 4.9,
    users: "11.6 万",
    tags: ["Kids", "护眼", "SDR"],
    values: { ...DIRECTOR_MODES[0].values, pictureMode:"节能", screenBrightness:"34", contrast:"42", color:"48", sharpness:"4", colorTemperature:"暖", peakBrightness:"低", localDimming:"中", hdrEnhancer:"低", eyeCare:"高", lowBlueLight:"高", adaptiveBrightness:"开", adaptiveColorTemperature:"开", nightMode:"开", memc:"低" },
    metadata: { recipeType:"Official Recommended", scene:"Kids · Eye Comfort", signal:"SDR", device:["MiniLED","LED","QLED","Light Sensor Supported"], compatibility:"Auto Adapted" },
    ignored: [{ label:"峰值亮度 高", reason:"护眼策略限制" }],
  },
  {
    ...DIRECTOR_MODES[0],
    id: "zhou-hdr-shadow",
    title: "HDR 暗场增强",
    description: "提升 HDR 暗部可见度，保留 MiniLED 深黑和高光层次。",
    image: MOVIE_IMAGES[0],
    rating: 4.8,
    users: "8.9 万",
    tags: ["HDR10+", "MiniLED", "暗场"],
    values: { ...DIRECTOR_MODES[0].values, pictureMode:"电影", screenBrightness:"36", contrast:"52", peakBrightness:"高", localDimming:"高", dynamicToneMapping:"开", hdrEnhancer:"高", shadowDetail:"5", highlightDetail:"6", gamma:"2.2", noiseReduction:"低" },
    metadata: { recipeType:"KOL Certified", scene:"HDR · Movie", signal:"HDR10", device:["MiniLED","Local Dimming Supported","HDR10+ Supported"], compatibility:"Auto Adapted" },
    ignored: [{ label:"BFI", reason:"当前 HDR 信号不支持" }],
  },
  {
    ...DIRECTOR_MODES[0],
    id: "tcl-imax-cinema",
    title: "IMAX 电影模式",
    description: "接近影院的暖色白点和稳定光影，适合大片与流媒体电影。",
    image: MOVIE_IMAGES[4],
    rating: 4.9,
    users: "15.3 万",
    tags: ["IMAX", "Dolby", "HDR"],
    values: { ...DIRECTOR_MODES[0].values, pictureMode:"IMAX电影", screenBrightness:"32", contrast:"50", color:"50", colorTemperature:"暖", peakBrightness:"中", localDimming:"高", dynamicToneMapping:"开", hdrEnhancer:"中", shadowDetail:"3", highlightDetail:"5", colorSpace:"自动", memc:"低", gamma:"2.4" },
    metadata: { recipeType:"Official Recommended", scene:"Movie · IMAX", signal:"Dolby Vision", device:["MiniLED","OLED","Local Dimming Supported","Dolby Vision Supported"], compatibility:"Auto Adapted" },
    ignored: [{ label:"运动补偿 MEMC 高", reason:"电影图效不建议开启" }],
  },
);

type FilterPreset = {
  name: string;
  story: string;
  signals: string[];
  coreParameterIds: string[];
  valueOverrides: Record<string, string>;
  coreNotes: Record<string, string>;
  modeIndex: number;
  color: string;
};

const FILTER_PRESETS: FilterPreset[] = [
  { name:"月光胶片", story:"夜色微蓝，人物仍然温暖。", signals:["HDR10","Dolby Vision"], coreParameterIds:["colorTemperature","blackLevel","smoothGradation"], valueOverrides:{ colorTemperature:"暖",blackLevel:"47",smoothGradation:"低" }, coreNotes:{ colorTemperature:"保留温暖白点",blackLevel:"压住夜色灰雾",smoothGradation:"让暗部过渡更平滑" }, modeIndex:0, color:"#6676b8" },
  { name:"球场追光", story:"每次转身都清楚，草地依然自然。", signals:["SDR","Live TV"], coreParameterIds:["memc","blurReduction","judderReduction"], valueOverrides:{ memc:"强",blurReduction:"7",judderReduction:"6" }, coreNotes:{ memc:"跟稳高速运动",blurReduction:"减少球员拖影",judderReduction:"让横移更平滑" }, modeIndex:1, color:"#3a9a6a" },
  { name:"琥珀人像", story:"把肤色放回窗边的自然光。", signals:["SDR","Dolby Vision"], coreParameterIds:["colorTemperature","colorSpace","color"], valueOverrides:{ colorTemperature:"标准",colorSpace:"自动",color:"54" }, coreNotes:{ colorTemperature:"降低面部偏黄",colorSpace:"保留自然色域",color:"保持肤色鲜活" }, modeIndex:2, color:"#c47855" },
];

function createFilterMode(preset: FilterPreset): PictureMode {
  const base = DIRECTOR_MODES[preset.modeIndex];
  return {
    ...base,
    id: `filter-${preset.name}`,
    title: preset.name,
    tags: preset.signals,
    coreParameterIds: preset.coreParameterIds,
    coreNotes: preset.coreNotes,
    values: { ...base.values, ...preset.valueOverrides },
    metadata: { ...base.metadata, recipeType: "Official Recommended", scene: `${preset.name} · Filter`, signal: preset.signals[0], compatibility: "Auto Adapted" },
  };
}

function GlassCard({
  children,
  className = "",
  focused = false,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  focused?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      animate={{ scale: focused ? 1.06 : 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`relative cursor-pointer overflow-hidden rounded-3xl ${className}`}
      style={{
        background: focused
          ? "rgba(255,255,255,0.16)"
          : "rgba(255,255,255,0.07)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: focused
          ? "1.5px solid rgba(255,59,48,0.7)"
          : "1px solid rgba(255,255,255,0.13)",
        boxShadow: focused
          ? "0 0 0 2px rgba(255,59,48,0.25), 0 24px 64px rgba(0,0,0,0.6)"
          : "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      {children}
    </motion.div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span
      className="px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full"
      style={{
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.2)",
        color: "rgba(255,255,255,0.9)",
        letterSpacing: "0.12em",
      }}
    >
      {label}
    </span>
  );
}

function TVTag({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-black tracking-wide ${
      active
        ? "border-[#ff4d5b]/70 bg-[#ff4d5b]/20 text-white"
        : "border-white/16 bg-white/[.08] text-white/72"
    }`}>
      {children}
    </span>
  );
}

function TVPrimaryButton({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-20 items-center justify-center gap-3 rounded-[28px] bg-gradient-to-br from-[#ff4d6d] to-[#d7192f] px-9 text-2xl font-black text-white shadow-[0_20px_48px_rgba(238,46,59,.36)] transition duration-200 hover:scale-[1.03] focus:scale-[1.04] focus:outline-none focus:ring-4 focus:ring-white/24 active:scale-[.98] ${className}`}
    >
      {children}
    </button>
  );
}

function TVSecondaryButton({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-20 items-center justify-center gap-3 rounded-[28px] border border-white/14 bg-white/[.055] px-9 text-2xl font-black text-white/72 transition duration-200 hover:bg-white/[.1] hover:text-white focus:scale-[1.03] focus:border-white/80 focus:text-white focus:outline-none active:scale-[.98] ${className}`}
    >
      {children}
    </button>
  );
}

function TVFocusCard({
  children,
  focused = false,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  focused?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      animate={{ scale: focused ? 1.055 : 1 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-[34px] border p-8 text-left outline-none transition ${className}`}
      style={{
        background: focused ? "rgba(255,255,255,.13)" : "rgba(255,255,255,.065)",
        borderColor: focused ? "rgba(255,255,255,.92)" : "rgba(255,255,255,.12)",
        boxShadow: focused
          ? "0 0 0 5px rgba(255,255,255,.14), 0 28px 70px rgba(0,0,0,.58)"
          : "0 14px 40px rgba(0,0,0,.28)",
        backdropFilter: "blur(28px)",
      }}
    >
      {children}
    </motion.button>
  );
}

function TVPageLayout({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="h-full w-full overflow-hidden bg-[#060b16] px-[clamp(48px,5vw,112px)] py-[clamp(36px,4.5vh,72px)] text-white">
      {eyebrow && <p className="text-lg font-black tracking-[.22em] text-[#ff5964]">{eyebrow}</p>}
      <h1 className="mt-2 text-[clamp(48px,4.4vw,72px)] font-black leading-none">{title}</h1>
      {subtitle && <p className="mt-5 max-w-[1120px] text-[clamp(24px,1.7vw,34px)] font-semibold leading-snug text-white/58">{subtitle}</p>}
      {children}
    </div>
  );
}

function PictureParameterSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/[.08] bg-white/[.055] px-6 py-5">
      <span className="block text-xl font-bold text-white/40">{label}</span>
      <b className="mt-2 block truncate text-3xl font-black text-white">{value}</b>
    </div>
  );
}

function CompareParameterRow({ label, before, after }: { label: string; before?: string; after: string }) {
  void before;
  return (
    <div className="rounded-[22px] border border-white/[.08] bg-white/[.055] px-6 py-5">
      <span className="block truncate text-xl font-bold text-white/40">{label}</span>
      <b className="mt-2 block truncate text-[clamp(26px,2vw,38px)] font-black leading-none text-white">{after}</b>
    </div>
  );
}

function PictureRecipeCard({ mode, focused, onClick }: { mode: PictureMode; focused?: boolean; onClick?: () => void }) {
  return (
    <TVFocusCard focused={focused} onClick={onClick} className="h-full p-0">
      <div className="relative h-full min-h-[360px] overflow-hidden rounded-[34px]">
        <img src={mode.image} alt={mode.title} className="absolute inset-0 h-full w-full object-cover" style={{ filter: "brightness(.55)" }} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.78)_70%)]" />
        <div className="absolute inset-x-0 bottom-0 p-8">
          <p className="text-lg font-black tracking-[.18em] text-[#ff5964]">OFFICIAL RECIPE</p>
          <h3 className="mt-3 text-5xl font-black text-white">{mode.title}</h3>
          <p className="mt-4 line-clamp-1 text-2xl font-semibold text-white/64">{mode.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {[mode.metadata.signal, mode.values.pictureMode, mode.metadata.scene].map((item) => <TVTag key={item}>{item}</TVTag>)}
          </div>
        </div>
      </div>
    </TVFocusCard>
  );
}

function SuccessState({ title, subtitle, onPrimary, onSecondary }: { title: string; subtitle: string; onPrimary: () => void; onSecondary: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <motion.div initial={{ scale: .7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-400/18 text-emerald-300 shadow-[0_0_70px_rgba(52,211,153,.3)]">
        <Check size={64} />
      </motion.div>
      <h2 className="mt-8 text-6xl font-black text-white">{title}</h2>
      <p className="mt-4 text-3xl font-semibold text-white/58">{subtitle}</p>
      <div className="mt-12 grid w-[720px] grid-cols-2 gap-5">
        <TVSecondaryButton onClick={onSecondary}>返回光影实验室</TVSecondaryButton>
        <TVPrimaryButton onClick={onPrimary}>查看效果</TVPrimaryButton>
      </div>
    </div>
  );
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function useViewportSize() {
  const getSize = () => ({
    width: typeof window === "undefined" ? 1920 : window.innerWidth,
    height: typeof window === "undefined" ? 1080 : window.innerHeight,
  });
  const [size, setSize] = useState(getSize);

  useEffect(() => {
    const update = () => setSize(getSize());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}

function RecipeDetailsPanel({ mode, confirmed, compact = false }: { mode: PictureMode; confirmed: boolean; compact?: boolean }) {
  const groups = compact ? MENU_TREE.slice(0, 6) : MENU_TREE;
  const maxItems = compact ? 8 : 999;
  return (
    <div className="preview-detail-panel h-full min-h-0 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
      <section className={`rounded-[24px] border ${compact ? "p-4" : "p-5"} ${confirmed ? "border-emerald-400/25 bg-emerald-400/[.08]" : "border-amber-400/20 bg-amber-400/[.055]"}`}>
        <div className="flex items-center justify-between gap-5">
          <div>
            <p className="text-[11px] font-black tracking-[.18em] text-white/35">AUTO ADAPTED</p>
            <h3 className={`${compact ? "mt-1 text-xl" : "mt-1 text-2xl"} font-black text-white`}>{confirmed ? "已保存并应用" : "仅预览，尚未应用"}</h3>
          </div>
          <span className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${confirmed ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-200"}`}>
            {confirmed ? "Applied" : mode.metadata.compatibility}
          </span>
        </div>
      </section>

      <section className={`${compact ? "mt-3" : "mt-5"} grid grid-cols-4 gap-2`}>
        {[
          ["信号", mode.metadata.signal],
          ["图效", mode.values.pictureMode],
          ["场景", mode.metadata.scene],
          ["设备", "TCL C11K MiniLED"],
        ].map(([label, value]) => (
          <div key={label} className={`rounded-[18px] border border-white/[.07] bg-white/[.035] ${compact ? "p-3" : "p-4"}`}>
            <span className="block text-xs font-bold text-white/30">{label}</span>
            <b className={`${compact ? "mt-1 text-base" : "mt-2 text-lg"} block truncate text-white/82`}>{value}</b>
          </div>
        ))}
      </section>

      <section className={compact ? "mt-3" : "mt-6"}>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h3 className={`${compact ? "text-xl" : "text-2xl"} font-black text-white`}>画质设置参数</h3>
            <p className="mt-1 text-sm text-white/35">来自电视设置菜单，仅展示菜单名称与当前调节值</p>
          </div>
          <span className="rounded-full bg-white/[.06] px-4 py-2 text-xs font-bold text-white/42">{groups.length} 个分组</span>
        </div>

        <div className={`${compact ? "space-y-2 pb-1" : "space-y-3 pb-4"}`}>
          {groups.map((group) => (
            <div key={group.id} className={`rounded-[22px] border ${group.advanced ? "border-amber-400/18 bg-amber-400/[.035]" : "border-white/[.07] bg-white/[.025]"} ${compact ? "p-3" : "p-4"}`}>
              <div className="mb-3 grid grid-cols-[1fr_auto] items-center gap-4">
                <div className="min-w-0">
                  <h4 className={`${compact ? "text-lg" : "text-xl"} truncate font-black text-white`}>{group.title}</h4>
                  {!compact && <p className="mt-1 truncate text-xs text-white/30">{group.subtitle}</p>}
                </div>
                <span className="rounded-full bg-black/25 px-3 py-1.5 text-xs font-bold text-white/38">{group.items.length} 项</span>
              </div>

              <div className={`grid ${compact ? "grid-cols-4 gap-2" : "grid-cols-4 gap-3"}`}>
                {getGroupItems(mode, group).slice(0, maxItems).map((item) => (
                  <div key={item.id} className={`min-w-0 rounded-[16px] border border-white/[.055] bg-black/20 ${compact ? "px-3 py-2.5" : "p-3"}`}>
                    <strong className={`${compact ? "text-base" : "text-xl"} block truncate font-black text-white`}>{item.label}：{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function makeRecipeCode(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return `PQ-TCL-${(hash || 92817).toString(36).toUpperCase().slice(0, 5)}${Math.floor(100 + Math.random() * 899)}`;
}

function validateRecipeName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "请输入方案名称";
  if (trimmed.length < 2) return "方案名称至少 2 个字";
  if (trimmed.length > 12) return "方案名称不超过 12 个字";
  if (/[<>/\\{}]/.test(trimmed)) return "不能包含特殊符号";
  return "";
}

function SaveCurrentPictureModal({ open, intent = "share", onClose, onSave }: { open: boolean; intent?: "save" | "share"; onClose: () => void; onSave: (name: string) => void }) {
  const [recipeName, setRecipeName] = useState("我的夜间影院");
  const [summary, setSummary] = useState("适合夜间观影，保留暗场层次并降低高光刺激。");
  const [tags, setTags] = useState(["电影", "夜间"]);
  const [touched, setTouched] = useState(false);
  const tagOptions = ["电影", "游戏", "体育", "动漫", "护眼", "夜间", "儿童", "直播"];
  const nameError = validateRecipeName(recipeName);
  const isSaveIntent = intent === "save";

  const submit = (next: (name: string) => void) => {
    setTouched(true);
    if (nameError) return;
    next(recipeName.trim());
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (e.key === "Escape" || (e.key === "Backspace" && !isTyping)) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <motion.div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/68 px-12 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ y: 28, scale: .96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 18, scale: .97, opacity: 0 }} className="w-[980px] rounded-[42px] border border-white/14 bg-[#10141a]/95 p-10 shadow-[0_40px_120px_rgba(0,0,0,.7)]">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-lg font-black tracking-[.22em] text-[#ff5964]">{isSaveIntent ? "SAVE PICTURE" : "SHARE PICTURE"}</p>
            <h2 className="mt-3 text-6xl font-black text-white">{isSaveIntent ? "保存当前方案" : "分享画质参数"}</h2>
            <p className="mt-4 text-2xl font-semibold text-white/50">{isSaveIntent ? "命名当前画质，保存到我的方案。" : "命名当前画质，生成可导入的分享码。"}</p>
          </div>
          <button onClick={onClose} aria-label="关闭创建弹窗" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/[.05] text-white/55 hover:bg-white/10 hover:text-white focus:border-white focus:text-white">
            <X size={30} />
          </button>
        </div>

        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-3 block text-2xl font-bold text-white/58">方案名称</span>
            <input value={recipeName} onBlur={() => setTouched(true)} onChange={(e) => setRecipeName(e.target.value)} maxLength={12} className={`h-24 w-full rounded-[30px] border bg-white/[.06] px-8 text-4xl font-black text-white outline-none transition placeholder:text-white/20 focus:bg-white/[.09] ${touched && nameError ? "border-[#ff4d5b] focus:border-[#ff4d5b]" : "border-white/10 focus:border-white/80"}`} placeholder="例如：我的夜间影院" />
            {touched && nameError && <span className="mt-3 block text-xl font-bold text-[#ff6670]">{nameError}</span>}
          </label>

          <label className="block">
            <span className="mb-3 block text-2xl font-bold text-white/58">一句话介绍</span>
            <input value={summary} onChange={(e) => setSummary(e.target.value)} className="h-20 w-full rounded-[28px] border border-white/10 bg-white/[.06] px-8 text-2xl font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-white/80 focus:bg-white/[.09]" placeholder="这套画质适合什么场景？" />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[26px] border border-white/[.08] bg-white/[.04] p-5">
              <span className="block text-xl font-bold text-white/38">自动识别设备</span>
              <strong className="mt-2 block text-3xl font-black text-white">TCL C11K MiniLED</strong>
            </div>
            <div className="rounded-[26px] border border-white/[.08] bg-white/[.04] p-5">
              <span className="block text-xl font-bold text-white/38">当前信号 / 图像模式</span>
              <strong className="mt-2 block text-3xl font-black text-white">HDR10 · 电影模式</strong>
            </div>
          </div>

          <div>
            <span className="mb-4 block text-2xl font-bold text-white/58">场景标签</span>
            <div className="flex flex-wrap gap-3">
              {tagOptions.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button key={tag} onClick={() => setTags((list) => active ? list.filter((item) => item !== tag) : [...list, tag])} className={`rounded-[24px] border px-7 py-4 text-2xl font-black transition focus:scale-[1.04] focus:outline-none ${active ? "border-[#ff4d5b] bg-[#ff4d5b]/18 text-white" : "border-white/10 bg-white/[.05] text-white/45 hover:text-white"}`}>
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-[.8fr_1.2fr] gap-4">
          <TVSecondaryButton onClick={onClose}>取消</TVSecondaryButton>
          <TVPrimaryButton onClick={() => submit(onSave)}>
            {isSaveIntent ? <Save size={24} /> : <Play size={24} />}
            {isSaveIntent ? "保存到我的方案" : "下一步"}
          </TVPrimaryButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ShareCodeModal({ open, title, code, onClose }: { open: boolean; title: string; code: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <motion.div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/70 px-12 backdrop-blur-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ y: 24, scale: .97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 16, opacity: 0 }} className="w-[min(980px,78vw)] rounded-[42px] border border-white/14 bg-[#10141a]/96 p-10 shadow-[0_36px_110px_rgba(0,0,0,.72)]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-black tracking-[.22em] text-[#ff5964]">SHARE RECIPE</p>
            <h2 className="mt-3 text-6xl font-black text-white">方案分享码已生成</h2>
          </div>
          <button onClick={onClose} className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[.05] text-white/55 hover:text-white focus:border-white"><X size={30} /></button>
        </div>
        <div className="mt-10">
          <span className="text-2xl font-bold text-white/50">分享码</span>
          <div className="mt-4 overflow-hidden rounded-[34px] border border-white/12 bg-white/[.07] px-10 py-9 font-mono text-[clamp(44px,4.2vw,72px)] font-black tracking-[.1em] text-white whitespace-nowrap">{code}</div>
          <p className="mt-6 text-2xl font-semibold leading-snug text-white/50">{title} 可通过分享码导入。</p>
        </div>
        <div className="mt-10">
          <TVPrimaryButton onClick={onClose} className="h-[76px] text-2xl">
            完成
          </TVPrimaryButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DeleteRecipeModal({ open, title, onCancel, onConfirm }: { open: boolean; title: string; onCancel: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return createPortal((
    <motion.div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/72 px-12 backdrop-blur-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ y: 20, scale: .97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 14, opacity: 0 }} className="w-[min(980px,72vw)] rounded-[40px] border border-white/14 bg-[#10141a]/97 p-10 shadow-[0_36px_110px_rgba(0,0,0,.72)]">
        <div className="flex items-start gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[28px] bg-[#ff3b48]/16 text-[#ff5b64]">
            <Trash2 size={38} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-black tracking-[.22em] text-[#ff5964]">DELETE RECIPE</p>
            <h2 className="mt-3 text-5xl font-black leading-tight text-white">删除这个方案？</h2>
            <p className="mt-5 text-2xl font-semibold leading-snug text-white/58">「{title}」删除后会从我的方案中移除。</p>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-[1fr_1.18fr] gap-5">
          <TVSecondaryButton onClick={onCancel} className="h-[78px] text-2xl">取消</TVSecondaryButton>
          <button onClick={onConfirm} className="flex h-[78px] items-center justify-center gap-3 rounded-[26px] bg-[#ff3b48]/16 text-2xl font-black text-[#ff6a73] ring-1 ring-[#ff3b48]/35 transition hover:bg-[#ff3b48]/24 focus:outline-none focus:ring-4 focus:ring-[#ff3b48]/45">
            <Trash2 size={28} />
            确认删除
          </button>
        </div>
      </motion.div>
    </motion.div>
  ), document.body);
}

function ApplyRecipeConfirmModal({ open, mode, onCancel, onConfirm }: { open: boolean; mode: PictureMode; onCancel: () => void; onConfirm: () => void }) {
  if (!open) return null;
  const pictureMode = mode.values.pictureMode || "当前图效";
  const signal = mode.metadata.signal || "当前信号";
  return createPortal((
    <motion.div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/72 px-12 backdrop-blur-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ y: 20, scale: .97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 14, opacity: 0 }} className="w-[min(1080px,76vw)] rounded-[40px] border border-white/14 bg-[#10141a]/97 p-10 shadow-[0_36px_110px_rgba(0,0,0,.72)]">
        <div className="flex items-start gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[28px] bg-[#f23844]/16 text-[#ff5964]">
            <Save size={38} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-black tracking-[.22em] text-[#ff5964]">APPLY RECIPE</p>
            <h2 className="mt-3 text-5xl font-black leading-tight text-white">应用到 {pictureMode}？</h2>
            <p className="mt-5 text-2xl font-semibold leading-snug text-white/62">
              此方案将覆盖「{signal}」信号下的「{pictureMode}」画质设置。
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-amber-300/20 bg-amber-300/8 p-6">
          <p className="text-2xl font-black text-amber-200">不会新建图效</p>
          <p className="mt-3 text-xl font-semibold leading-snug text-white/55">
            每个信号下的每个图效只会生效一套方案。确认后会覆盖当前图效已应用的方案，但不会删除“我的方案”里保存的其他方案。
          </p>
        </div>

        <div className="mt-10 grid grid-cols-[1fr_1.28fr] gap-5">
          <TVSecondaryButton onClick={onCancel} className="h-[78px] text-2xl">取消</TVSecondaryButton>
          <TVPrimaryButton onClick={onConfirm} className="h-[78px] text-2xl">
            <Check size={28} />
            确认应用
          </TVPrimaryButton>
        </div>
      </motion.div>
    </motion.div>
  ), document.body);
}

function SaveRecipeConfirmModal({ open, mode, onCancel, onConfirm }: { open: boolean; mode: PictureMode; onCancel: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return createPortal((
    <motion.div className="fixed inset-0 z-[181] flex items-center justify-center bg-black/72 px-12 backdrop-blur-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ y: 20, scale: .97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 14, opacity: 0 }} className="w-[min(980px,74vw)] rounded-[40px] border border-white/14 bg-[#10141a]/97 p-10 shadow-[0_36px_110px_rgba(0,0,0,.72)]">
        <div className="flex items-start gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[28px] bg-emerald-400/14 text-emerald-300">
            <Save size={38} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-black tracking-[.22em] text-emerald-300">SAVE RECIPE</p>
            <h2 className="mt-3 text-5xl font-black leading-tight text-white">保存当前方案？</h2>
            <p className="mt-5 text-2xl font-semibold leading-snug text-white/62">
              「{mode.title}」会保存到我的方案，方便之后再次预览、分享或应用。
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[.045] p-6">
          <p className="text-xl font-semibold leading-snug text-white/55">
            保存不会立即覆盖电视图效；只有选择“应用方案”后才会写入当前信号下的对应图效。
          </p>
        </div>

        <div className="mt-10 grid grid-cols-[1fr_1.28fr] gap-5">
          <TVSecondaryButton onClick={onCancel} className="h-[78px] text-2xl">取消</TVSecondaryButton>
          <TVPrimaryButton onClick={onConfirm} className="h-[78px] text-2xl">
            <Save size={28} />
            确认保存
          </TVPrimaryButton>
        </div>
      </motion.div>
    </motion.div>
  ), document.body);
}

function ImportRecipeModal({ open, onClose, onPreview }: { open: boolean; onClose: () => void; onPreview: () => void }) {
  const [code, setCode] = useState("PQ-TCL-9A28F");
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && code.trim()) onPreview();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [code, onClose, onPreview, open]);
  if (!open) return null;
  return (
    <motion.div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/64 px-12 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ y: 24, scale: .97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 16, opacity: 0 }} className="w-[min(980px,78vw)] rounded-[44px] border border-white/14 bg-[#10141a]/96 p-10 shadow-[0_36px_110px_rgba(0,0,0,.72)]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-black tracking-[.22em] text-[#38d0aa]">IMPORT RECIPE</p>
            <h2 className="mt-3 text-6xl font-black text-white">导入画质方案</h2>
          </div>
          <button onClick={onClose} className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[.05] text-white/55 hover:text-white focus:border-white"><X size={30} /></button>
        </div>
        <div className="mt-10">
          <label>
            <span className="mb-4 block text-2xl font-bold text-white/52">分享码</span>
            <input value={code} autoFocus onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="PQ-TCL-9A28F" className="h-28 w-full rounded-[34px] border border-white/12 bg-white/[.07] px-9 font-mono text-[clamp(38px,3.4vw,58px)] font-black tracking-[.12em] text-white outline-none focus:border-white/90" />
          </label>
          <div className="mt-10 grid grid-cols-[.8fr_1.2fr] gap-4">
            <TVSecondaryButton onClick={onClose} className="h-[76px]">返回</TVSecondaryButton>
            <TVPrimaryButton onClick={onPreview} className="h-[76px]"><Upload size={28} />预览方案</TVPrimaryButton>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ImportedParameterPreviewModal({ open, mode, flow = "import", onClose, onSave, onShare, onApply }: { open: boolean; mode: PictureMode; flow?: "import" | "share"; onClose: () => void; onSave?: () => void; onShare?: () => void; onApply?: () => void }) {
  const isShare = flow === "share";
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [applyConfirmOpen, setApplyConfirmOpen] = useState(false);
  const previewGroups = PARAMETER_TABLE_GROUPS;
  const metaCards = isShare
    ? [["电视型号", "TCL C11K"], ["信源", "HDMI 1"], ["信号", mode.metadata.signal], ["图效", mode.values.pictureMode]]
    : [["方案名称", mode.title], ["信号", mode.metadata.signal], ["图效", mode.values.pictureMode], ["状态", "尚未应用"]];
  if (!open) return null;
  return createPortal((
    <motion.div
      className="fixed inset-0 z-[165] flex items-center justify-center overflow-hidden bg-black/68 p-[clamp(18px,2.4vw,56px)] backdrop-blur-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ y: 22, scale: .97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 14, scale: .98, opacity: 0 }}
        className="flex max-h-[calc(100vh-clamp(36px,4.8vw,112px))] min-h-[min(820px,84vh)] w-[97vw] max-w-[2200px] flex-col overflow-hidden rounded-[clamp(30px,2.2vw,54px)] border border-white/22 bg-black/72 p-[clamp(22px,1.7vw,44px)] shadow-[0_34px_120px_rgba(0,0,0,.78)] ring-1 ring-white/8 backdrop-blur-2xl"
      >
        <div className="mb-[clamp(18px,1.4vw,34px)] flex shrink-0 items-start justify-between gap-8">
          <div>
            <p className={`text-[clamp(13px,.9vw,18px)] font-black tracking-[.28em] ${isShare ? "text-[#ff5964]" : "text-[#38d0aa]"}`}>{isShare ? "SHARE PICTURE" : "IMPORT PREVIEW"}</p>
            <h2 className="mt-2 text-[clamp(42px,3.15vw,76px)] font-black leading-none text-white">{isShare ? "分享画质参数" : "导入方案预览"}</h2>
          </div>
          <button onClick={onClose} className="flex h-[clamp(54px,4.2vw,76px)] w-[clamp(54px,4.2vw,76px)] shrink-0 items-center justify-center rounded-[24px] border border-white/12 bg-white/[.06] text-white/55 transition hover:bg-white/12 hover:text-white focus:scale-105 focus:border-white focus:text-white"><X size={30} /></button>
        </div>

        <div className="grid shrink-0 grid-cols-4 gap-[clamp(10px,.85vw,20px)]">
          {metaCards.map(([label, value]) => (
            <div key={label} className="min-w-0 rounded-[clamp(18px,1.3vw,28px)] border border-white/[.11] bg-white/[.055] px-[clamp(16px,1.1vw,26px)] py-[clamp(13px,.95vw,22px)]">
              <span className="block truncate text-[clamp(14px,.82vw,19px)] font-bold text-white/36">{label}</span>
              <b className="mt-1 block truncate text-[clamp(22px,1.32vw,34px)] font-black text-white">{value}</b>
            </div>
          ))}
        </div>

        <div className="mt-[clamp(16px,1.2vw,28px)] min-h-0 flex-1 overflow-y-auto pr-2 [scrollbar-width:thin]">
          <div className="mb-[clamp(12px,.9vw,22px)] flex items-end justify-between gap-6">
            <div>
              <h3 className="text-[clamp(28px,1.75vw,42px)] font-black leading-none text-white">画质设置参数</h3>
              <p className="mt-2 text-[clamp(15px,.9vw,21px)] font-bold text-white/40">全量设置菜单 · 仅展示菜单项与当前方案值</p>
            </div>
            <span className="shrink-0 rounded-full bg-white/[.07] px-[clamp(14px,.9vw,22px)] py-[clamp(8px,.55vw,14px)] text-[clamp(14px,.8vw,18px)] font-black text-white/50">{previewGroups.length} 个分组</span>
          </div>

          <div className="space-y-[clamp(12px,.9vw,22px)]">
            {previewGroups.map((group) => (
              <section key={group.id} className="rounded-[clamp(22px,1.45vw,34px)] border border-white/[.12] bg-white/[.045] p-[clamp(16px,1.15vw,28px)] shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
                <div className="mb-[clamp(12px,.85vw,20px)] flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="truncate text-[clamp(24px,1.55vw,36px)] font-black leading-none text-white">{group.title}</h4>
                    <p className="mt-1 truncate text-[clamp(13px,.78vw,18px)] font-bold text-white/32">{group.subtitle}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-black/28 px-[clamp(12px,.8vw,18px)] py-[clamp(6px,.45vw,10px)] text-[clamp(12px,.72vw,16px)] font-black text-white/42">{group.items.length} 项</span>
                </div>
                <div
                  className="grid gap-[clamp(8px,.65vw,16px)]"
                  style={{ gridTemplateColumns: "repeat(auto-fit, minmax(clamp(190px, 13.5vw, 320px), 1fr))" }}
                >
                  {getGroupItems(mode, group).map((item) => (
                    <div key={item.id} className="min-w-0 rounded-[clamp(14px,.9vw,22px)] bg-black/34 px-[clamp(13px,.9vw,22px)] py-[clamp(10px,.75vw,18px)]">
                      <strong className="block truncate text-[clamp(17px,1.05vw,26px)] font-black leading-tight text-white">{item.label}：{item.value}</strong>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="mt-[clamp(18px,1.4vw,34px)] grid shrink-0 grid-cols-[1fr_1fr_1.35fr] gap-4">
          <TVSecondaryButton onClick={onClose} className="h-[clamp(62px,6vh,92px)] text-[clamp(20px,1.35vw,30px)]">取消</TVSecondaryButton>
          <TVSecondaryButton onClick={() => setSaveConfirmOpen(true)} className="h-[clamp(62px,6vh,92px)] text-[clamp(20px,1.35vw,30px)]">
            <Save size={28} />
            保存当前方案
          </TVSecondaryButton>
          <TVPrimaryButton onClick={isShare ? onShare : () => setApplyConfirmOpen(true)} className="h-[clamp(62px,6vh,92px)] text-[clamp(20px,1.35vw,30px)]">
            {isShare ? <Share2 size={28} /> : <Check size={28} />}
            {isShare ? "分享画质参数" : "应用方案"}
          </TVPrimaryButton>
        </div>
        <AnimatePresence>
          <SaveRecipeConfirmModal
            open={saveConfirmOpen}
            mode={mode}
            onCancel={() => setSaveConfirmOpen(false)}
            onConfirm={() => {
              setSaveConfirmOpen(false);
              onSave?.();
            }}
          />
        </AnimatePresence>
        <AnimatePresence>
          <ApplyRecipeConfirmModal
            open={applyConfirmOpen}
            mode={mode}
            onCancel={() => setApplyConfirmOpen(false)}
            onConfirm={() => {
              setApplyConfirmOpen(false);
              onApply?.();
            }}
          />
        </AnimatePresence>
      </motion.div>
    </motion.div>
  ), document.body);
}

function PictureSettingsMenu({ onOpenRecipeCenter }: { onOpenRecipeCenter: () => void }) {
  const menuItems = [
    { label: "亮度", value: "", disabled: false },
    { label: "色彩", value: "", disabled: false },
    { label: "运动", value: "", disabled: false },
    { label: "清晰度", value: "", disabled: false },
    { label: "光影实验室", value: "", disabled: false, action: onOpenRecipeCenter },
    { label: "信号范围", value: "自动", disabled: true },
    { label: "显示标准", value: "自动", disabled: true },
  ];
  const sideIcons = [Film, Zap, Activity, Share2, Sparkles, SlidersHorizontal, Info];

  return (
    <motion.div
      initial={{ opacity: 0, x: -22 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute inset-y-0 left-0 z-40 flex w-[820px] max-w-[48vw] bg-[#141924]/96 shadow-[34px_0_90px_rgba(0,0,0,.34)] backdrop-blur-xl"
    >
      <aside className="flex w-[92px] shrink-0 flex-col items-center gap-11 bg-[#101520]/92 pt-20 text-white/65">
        {sideIcons.map((Icon, index) => (
          <button key={index} className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${index === 0 ? "bg-[#5367ff]/18 text-[#7e8dff]" : "hover:bg-white/[.08] hover:text-white"}`}>
            <Icon size={24} />
          </button>
        ))}
      </aside>

      <main className="min-w-0 flex-1 px-12 py-16">
        <h1 className="text-5xl font-light tracking-wide text-white">图像</h1>
        <div className="mt-6 flex items-center gap-3 text-2xl font-semibold text-white/80">
          <span className="h-5 w-8 rounded-full bg-white/80" />
          Dolby Vision
        </div>

        <button className="mt-12 grid h-28 w-full grid-cols-[1fr_auto_1fr] items-center rounded-[18px] bg-white/82 px-8 text-left text-[28px] font-medium text-black shadow-[0_18px_36px_rgba(0,0,0,.22)]">
          <span>图效模式</span>
          <ChevronRight size={24} className="rotate-180 text-black/35" />
          <span className="justify-self-end">杜比视界IQ</span>
        </button>

        <p className="mb-7 mt-11 text-2xl font-medium text-white/82">高级设置</p>
        <div className="overflow-hidden rounded-[20px] bg-[#1d2530]/94">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.action}
              disabled={item.disabled}
              className={`group flex h-[96px] w-full items-center justify-between border-b border-white/[.035] px-8 text-left text-[28px] transition last:border-b-0 ${
                item.label === "光影实验室"
                  ? "bg-gradient-to-r from-[#e31937]/22 to-transparent text-white ring-2 ring-[#ff4d5b]/50"
                  : item.disabled
                    ? "text-white/20"
                    : "text-white/88 hover:bg-white/[.07] focus:bg-white/[.09]"
              }`}
            >
              <span className="font-medium">{item.label}</span>
              <span className="flex items-center gap-5 text-[22px] text-white/45">
                {item.value && <em className="not-italic">{item.value}</em>}
                <ChevronRight size={36} className={item.disabled ? "text-white/18" : "text-white/70"} />
              </span>
            </button>
          ))}
        </div>
      </main>
    </motion.div>
  );
}

// ─── HOME PAGE ───────────────────────────────────────────────────────────────
function HomePage({ onNavigate, onPreview, onSaveCurrentRecipe }: { onNavigate: (p: Page) => void; onPreview: (mode: PictureMode) => void; onSaveCurrentRecipe: (name: string) => void }) {
  const [focused, setFocused] = useState(0);
  const [homeToast, setHomeToast] = useState("");
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveIntent, setSaveIntent] = useState<"save" | "share">("share");
  const [draftRecipeName, setDraftRecipeName] = useState("我的夜间影院");
  const [sharePreviewOpen, setSharePreviewOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importPreviewOpen, setImportPreviewOpen] = useState(false);
  const [shareCode, setShareCode] = useState<{ title: string; code: string } | null>(null);
  const [recipeOverlayOpen, setRecipeOverlayOpen] = useState(false);
  const heroMode = DIRECTOR_MODES[0];
  const currentPictureMeta = [
    ["电视型号", "TCL C11K"],
    ["信源", "HDMI 1"],
    ["信号", "HDR10"],
    ["图效", "TSR计算画质"],
  ];
  const currentPictureGroups = [
    {
      title: "亮度",
      items: [
        ["亮度", String(heroMode.values.screenBrightness)],
        ["区域背光", "高"],
        ["动态对比度", "关"],
        ["峰值亮度", "中"],
      ],
    },
    {
      title: "色彩",
      items: [
        ["饱和度", String(heroMode.values.color)],
        ["色调", "52"],
        ["色温", heroMode.values.colorTemperature],
        ["色彩增强", "低"],
        ["白平衡", "默认"],
        ["色彩空间", "自动"],
      ],
    },
    {
      title: "运动",
      items: [
        ["运动补偿", heroMode.values.memc],
        ["DLG", "关"],
        ["LED运动清晰", "关"],
      ],
    },
    {
      title: "清晰度",
      items: [
        ["锐利度", String(heroMode.values.sharpness)],
        ["水印平滑", "低"],
        ["MPEG降噪", "自动"],
        ["降噪", "低"],
        ["超清分辨率", "中"],
        ["精准细节", "低"],
      ],
    },
  ];

  const functionCards = [
    { label: "官方方案", icon: ChefHat, page: "recommended" as Page, desc: "发现适合当前内容的画质方案", meta: "大师与官方精选", color: "#f0525d" },
    { label: "我的方案", icon: SlidersHorizontal, page: "myrecipes" as Page, desc: "查看已保存和正在使用的方案", meta: "已保存 4 个方案", color: "#5b7cfa" },
    { label: "导入方案", icon: Upload, page: "share" as Page, desc: "导入他人分享的画质方案", meta: "先预览再应用", color: "#38b998" },
    { label: "分享画质参数", icon: Share2, page: "home" as Page, desc: "分享当前屏幕画质", meta: "自动识别当前信号", color: "#ffb84d" },
  ];
  const openFunctionCard = useCallback((index: number) => {
    if (index === 2) {
      setImportModalOpen(true);
      return;
    }
    if (index === 3) {
      setSaveIntent("share");
      setSaveModalOpen(true);
      return;
    }
    onNavigate(functionCards[index].page);
  }, [onNavigate]);
  const activateFocused = useCallback(() => {
    openFunctionCard(focused);
  }, [focused, openFunctionCard]);
  const maxFocus = functionCards.length - 1;

  useEffect(() => {
    if (!recipeOverlayOpen) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.("[data-current-picture-control]")) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setFocused((f) => Math.min(f + 1, maxFocus));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setFocused((f) => Math.max(f - 1, 0));
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocused((f) => f);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocused((f) => f);
      }
      if (e.key === "Enter") activateFocused();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activateFocused, maxFocus, recipeOverlayOpen]);

  useEffect(() => {
    if (!homeToast) return;
    const timer = window.setTimeout(() => setHomeToast(""), 2000);
    return () => window.clearTimeout(timer);
  }, [homeToast]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#07090c]" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <section className="home-hero relative h-full overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={HERO_IMAGE}
          aria-label="TCL 光影实验室画质演示视频"
        >
          <source src={DEMO_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg,rgba(3,5,8,.18) 0%,rgba(3,5,8,.04) 52%,rgba(3,5,8,.12) 100%),linear-gradient(180deg,rgba(0,0,0,.18),transparent 40%,rgba(0,0,0,.36) 100%)" }} />

        <header className="absolute inset-x-0 top-0 flex items-center justify-between px-12 pt-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-16 items-center justify-center rounded-lg bg-[#e31937] text-base font-black tracking-tight text-white">TCL</div>
            <div><p className="text-lg font-bold text-white">光影实验室</p><p className="text-xs font-semibold tracking-[.16em] text-white/40">画质方案</p></div>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-white/60">
            <span className="flex items-center gap-2"><Activity size={16} className="text-[#ff4c58]" />HDR10 信号</span>
            <span className="rounded-full border border-white/15 bg-black/25 px-4 py-2">TCL C11K MiniLED</span>
          </div>
        </header>

        {!recipeOverlayOpen && <PictureSettingsMenu onOpenRecipeCenter={() => setRecipeOverlayOpen(true)} />}

        {recipeOverlayOpen && <div
          data-current-picture-control
          tabIndex={0}
          className="home-current-picture absolute right-10 top-[82px] z-[70] w-[clamp(650px,34vw,1120px)] rounded-[28px] border border-white/18 bg-black/66 p-5 backdrop-blur-2xl outline-none transition focus:border-white/80 focus:shadow-[0_0_0_4px_rgba(255,255,255,.13)] 2xl:right-16 2xl:top-[96px] 2xl:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.18em] text-[#ff6670] 2xl:text-xs">CURRENT PICTURE</p>
              <h2 className="mt-1 text-[26px] font-black leading-tight text-white 2xl:text-[32px]">当前屏幕画质</h2>
            </div>
            <span className="rounded-full bg-emerald-400/15 px-4 py-2 text-xs font-black text-emerald-300 2xl:text-sm">已识别</span>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {currentPictureMeta.map(([label, value]) => (
              <div key={label} className="min-w-0 rounded-xl border border-white/[.08] bg-white/[.055] px-3 py-2.5">
                <span className="block text-[10px] font-bold text-white/35 2xl:text-xs">{label}</span>
                <b className="mt-0.5 block truncate text-[14px] font-black text-white/82 2xl:text-[17px]">{value}</b>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {currentPictureGroups.map((group) => (
              <section key={group.title} className="rounded-[20px] border border-white/[.08] bg-white/[.045] p-3 2xl:p-4">
                <h3 className="text-[18px] font-black text-white 2xl:text-[22px]">{group.title}</h3>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {group.items.map(([label, value]) => (
                    <div key={`${group.title}-${label}`} className="min-w-0 rounded-xl bg-black/26 px-3 py-2">
                      <span className="block truncate text-[10px] font-bold text-white/38 2xl:text-xs">{label}</span>
                      <b className="mt-0.5 block truncate text-[15px] font-black text-white/88 2xl:text-[18px]">{value}</b>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-[.92fr_1.08fr] gap-3">
            <button data-testid="save-current-recipe" onClick={() => { setSaveIntent("save"); setSaveModalOpen(true); }} className="flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-white/12 bg-white/[.08] text-base font-black text-white/86 transition hover:scale-[1.01] hover:bg-white/[.12] focus:scale-[1.01] focus:ring-2 focus:ring-white 2xl:h-14 2xl:text-xl">
              <Save size={20} />
              保存当前方案
            </button>
            <button data-testid="share-current-picture" onClick={() => { setSaveIntent("share"); setSaveModalOpen(true); }} className="flex h-12 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-br from-[#f23844] to-[#c61927] text-base font-black text-white shadow-[0_12px_30px_rgba(238,46,59,.28)] transition hover:scale-[1.01] focus:scale-[1.01] focus:ring-2 focus:ring-white 2xl:h-14 2xl:text-xl">
              <Share2 size={20} />
              分享画质参数
            </button>
          </div>
        </div>}
      </section>

      <AnimatePresence>
      {recipeOverlayOpen && <motion.section initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 32 }} className="home-main absolute inset-x-0 bottom-0 z-50 px-12 pb-8 pt-7" style={{ maxHeight: "42vh", background: "linear-gradient(180deg,rgba(7,9,12,.08) 0%,rgba(7,9,12,.9) 20%,#07090c 100%)" }}>
        <div className="mb-4 flex items-end justify-between">
          <div><p className="text-xs font-bold tracking-[.18em] text-[#e94a55]">LIGHT STUDIO</p><h2 className="mt-1 text-3xl font-black text-white">光影实验室</h2><p className="mt-1 text-sm font-semibold text-white/42">保存、导入和发现更适合你的画质方案</p></div>
          <button onClick={() => setRecipeOverlayOpen(false)} className="flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[.06] px-5 text-sm font-black text-white/62 hover:bg-white/[.11] hover:text-white focus:border-white">
            <X size={18} />
            返回图像设置
          </button>
        </div>
        <div className="grid grid-cols-4 gap-5">
          {functionCards.map((item, i) => (
            <motion.button key={item.label} onMouseEnter={() => setFocused(i)} onFocus={() => setFocused(i)} onClick={() => openFunctionCard(i)} animate={{ scale: focused === i ? 1.025 : 1 }} className="home-function-card group relative flex h-[clamp(128px,15.5vh,168px)] items-center overflow-hidden rounded-[28px] border p-7 text-left" style={{ background: i === 0 ? "linear-gradient(135deg,#2a1118,#171a20 72%)" : "linear-gradient(145deg,#1b1f26,#11141a)", borderColor: focused === i ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.1)", boxShadow: focused === i ? "0 0 0 5px rgba(255,255,255,.14),0 24px 55px rgba(0,0,0,.55)" : "0 14px 34px rgba(0,0,0,.25)" }}>
              <span className="mr-6 flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl" style={{ background: `${item.color}24`, color: item.color }}><item.icon size={34} /></span><div className="min-w-0 flex-1"><div className="flex items-center justify-between"><h3 className="text-2xl font-black text-white">{item.label}</h3><ChevronRight size={26} className="text-white/24 transition group-hover:text-white/75" /></div><p className="mt-3 truncate text-base text-white/52">{item.desc}</p><p className="mt-4 text-sm font-semibold" style={{ color: `${item.color}dd` }}>{item.meta}</p></div>
              <div className="absolute bottom-0 left-0 h-[3px] transition-all" style={{ width: focused === i ? "100%" : "0%", background: item.color }} />
            </motion.button>
          ))}
        </div>

      </motion.section>}
      </AnimatePresence>
      <AnimatePresence>
        <SaveCurrentPictureModal
          open={saveModalOpen}
          intent={saveIntent}
          onClose={() => setSaveModalOpen(false)}
          onSave={(name) => {
            setSaveModalOpen(false);
            setDraftRecipeName(name);
            if (saveIntent === "save") {
              onSaveCurrentRecipe(name);
              setHomeToast("已保存到我的方案");
              return;
            }
            setSharePreviewOpen(true);
          }}
        />
      </AnimatePresence>
      <AnimatePresence><ImportRecipeModal open={importModalOpen} onClose={() => setImportModalOpen(false)} onPreview={() => { setImportModalOpen(false); setImportPreviewOpen(true); }} /></AnimatePresence>
      <AnimatePresence><ImportedParameterPreviewModal open={sharePreviewOpen} flow="share" mode={heroMode} onClose={() => setSharePreviewOpen(false)} onSave={() => { onSaveCurrentRecipe(draftRecipeName); setSharePreviewOpen(false); setHomeToast("已保存到我的方案"); }} onShare={() => { setSharePreviewOpen(false); setShareCode({ title: draftRecipeName, code: makeRecipeCode(draftRecipeName) }); }} /></AnimatePresence>
      <AnimatePresence><ImportedParameterPreviewModal open={importPreviewOpen} flow="import" mode={DIRECTOR_MODES[0]} onClose={() => setImportPreviewOpen(false)} onSave={() => { setImportPreviewOpen(false); setHomeToast("已保存到我的方案"); }} onApply={() => { setImportPreviewOpen(false); setHomeToast("已应用"); }} /></AnimatePresence>
      <AnimatePresence><ShareCodeModal open={!!shareCode} title={shareCode?.title ?? ""} code={shareCode?.code ?? ""} onClose={() => setShareCode(null)} /></AnimatePresence>
      <AnimatePresence>{homeToast && <motion.div initial={{ opacity: 0, y: 18, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }} className="fixed bottom-8 left-1/2 z-[140] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-emerald-300/20 bg-[#101a17]/95 px-6 py-4 text-sm font-bold text-emerald-200 shadow-[0_20px_60px_rgba(0,0,0,.55)] backdrop-blur-xl"><Check size={18} />{homeToast}</motion.div>}</AnimatePresence>
    </div>
  );
}

// ─── AI PAGE ─────────────────────────────────────────────────────────────────
function AIPage({ onBack, onPreview }: { onBack: () => void; onPreview: (mode: PictureMode) => void }) {
  const [listening, setListening] = useState(false);
  const [activeChip, setActiveChip] = useState<number | null>(null);
  const [responded, setResponded] = useState(false);

  const chips = [
    { label: "画面太暗", icon: Moon, color: "#5E5CE6" },
    { label: "画面太亮", icon: Sun, color: "#FF9500" },
    { label: "肤色偏黄", icon: Eye, color: "#34C759" },
    { label: "运动模糊", icon: Activity, color: "#FF3B30" },
  ];
  const intentMappings = [
    { name:"暗场清晰方案", benefit:"暗部更清楚，同时保持 MiniLED 深黑", adjustments:["亮度 +10","黑电平 +2","峰值亮度：高","伽马：2.2"] },
    { name:"高光舒适方案", benefit:"降低刺眼高光，保留 HDR 层次", adjustments:["峰值亮度：低","HDR动态色调映射：细节优先","色温：防蓝光护眼","动态对比度：低"] },
    { name:"自然肤色方案", benefit:"减少偏黄，让人物肤色更中性", adjustments:["色温：标准","饱和度 -4","红色增益 -2","色彩空间：自动"] },
    { name:"体育运动清晰方案", benefit:"减少球体和镜头横移时的拖影", adjustments:["运动补偿：强","LED运动清晰：高","运动清晰 +3","运动平滑 +2"] },
  ];

  const handleChip = (i: number) => {
    setActiveChip(i);
    setResponded(false);
    setTimeout(() => setResponded(true), 1200);
  };

  const toggleListen = () => {
    setListening((l) => !l);
    if (!listening) {
      setTimeout(() => {
        setListening(false);
        setActiveChip(0);
        setTimeout(() => setResponded(true), 1000);
      }, 3000);
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative"
      style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#080808" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: listening
            ? "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,59,48,0.08) 0%, transparent 70%)"
            : "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(94,92,230,0.06) 0%, transparent 70%)",
          transition: "background 0.6s",
        }}
      />

      {/* Back */}
      <button
        onClick={onBack}
        className="absolute top-10 left-12 flex items-center gap-2 text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">返回</span>
      </button>

      {/* TCL badge */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#FF3B30" }}>
          <Zap size={14} fill="white" stroke="white" />
        </div>
        <span className="text-white/60 text-sm font-semibold">AI 画质优化器</span>
      </div>

      <div className="flex flex-col items-center gap-10 max-w-2xl w-full px-16">
        {/* Siri orb */}
        <div className="relative flex items-center justify-center">
          <AnimatePresence>
            {listening && (
              <>
                {[1, 2, 3].map((ring) => (
                  <motion.div
                    key={ring}
                    className="absolute rounded-full"
                    initial={{ scale: 1, opacity: 0.4 }}
                    animate={{ scale: 1 + ring * 0.35, opacity: 0 }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: ring * 0.4, ease: "easeOut" }}
                    style={{
                      width: 96,
                      height: 96,
                      background: "rgba(255,59,48,0.3)",
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            animate={listening ? { scale: [1, 1.06, 1] } : { scale: 1 }}
            transition={listening ? { repeat: Infinity, duration: 1.2 } : {}}
            onClick={toggleListen}
            className="relative w-24 h-24 rounded-full flex items-center justify-center z-10"
            style={{
              background: listening
                ? "linear-gradient(135deg, #FF3B30, #c0201a)"
                : "rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
              border: listening ? "none" : "1.5px solid rgba(255,255,255,0.2)",
              boxShadow: listening ? "0 0 48px rgba(255,59,48,0.5)" : "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            {listening ? (
              <MicOff size={30} className="text-white" />
            ) : (
              <Mic size={30} className="text-white/80" />
            )}
          </motion.button>
        </div>

        {/* Prompt */}
        <div className="text-center">
          <h2
            className="text-white font-bold mb-2"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", letterSpacing: "-0.02em" }}
          >
            {listening ? "正在聆听…" : "画面哪里不对？"}
          </h2>
          <p className="text-white/40 text-base font-medium">
            {listening
              ? "请描述您在屏幕上看到的问题"
              : "点击麦克风或选择下方常见问题"}
          </p>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap justify-center gap-3">
          {chips.map((chip, i) => (
            <motion.button
              key={chip.label}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              animate={{ scale: activeChip === i ? 1.06 : 1 }}
              onClick={() => handleChip(i)}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-sm"
              style={{
                background:
                  activeChip === i
                    ? chip.color
                    : "rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
                border:
                  activeChip === i
                    ? "none"
                    : "1px solid rgba(255,255,255,0.13)",
                color: "white",
                boxShadow: activeChip === i ? `0 4px 20px ${chip.color}66` : "none",
                transition: "background 0.25s, box-shadow 0.25s",
              }}
            >
              <chip.icon size={16} />
              {chip.label}
            </motion.button>
          ))}
        </div>

        {/* AI Response */}
        <AnimatePresence>
          {responded && activeChip !== null && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.4 }}
              className="w-full rounded-3xl p-6"
              style={{
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "#FF3B30" }}
                >
                  <Sparkles size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4"><div><p className="text-white font-semibold mb-1 text-base">已生成方案：{intentMappings[activeChip!].name}</p><p className="text-white/45 text-xs leading-relaxed">画质收益：{intentMappings[activeChip!].benefit}</p></div><span className="shrink-0 rounded-full bg-emerald-400/10 px-3 py-1.5 text-[9px] font-bold text-emerald-300">已自动适配</span></div>
                  <div className="mt-4 grid grid-cols-4 gap-2">{intentMappings[activeChip!].adjustments.map((item) => <span key={item} className="rounded-xl border border-white/[.07] bg-black/15 px-3 py-2 text-center text-[10px] text-white/55">{item}</span>)}</div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => onPreview(DIRECTOR_MODES[Math.min(activeChip!, DIRECTOR_MODES.length - 1)])}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
                      style={{ background: "#FF3B30" }}
                    >
                      <Play size={14} />
                      预览并确认
                    </button>
                    <button
                      onClick={() => onPreview(DIRECTOR_MODES[0])}
                      className="px-4 py-2 rounded-xl text-white/60 text-sm font-medium"
                      style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                    >
                      查看方案详情
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── PREVIEW PAGE ─────────────────────────────────────────────────────────────
function PreviewPage({ onBack, mode, savedRecipeTitle, onDelete }: { onBack: () => void; mode: PictureMode; savedRecipeTitle?: string | null; onDelete?: () => void }) {
  const [confirmed, setConfirmed] = useState(false);
  const [focusedAction, setFocusedAction] = useState(2);
  const [shareCode, setShareCode] = useState<{ title: string; code: string } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [applyConfirmOpen, setApplyConfirmOpen] = useState(false);
  const canDelete = Boolean(savedRecipeTitle && onDelete);
  const applyAction = canDelete ? 3 : 2;
  const deleteAction = 2;

  const requestApply = useCallback(() => {
    if (confirmed) return;
    setApplyConfirmOpen(true);
  }, [confirmed]);
  const confirmApply = useCallback(() => {
    setApplyConfirmOpen(false);
    setConfirmed(true);
  }, []);
  const shareRecipe = useCallback(() => setShareCode({ title: mode.title, code: makeRecipeCode(mode.title) }), [mode.title]);

  useEffect(() => {
    setFocusedAction(canDelete ? 3 : 2);
  }, [canDelete]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (shareCode || deleteOpen || applyConfirmOpen) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); setFocusedAction((index) => Math.max(index - 1, 0)); }
      if (e.key === "ArrowRight") { e.preventDefault(); setFocusedAction((index) => Math.min(index + 1, canDelete ? 3 : 2)); }
      if (e.key === "Enter") {
        e.preventDefault();
        if (focusedAction === 0) onBack();
        if (focusedAction === 1) shareRecipe();
        if (focusedAction === applyAction) requestApply();
        if (focusedAction === deleteAction && canDelete) setDeleteOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [applyAction, applyConfirmOpen, canDelete, deleteOpen, focusedAction, onBack, requestApply, shareCode, shareRecipe]);

  return (
    <div className="flex h-full w-full flex-col bg-[#07090c]" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <header className="flex h-[86px] shrink-0 items-center justify-between px-12">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white"><ArrowLeft size={18} />返回</button>
        <div className="text-center"><p className="text-sm font-bold text-white">预览方案</p><p className="mt-1 text-[10px] tracking-[.14em] text-white/30">{confirmed ? "SAVED · APPLIED" : "PREVIEW · NOT APPLIED"}</p></div>
        <span className={`rounded-full px-4 py-2 text-xs font-semibold ${confirmed ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/10 text-amber-300"}`}>{confirmed ? "已保存并应用" : "仅预览，尚未应用"}</span>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[520px_minmax(0,1fr)] gap-6 px-12 pb-9">
        <section className="flex min-h-0 flex-col gap-5">
          <div className="rounded-[32px] border border-white/10 bg-[#10141a] p-7 shadow-[0_30px_90px_rgba(0,0,0,.42)]">
            <p className="text-[11px] font-black tracking-[.18em] text-[#f0525d]">PICTURE RECIPE</p>
            <h1 className="mt-3 text-5xl font-black leading-tight text-white">{mode.title}</h1>
            <p className="mt-6 text-2xl font-semibold leading-snug text-white/78">{mode.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {[mode.metadata.signal, mode.values.pictureMode, mode.metadata.scene].map((item) => <Tag key={item} label={item} />)}
            </div>
          </div>

          <div className="relative h-[320px] shrink-0 overflow-hidden rounded-[32px] border border-white/10 bg-black">
            <video className="h-full w-full object-cover" autoPlay muted loop playsInline poster={mode.image} aria-label={`${mode.title} 视频预览`}><source src={DEMO_VIDEO} type="video/mp4" /></video>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,.78))]" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-white/55"><motion.i animate={{ opacity: [1,.3,1] }} transition={{ repeat: Infinity, duration: 1.4 }} className={`h-2 w-2 rounded-full ${confirmed ? "bg-emerald-400" : "bg-[#ff3b48]"}`} />实时视频预览</p>
                <h2 className="text-2xl font-black text-white">{mode.title}</h2>
              </div>
              <span className="rounded-xl border border-white/15 bg-black/45 px-4 py-3 text-xs font-bold text-white backdrop-blur-xl">HDR10 · MiniLED</span>
            </div>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#10141a] p-7 shadow-[0_30px_90px_rgba(0,0,0,.42)]">
          <RecipeDetailsPanel mode={mode} confirmed={confirmed} />

          <div className="mt-5 shrink-0 border-t border-white/[.07] pt-5">
            <p className={`mb-4 text-center text-xs leading-relaxed ${confirmed ? "text-emerald-300/65" : "text-white/32"}`}>
              {confirmed ? "已应用：当前电视已切换到此方案。" : "选择“应用方案”后才会写入当前电视。返回不会改变现有画质。"}
            </p>
            <div className={`grid gap-4 ${canDelete ? "grid-cols-[.68fr_.82fr_.9fr_1.18fr]" : "grid-cols-[.72fr_.86fr_1.22fr]"}`}>
              <motion.button animate={{ scale: focusedAction === 0 ? 1.035 : 1 }} onFocus={() => setFocusedAction(0)} onMouseEnter={() => setFocusedAction(0)} onClick={onBack} className="flex h-16 items-center justify-center rounded-[22px] border text-lg font-black" style={{ borderColor: focusedAction === 0 ? "white" : "rgba(255,255,255,.12)", background: "rgba(255,255,255,.05)", color: "white" }}>{confirmed ? "完成" : "取消"}</motion.button>
              <motion.button animate={{ scale: focusedAction === 1 ? 1.035 : 1 }} onFocus={() => setFocusedAction(1)} onMouseEnter={() => setFocusedAction(1)} onClick={shareRecipe} className="flex h-16 items-center justify-center gap-3 rounded-[22px] border text-lg font-black text-white" style={{ borderColor: focusedAction === 1 ? "white" : "rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", boxShadow: focusedAction === 1 ? "0 0 0 4px rgba(255,255,255,.12),0 16px 36px rgba(0,0,0,.28)" : "none" }}><Share2 size={22} />分享方案</motion.button>
              {canDelete && (
                <motion.button animate={{ scale: focusedAction === deleteAction ? 1.035 : 1 }} onFocus={() => setFocusedAction(deleteAction)} onMouseEnter={() => setFocusedAction(deleteAction)} onClick={() => setDeleteOpen(true)} className="flex h-16 items-center justify-center gap-3 rounded-[22px] border text-lg font-black" style={{ borderColor: focusedAction === deleteAction ? "#ff727a" : "rgba(255,59,72,.22)", background: "rgba(255,59,72,.08)", color: "#ff727a", boxShadow: focusedAction === deleteAction ? "0 0 0 4px rgba(255,59,72,.14),0 16px 36px rgba(255,59,72,.18)" : "none" }}><Trash2 size={22} />删除方案</motion.button>
              )}
              <motion.button animate={{ scale: focusedAction === applyAction ? 1.035 : 1 }} onFocus={() => setFocusedAction(applyAction)} onMouseEnter={() => setFocusedAction(applyAction)} onClick={requestApply} className="flex h-16 items-center justify-center gap-3 rounded-[22px] border text-lg font-black text-white" style={{ borderColor: focusedAction === applyAction ? "white" : "transparent", background: confirmed ? "linear-gradient(135deg,#2dbb78,#168954)" : "linear-gradient(135deg,#f23844,#c61927)", boxShadow: focusedAction === applyAction ? "0 0 0 4px rgba(255,255,255,.14),0 16px 36px rgba(238,46,59,.3)" : "none" }}>{confirmed ? <Check size={22} /> : <Save size={22} />}{confirmed ? "已应用" : "应用方案"}</motion.button>
            </div>
          </div>
        </aside>
      </div>
      <AnimatePresence><ShareCodeModal open={!!shareCode} title={shareCode?.title ?? ""} code={shareCode?.code ?? ""} onClose={() => setShareCode(null)} /></AnimatePresence>
      <AnimatePresence><DeleteRecipeModal open={deleteOpen} title={savedRecipeTitle ?? mode.title} onCancel={() => setDeleteOpen(false)} onConfirm={() => { setDeleteOpen(false); onDelete?.(); }} /></AnimatePresence>
      <AnimatePresence><ApplyRecipeConfirmModal open={applyConfirmOpen} mode={mode} onCancel={() => setApplyConfirmOpen(false)} onConfirm={confirmApply} /></AnimatePresence>
    </div>
  );
}

// ─── RECOMMENDED PAGE ─────────────────────────────────────────────────────────
function RecommendedPage({ onBack, onPreview }: { onBack: () => void; onPreview: (mode: PictureMode) => void }) {
  const [focused, setFocused] = useState(0);
  const recipeSections = [
    {
      id: "sdr",
      title: "SDR",
      subtitle: "适合普通电视、直播和流媒体内容",
      items: DIRECTOR_MODES.filter((mode) => mode.metadata.signal.toLowerCase().includes("sdr")),
    },
    {
      id: "hdr",
      title: "HDR",
      subtitle: "适合高动态范围电影、游戏和体育内容",
      items: DIRECTOR_MODES.filter((mode) => {
        const signal = mode.metadata.signal.toLowerCase();
        const scene = mode.metadata.scene.toLowerCase();
        return !signal.includes("dolby") && (signal.includes("hdr") || scene.includes("hdr") || signal.includes("game"));
      }),
    },
    {
      id: "dolby",
      title: "Dolby Vision",
      subtitle: "适合杜比视界片源与影院图效",
      items: DIRECTOR_MODES.filter((mode) => mode.metadata.signal.toLowerCase().includes("dolby")),
    },
  ];
  const visibleModes = recipeSections.flatMap((section) => section.items);
  const modeIndexMap = new Map(visibleModes.map((mode, index) => [mode.id, index]));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!visibleModes.length) return;
      if (e.key === "ArrowRight") { e.preventDefault(); setFocused((f) => Math.min(f + 1, visibleModes.length - 1)); }
      if (e.key === "ArrowLeft") setFocused((f) => Math.max(f - 1, 0));
      if (e.key === "ArrowDown") { e.preventDefault(); setFocused((f) => Math.min(f + 3, visibleModes.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setFocused((f) => Math.max(f - 3, 0)); }
      if (e.key === "Enter") onPreview(visibleModes[focused]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [focused, onPreview, visibleModes]);

  useEffect(() => {
    setFocused((index) => Math.min(index, Math.max(visibleModes.length - 1, 0)));
  }, [visibleModes.length]);

  return (
    <div className="flex h-full w-full flex-col bg-[#07090c]" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <header className="flex h-[96px] shrink-0 items-center justify-between px-12"><button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white"><ArrowLeft size={18} />返回</button><div className="text-center"><h1 className="text-xl font-black text-white">导演画质模式</h1><p className="mt-1 text-[10px] tracking-[.16em] text-white/30">CREATOR PICTURE RECIPES</p></div><span className="text-xs text-white/35">方向键选择 · 确认键预览</span></header>

      <main className="min-h-0 flex-1 overflow-y-auto px-12 pb-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-9">
          {recipeSections.map((section) => (
            <section key={section.id}>
              <div className="mb-5 flex items-end gap-4">
                <h2 className="text-[clamp(34px,2.2vw,52px)] font-black tracking-tight text-white/88">{section.title}</h2>
                <p className="pb-2 text-[clamp(18px,1.05vw,24px)] font-semibold text-white/36">{section.subtitle}</p>
              </div>
              <div className="grid grid-cols-3 gap-5">
                {section.items.map((mode) => {
                  const cardIndex = modeIndexMap.get(mode.id) ?? 0;
                  const originalIndex = DIRECTOR_MODES.findIndex((item) => item.id === mode.id);
                  return (
                    <motion.button key={mode.id} onMouseEnter={() => setFocused(cardIndex)} onFocus={() => setFocused(cardIndex)} onClick={() => onPreview(mode)} animate={{ scale: focused === cardIndex ? 1.022 : 1 }} className="group relative flex h-[clamp(300px,27vh,360px)] flex-col overflow-hidden rounded-3xl border bg-[#12161c] text-left" style={{ borderColor: focused === cardIndex ? "rgba(255,255,255,.9)" : "rgba(255,255,255,.09)", boxShadow: focused === cardIndex ? "0 0 0 4px rgba(255,255,255,.13),0 24px 58px rgba(0,0,0,.52)" : "0 14px 35px rgba(0,0,0,.25)" }}>
                      <div className="relative h-[68%] min-h-0 overflow-hidden">
                        <img src={mode.image} alt={`${mode.title} 视频画面`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" style={{ filter: "brightness(.62)" }} />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.05)_0%,rgba(0,0,0,.24)_48%,#12161c_100%)]" />
                        <span className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[10px] font-bold text-white/70 backdrop-blur-xl">方案 0{originalIndex + 1}</span>
                        <span className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-xl"><Play size={16} fill="white" /></span>
                        <div className="absolute bottom-5 left-5 right-5 min-w-0">
                          <h2 className="mt-1 truncate text-3xl font-black text-white">{mode.title}</h2>
                          <p className="mt-2 line-clamp-1 text-base font-semibold text-white/58">{mode.description}</p>
                        </div>
                      </div>

                      <div className="flex min-h-0 flex-1 items-center justify-between gap-4 px-5 py-4">
                        <div className="flex min-w-0 flex-wrap gap-2">{[mode.metadata.signal, mode.values.pictureMode, mode.metadata.scene].map((item) => <Tag key={item} label={item} />)}</div>
                        <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-white/70">预览方案 <ChevronRight size={16} /></span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

// ─── MY RECIPES PAGE ──────────────────────────────────────────────────────────
type SavedRecipe = {
  title: string;
  desc: string;
  saved: string;
  fav: boolean;
  img: string;
  uses: number;
  mode: PictureMode;
};

const initialMyRecipes: SavedRecipe[] = [
  { title: "我的夜间模式", desc: "为客厅晚 9 点环境二次适配，暗场更稳，高光更柔。", saved: "2 天前", fav: true, img: MOVIE_IMAGES[0], uses: 47, mode: DIRECTOR_MODES[0] },
  { title: "周末体育场", desc: "高速运动清晰度优先，适配 4K 120Hz 信号", saved: "1 周前", fav: true, img: MOVIE_IMAGES[1], uses: 23, mode: DIRECTOR_MODES[1] },
  { title: "周六动漫夜", desc: "强化线条和高饱和色块，保留夜间舒适亮度", saved: "2 周前", fav: false, img: MOVIE_IMAGES[2], uses: 11, mode: DIRECTOR_MODES[2] },
  { title: "家庭电影夜", desc: "适合全家观看的均衡影院方案", saved: "3 周前", fav: false, img: MOVIE_IMAGES[3], uses: 38, mode: DIRECTOR_MODES[0] },
];

function MyRecipesPage({ recipes, onBack, onPreview }: { recipes: SavedRecipe[]; onBack: () => void; onPreview: (recipe: SavedRecipe) => void }) {
  const [focused, setFocused] = useState(0);
  const columns = 4;
  const recipeSections = [
    {
      id: "sdr",
      title: "SDR",
      subtitle: "适合普通电视、直播和流媒体内容",
      items: recipes.filter((recipe) => recipe.mode.metadata.signal.toLowerCase().includes("sdr")),
    },
    {
      id: "hdr",
      title: "HDR",
      subtitle: "适合高动态范围电影、游戏和体育内容",
      items: recipes.filter((recipe) => {
        const signal = recipe.mode.metadata.signal.toLowerCase();
        const scene = recipe.mode.metadata.scene.toLowerCase();
        return !signal.includes("dolby") && (signal.includes("hdr") || scene.includes("hdr") || signal.includes("game"));
      }),
    },
    {
      id: "dolby",
      title: "Dolby Vision",
      subtitle: "适合杜比视界片源与影院图效",
      items: recipes.filter((recipe) => recipe.mode.metadata.signal.toLowerCase().includes("dolby")),
    },
  ];
  const visibleRecipes = recipeSections.flatMap((section) => section.items);
  const recipeIndexMap = new Map(visibleRecipes.map((recipe, index) => [recipe.title, index]));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!visibleRecipes.length) return;
      if (e.key === "ArrowRight") { e.preventDefault(); setFocused((f) => Math.min(f + 1, visibleRecipes.length - 1)); }
      if (e.key === "ArrowLeft") { e.preventDefault(); setFocused((f) => Math.max(f - 1, 0)); }
      if (e.key === "ArrowDown") { e.preventDefault(); setFocused((f) => Math.min(f + columns, visibleRecipes.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setFocused((f) => Math.max(f - columns, 0)); }
      if (e.key === "Enter") onPreview(visibleRecipes[focused]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [focused, onPreview, visibleRecipes]);

  useEffect(() => {
    setFocused((index) => Math.min(index, Math.max(visibleRecipes.length - 1, 0)));
  }, [visibleRecipes.length]);

  return (
    <div className="flex h-full w-full flex-col bg-[radial-gradient(circle_at_18%_8%,rgba(70,96,150,.18),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(255,59,72,.08),transparent_30%),#07090c]" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <header className="flex h-[96px] shrink-0 items-center justify-between px-12"><button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white"><ArrowLeft size={18} />返回</button><div className="text-center"><h1 className="text-xl font-black text-white">我的画质方案</h1><p className="mt-1 text-[10px] tracking-[.16em] text-white/30">SAVED PICTURE ASSETS</p></div><div className="flex items-center gap-2 text-xs text-white/35"><BookOpen size={14} />已保存 {recipes.length} 个</div></header>

      <main className="min-h-0 flex-1 overflow-y-auto px-12 pb-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {recipes.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-[34px] border border-white/10 bg-white/[.035]">
            <div className="text-center">
              <BookOpen size={56} className="mx-auto text-white/22" />
              <h2 className="mt-5 text-4xl font-black text-white">暂无我的方案</h2>
              <p className="mt-3 text-2xl font-semibold text-white/42">保存或导入后，会出现在这里。</p>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {recipeSections.map((section) => (
              <section key={section.id}>
                <div className="mb-5 flex items-end gap-4">
                  <h2 className="text-[clamp(34px,2.2vw,52px)] font-black tracking-tight text-white/88">{section.title}</h2>
                  <p className="pb-2 text-[clamp(18px,1.05vw,24px)] font-semibold text-white/36">{section.subtitle}</p>
                </div>
                {section.items.length ? (
                  <div className="grid grid-cols-4 gap-8">
                    {section.items.map((recipe) => {
                      const cardIndex = recipeIndexMap.get(recipe.title) ?? 0;
                      return (
                        <motion.button
                          key={`${section.id}-${recipe.title}`}
                          onMouseEnter={() => setFocused(cardIndex)}
                          onFocus={() => setFocused(cardIndex)}
                          onClick={() => onPreview(recipe)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") onPreview(recipe);
                          }}
                          animate={{ scale: focused === cardIndex ? 1.055 : 1, y: focused === cardIndex ? -5 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="group min-w-0 cursor-pointer text-left outline-none"
                        >
                          <div
                            className="relative aspect-[16/9] overflow-hidden rounded-[24px] border bg-[#12161c]"
                            style={{ borderColor: focused === cardIndex ? "rgba(255,255,255,.92)" : "rgba(255,255,255,.08)", boxShadow: focused === cardIndex ? "0 0 0 4px rgba(255,255,255,.13),0 26px 62px rgba(0,0,0,.55)" : "0 14px 34px rgba(0,0,0,.28)" }}
                          >
                            <img src={recipe.img} alt={recipe.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" style={{ filter: "brightness(.76) saturate(.96)" }} />
                            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.04)_0%,rgba(0,0,0,.16)_45%,rgba(0,0,0,.64)_100%)]" />
                            <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-black/34 text-white backdrop-blur-xl"><Play size={14} fill="white" /></span>
                            <div className="absolute bottom-3 left-3 flex max-w-[calc(100%-24px)] flex-wrap gap-2">
                              <TVTag>{recipe.mode.metadata.signal}</TVTag>
                              <TVTag>{recipe.mode.values.pictureMode}</TVTag>
                              <TVTag>{recipe.mode.metadata.scene}</TVTag>
                            </div>
                          </div>
                          <h3 className="mt-4 line-clamp-1 text-[clamp(26px,1.55vw,38px)] font-black leading-tight text-white/88">{recipe.title}</h3>
                          <p className="mt-2 line-clamp-1 text-[clamp(17px,.98vw,23px)] font-semibold text-white/45">{recipe.desc}</p>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex aspect-[16/2.25] items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/[.025] text-[clamp(18px,1vw,24px)] font-semibold text-white/24">
                    暂无 {section.title} 方案
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── SHARE PAGE ───────────────────────────────────────────────────────────────
const RECIPE_CODE = "TCL-NCE-4K-220-A7F9";

function SharePage({ onBack }: { onBack: () => void }) {
  const [importCode, setImportCode] = useState("");
  const [imported, setImported] = useState(false);
  const [compatOpen, setCompatOpen] = useState(false);

  const handleImport = () => {
    if (importCode.trim()) {
      setCompatOpen(true);
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#080808" }}
    >
      <div className="flex items-center justify-between px-12 pt-10 pb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">返回</span>
        </button>
        <h1 className="text-white font-bold text-xl">导入方案</h1>
        <div className="w-20" />
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 px-12 pb-10">
        {/* Share code */}
        <GlassCard className="flex flex-col">
          <div className="p-8 flex flex-col items-center gap-6 h-full">
            <div className="flex items-center gap-2 self-start">
              <Share2 size={16} className="text-white/50" />
              <span className="text-white/50 text-sm font-semibold uppercase tracking-widest">分享方案</span>
            </div>

            <div className="w-full">
              <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-2">方案代码</p>
              <div
                className="px-7 py-8 rounded-3xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <span className="block whitespace-nowrap text-white font-mono font-black text-5xl tracking-widest">{RECIPE_CODE}</span>
              </div>
            </div>

            <div className="w-full mt-auto">
              <p className="text-white/40 text-lg text-center font-semibold">输入分享码即可导入。</p>
            </div>
          </div>
        </GlassCard>

        {/* Import panel */}
        <div className="flex flex-col gap-5">
          <GlassCard className="flex-1">
            <div className="p-8 h-full flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <Upload size={16} className="text-white/50" />
                <span className="text-white/50 text-sm font-semibold uppercase tracking-widest">导入方案</span>
              </div>

              <div>
                <p className="text-white/40 text-sm mb-3">输入其他用户分享的方案代码</p>
                <div
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.15)" }}
                >
                  <input
                    data-testid="import-code-input"
                    type="text"
                    placeholder="TCL-XXX-0000-0000"
                    value={importCode}
                    onChange={(e) => setImportCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-transparent text-white font-mono font-bold text-base tracking-widest outline-none placeholder:text-white/20"
                    maxLength={20}
                  />
                </div>
              </div>

              <motion.button
                data-testid="import-recipe-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleImport}
                className="flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white font-bold"
                style={{
                  background: imported
                    ? "linear-gradient(135deg, #34C759, #28a347)"
                    : importCode.trim()
                    ? "linear-gradient(135deg, #FF3B30, #c0201a)"
                    : "rgba(255,255,255,0.06)",
                  color: importCode.trim() ? "white" : "rgba(255,255,255,0.25)",
                  cursor: importCode.trim() ? "pointer" : "default",
                  transition: "background 0.3s",
                }}
              >
                {imported ? <Check size={18} /> : <Download size={18} />}
                {imported ? "导入成功！" : "导入方案"}
              </motion.button>

              <AnimatePresence>
                {imported && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{ background: "rgba(52,199,89,0.1)", border: "1px solid rgba(52,199,89,0.3)" }}
                  >
                    <Check size={16} className="text-green-400" />
                    <span className="text-green-400 text-sm font-semibold">
                      方案已添加至「我的方案」
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-auto pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-white/30 text-xs font-medium mb-3">最近导入</p>
                {[
                  { code: "TCL-SPT-HD-120-B2C8", label: "体育超高清" },
                  { code: "TCL-ANM-VB-4K-D4E1", label: "动漫鲜彩" },
                ].map((r) => (
                  <div key={r.code} className="flex items-center justify-between py-2">
                    <span className="text-white/60 text-sm font-medium">{r.label}</span>
                    <span className="text-white/25 text-xs font-mono">{r.code}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
      <AnimatePresence>
        {compatOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 p-8 backdrop-blur-lg" onClick={() => setCompatOpen(false)}>
          <motion.section initial={{ y: 24, scale: .97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 15, scale: .98 }} onClick={(e) => e.stopPropagation()} className="w-[820px] max-w-[92vw] rounded-3xl border border-white/12 bg-[#11161d] p-7 shadow-[0_35px_100px_rgba(0,0,0,.7)]">
            <div className="flex items-start justify-between"><div className="flex gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300"><ShieldCheck size={24} /></span><div><p className="text-[10px] font-bold tracking-[.16em] text-emerald-300/60">COMPATIBILITY ANALYSIS</p><h2 className="mt-1 text-2xl font-black text-white">方案已自动适配</h2><p className="mt-2 max-w-[610px] text-xs leading-relaxed text-white/40">由于不同机型、SoC、面板能力和当前信号状态不同，系统已自动保留可用参数，并忽略不支持或当前不可调节的参数。</p></div></div><button onClick={() => setCompatOpen(false)} aria-label="关闭兼容分析" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[.04] text-white/45"><X size={17} /></button></div>
            <div className="mt-6 grid grid-cols-3 gap-3">{[["当前设备","TCL C11K MiniLED"],["当前信号","HDR10 · HDMI 1"],["兼容状态","部分应用 · 已自动适配"]].map(([label,value]) => <div key={label} className="rounded-2xl border border-white/[.07] bg-white/[.035] p-4"><span className="text-[9px] text-white/25">{label}</span><b className="mt-2 block text-xs text-white/70">{value}</b></div>)}</div>
            <div className="mt-4 grid grid-cols-2 gap-4"><div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[.045] p-4"><h3 className="flex items-center gap-2 text-xs font-bold text-white"><Check size={14} className="text-emerald-300" />已应用参数 · 12 项</h3><div className="mt-3 flex flex-wrap gap-2">{["图效模式","亮度","对比度","黑电平","饱和度","色温","峰值亮度","区域背光","HDR动态色调映射","色彩增强","超清分辨率","低蓝光模式"].map((item) => <span key={item} className="rounded-lg bg-black/20 px-2.5 py-1.5 text-[9px] text-white/50">{item}</span>)}</div></div><div className="rounded-2xl border border-amber-400/15 bg-amber-400/[.045] p-4"><h3 className="flex items-center gap-2 text-xs font-bold text-white"><AlertTriangle size={14} className="text-amber-300" />已忽略参数 · 3 项</h3><div className="mt-3 space-y-2">{[["运动补偿","VRR 生效"],["LED运动清晰","当前信号不支持"],["120/240Hz动态加速","高刷信号限制"]].map(([item,reason]) => <div key={item} className="flex justify-between gap-3 text-[9px]"><span className="text-white/50">{item}</span><span className="text-amber-200/50">{reason}</span></div>)}</div></div></div>
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/[.07] bg-white/[.03] p-4"><div className="flex items-center gap-3"><BookOpen size={18} className="text-[#ff5964]" /><div><p className="text-xs font-bold text-white">可以保存为“我的方案”</p><p className="mt-1 text-[9px] text-white/28">保存的是适配后的画质意图和当前设备可用参数。</p></div></div><div className="flex gap-3"><button onClick={() => setCompatOpen(false)} className="h-11 rounded-xl border border-white/10 px-5 text-xs font-bold text-white/55">取消</button><button data-testid="compat-save-button" onClick={() => { setImported(true); setCompatOpen(false); }} className="flex h-11 items-center gap-2 rounded-xl bg-gradient-to-br from-[#f23844] to-[#c61927] px-5 text-xs font-bold text-white"><Save size={14} />保存到我的方案</button></div></div>
          </motion.section>
        </motion.div>}
      </AnimatePresence>
    </div>
  );
}

// ─── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [selectedMode, setSelectedMode] = useState<PictureMode>(DIRECTOR_MODES[0]);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>(initialMyRecipes);
  const [selectedSavedRecipeTitle, setSelectedSavedRecipeTitle] = useState<string | null>(null);

  const navigate = useCallback((p: Page) => setPage(p), []);
  const back = useCallback(() => setPage("home"), []);
  const openPreview = useCallback((mode: PictureMode) => {
    setSelectedMode(mode);
    setSelectedSavedRecipeTitle(null);
    setPage("preview");
  }, []);
  const openSavedRecipePreview = useCallback((recipe: SavedRecipe) => {
    setSelectedMode(recipe.mode);
    setSelectedSavedRecipeTitle(recipe.title);
    setPage("preview");
  }, []);
  const deleteSavedRecipe = useCallback((title: string) => {
    setSavedRecipes((items) => items.filter((item) => item.title !== title));
  }, []);
  const deleteCurrentSavedRecipe = useCallback(() => {
    if (!selectedSavedRecipeTitle) return;
    deleteSavedRecipe(selectedSavedRecipeTitle);
    setSelectedSavedRecipeTitle(null);
    setPage("myrecipes");
  }, [deleteSavedRecipe, selectedSavedRecipeTitle]);
  const saveCurrentRecipe = useCallback((name: string) => {
    const trimmed = name.trim() || "我的夜间影院";
    const savedMode: PictureMode = {
      ...DIRECTOR_MODES[0],
      id: `saved-${Date.now()}`,
      title: trimmed,
      description: "当前屏幕画质会随信号独立保存",
      metadata: {
        ...DIRECTOR_MODES[0].metadata,
        type: "User Created",
        compatibility: "Fully Applied",
      },
    };
    const nextRecipe: SavedRecipe = {
      title: trimmed,
      desc: "当前屏幕画质会随信号独立保存",
      saved: "刚刚",
      fav: false,
      img: HERO_IMAGE,
      uses: 0,
      mode: savedMode,
    };
    setSavedRecipes((items) => [nextRecipe, ...items.filter((item) => item.title !== trimmed)]);
  }, []);

  return (
    <div
      className="tv-ui-canvas relative w-full h-screen overflow-hidden"
      style={{
        background: "#080808",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-50 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "120px 120px",
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          className="w-full h-full"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {page === "home" && <HomePage onNavigate={navigate} onPreview={openPreview} onSaveCurrentRecipe={saveCurrentRecipe} />}
          {page === "ai" && <AIPage onBack={back} onPreview={openPreview} />}
          {page === "preview" && <PreviewPage onBack={back} mode={selectedMode} savedRecipeTitle={selectedSavedRecipeTitle} onDelete={selectedSavedRecipeTitle ? deleteCurrentSavedRecipe : undefined} />}
          {page === "recommended" && <RecommendedPage onBack={back} onPreview={openPreview} />}
          {page === "myrecipes" && <MyRecipesPage recipes={savedRecipes} onBack={back} onPreview={openSavedRecipePreview} />}
          {page === "share" && <SharePage onBack={back} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
