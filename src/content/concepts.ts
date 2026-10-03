/**
 * 首页各叙事段落的文案。具体优先：写「1971 年，红岸向太阳发射了一段信息」，
 * 不写「一次改变人类命运的呼唤」。
 */

import { CHRONOLOGY } from './chronology'

/**
 * 纪年文字与公元年份一律从年表取，不在这里另写一份：
 * 年表的换算基准（危机纪元元年 = 公元 2007）一改，这里的数字跟着变。
 * 公元年份都是推算值，所以一律带 ≈，依据见 chronology.ts 的 CHRONOLOGY_NOTE。
 */
function findEra(stamp: string) {
  return CHRONOLOGY.find((e) => e.stamp === stamp)
}

/**
 * «危机纪元 205 · ≈2211»：纪年锚点 + 推算的公元年。
 * 纪年本身就是「这是书里的时间」最强的标记——比任何前缀都直接，
 * 而且和年表的主列口径完全一致。
 */
function era(stamp: string): string {
  const hit = findEra(stamp)
  if (!hit || hit.gregorian == null) return ''
  return `${hit.stamp} · ≈${hit.gregorian}`
}

/**
 * «危机纪元 3—208 · ≈2009—2214»：同一纪元内的一段。
 * 原著没给单独一年的章节给区间，不硬挑一个点充数。
 */
function eraSpan(eraName: string, from: number, to: number): string {
  const a = findEra(`${eraName} ${from}`)
  const b = findEra(`${eraName} ${to}`)
  if (!a || !b || a.gregorian == null || b.gregorian == null) return ''
  return `${eraName} ${from}—${to} · ≈${a.gregorian}—${b.gregorian}`
}

/**
 * 黑暗森林：从面壁计划启动到威慑建立，罗辑这条线的两端。
 * 法则是在这个区间里被想明白的，原著没给单独一年。
 */
const forestEra = eraSpan('危机纪元', 3, 208)
/** 水滴：末日之战 */
const dropletEra = era('危机纪元 205')
/** 二向箔：太阳系二维化 */
const dimensionEra = era('掩体纪元 67')
/** 年表那一节的跨度终点：整张时间轴的最后一年 */
const lastEraYear = findEra('掩体纪元 67')?.gregorian

/**
 * 各章的读数行：序号 · 这一章的一个量 · 它发生的年份。
 *
 * 序号是它在首页长滚动里的位置（开场不算段落，所以是 9 段）。
 *
 * 时间有两套，必须一眼能分开：
 *   原著时间 —— 带纪年锚点（危机纪元 205），公元年一律带 ≈（是推算的）。
 *               这是默认的一套，不额外标注。
 *   现实时间 —— 只有《我的三体》一节是，显式写「现实」。
 * 不用颜色区分这两套：--data 的意思是「这是真数据」，而两套时间都是真数据。
 *
 * 数字全部来自站内已有的内容或可查证的量，没有一个是为排版编出来的：
 *   4.22 ly —— scales.ts 的比邻星锚点
 *   3.5 m   —— DROPLET.paragraphs「三米半长」
 *   1 m → 9.3e10 ly —— scales.ts 的尺子定义域两端
 *   423 条 —— sentences.json 的 stats.total
 *   2014 — 2024 —— works.ts 四季的首尾
 *   5 kg  —— ENDING.paragraphs「只留下五公斤」
 * 水滴与二向箔同属第 4 段，所以两条都写 04。
 *
 * 有四章不带年份，因为它们本来就没有：
 * 三体世界讲的是那颗行星自己的两百多次轮回，原著不给公元年；
 * 尺度讲的是空间不是时间；书摘横跨全书；结尾的小宇宙在时间之外。
 */
export const SECTION_READOUT = {
  redCoast: '01 / 09 · 1971',
  trisolaris: '02 / 09 · 4.22 ly',
  darkForest: `03 / 09 · 公理 ×2${forestEra ? ` · ${forestEra}` : ''}`,
  droplet: `04 / 09 · 3.5 m${dropletEra ? ` · ${dropletEra}` : ''}`,
  dimension: `04 / 09 · 3D → 2D${dimensionEra ? ` · ${dimensionEra}` : ''}`,
  chronology: `05 / 09 · 1971 — ${lastEraYear != null ? `≈${lastEraYear}` : '≈2401'}`,
  scale: '06 / 09 · 1 m → 9.3e10 ly',
  sentences: '07 / 09 · 423 条',
  works: '08 / 09 · 现实 · 2014 — 2024',
  ending: '09 / 09 · 5 kg',
} as const

export interface Plate {
  /** public/images 下的文件名（不含扩展名） */
  name: string
  /** 中文 alt，描述画面本身。只给读屏软件用，不作为图注显示。 */
  alt: string
  width: number
  height: number
  /**
   * 取景锚点（CSS object-position 的纵向值）。
   * 章节配图有高度上限，3:2 的素材会被上下裁掉约三成——
   * 居中裁会把画面里真正的主体切走（红岸那道山脊、三体的地表裂纹）。
   * 每张图各自指定该保住哪一段：`bottom` 保下缘，`top` 保上缘，默认居中。
   */
  focus?: 'top' | 'center' | 'bottom' | string
}

export const HERO = {
  title: '三体宇宙',
  /** 17px 灰，一句说清这是什么站 */
  standfirst:
    '一个粉丝做的站。用一次从人体到可观测宇宙的滚动，讲《三体》讲了什么，以及《我的三体》这十年。',
  spoiler: '正文包含全书关键情节。',
  plate: {
    name: 'hero-void',
    alt: '几乎全黑的画面，偏右侧有三颗星：两颗冷白，一颗暗红，左半边是空的。',
    width: 1536,
    height: 1024,
  } satisfies Plate,
  /**
   * 开场是满屏图，窄屏时 cover 从两侧裁：三颗星在图片 x 65%–80% 处，
   * 居中裁只剩 x 35%–65%，星星全被切掉，开场就成了一整块黑。
   * 所以横向取景交给 CSS 按屏宽调（见 SectionHero.vue），
   * 这里只记下星群的位置，改图或换素材时对照着调。
   */
  starsAt: { x: '72%', y: '48%' },
}

export const RED_COAST = {
  year: '1971',
  title: '一个决定',
  /** display 尺寸只给这四个字 */
  reply: '不要回答',
  paragraphs: [
    '红岸基地建在大兴安岭的山里，天线对着太阳。1971 年，叶文洁把一段信息发了出去——太阳的能量把它放大，送进了深空。',
    '八年后，回信来了。发信的是四光年外一个三体世界的监听员，他违背纪律，用三句话回答了这段广播：不要回答，不要回答，不要回答。',
    '叶文洁再一次按下了发射键。这一次她回答了。',
  ],
  plate: {
    name: 'red-coast',
    alt: '山脊上一座巨大的射电望远镜剪影，桁架只有一道冷灰色的边光，桅杆顶端亮着一盏红灯，天空全黑。',
    width: 1536,
    height: 1024,
    // 天线和山脊都在下半幅，天空是空的：保下缘，让天线站在地上
    focus: 'bottom',
  } satisfies Plate,
}

export const TRISOLARIS = {
  title: '三颗太阳',
  paragraphs: [
    '三体世界有三颗恒星。三个天体在引力下如何运动，没有通解——初始条件差之毫厘，几百年后的轨道就完全不同，谁也算不了那么远。',
    '于是那颗行星的历史被切成两段轮流出现：恒纪元里三颗太阳暂时稳定，文明生长；乱纪元里它们或者一起升起来把地表烤干，或者全都远离让一切冻住。文明毁灭了两百多次，每次都从头再来。',
    '他们的解法是搬家。舰队朝着四光年外那颗只有一颗太阳的行星出发了。',
  ],
  canvasCaption:
    '三体运动模拟：三个质点从静止释放，实时积分，轨迹是算出来的，不是画好的。' +
    '某个质点迟早会被甩出去——那时换一组初始位置重新开始。',
  plate: {
    name: 'trisolaris',
    alt: '干裂的岩石地表在画面下缘，黑色天空中挂着三颗大小不同的太阳，岩石上投出三重影子。',
    width: 1536,
    height: 1024,
    // 地表在下缘、三颗太阳在其上方：偏下取景，两者都保住
    focus: '72%',
  } satisfies Plate,
}

export const DARK_FOREST = {
  title: '黑暗森林',
  axioms: [
    { n: '一', text: '生存是文明的第一需要。' },
    { n: '二', text: '文明不断增长和扩张，但宇宙中的物质总量保持不变。' },
  ],
  paragraphs: [
    '从这两条公理推下去，还要加上两件事：猜疑链——你无法知道对方是善意还是恶意，对方也无法知道你怎么想，这个链条一环扣一环，永远收不了尾；技术爆炸——弱小的文明可能在很短的时间里超过你。',
    '结论是：宇宙是一座黑暗森林，每个文明都是带枪的猎人。发现别人，就开枪。',
  ],
  plate: {
    name: 'dark-forest',
    alt: '近乎全黑的画面里布满细如针尖的竖直白色光柱，向纵深退去，其中一根比其他都亮一点。',
    width: 1536,
    height: 1024,
    // 光针林集中在中带，居中裁正好
    focus: 'center',
  } satisfies Plate,
}

export const DROPLET = {
  title: '水滴',
  paragraphs: [
    '人类舰队在木星背后集结了两千艘战舰，去迎接三体派来的第一个探测器。它只有三米半长，形状像一滴水，表面是强互作用力材料，光滑到什么都反射不出来。',
    '它加速，然后开始穿。一艘接一艘，从舰体正中穿过去再折返。整场战斗里人类没有击中它一次。',
  ],
  plate: {
    name: 'droplet',
    alt: '纯黑背景上悬着一枚水滴形状的镜面物体，表面只映出两道细直的白色高光。',
    width: 1024,
    height: 1024,
  } satisfies Plate,
}

export const DIMENSION = {
  title: '二向箔',
  paragraphs: [
    '黑暗森林打击不是舰队，是一张卡片大小的东西。它被丢进太阳系，把这一片空间的维度从三维降到二维。',
    '所有东西都落进那个平面：木星、地球、还没来得及跑掉的人。从外面看，是一幅铺开的画。',
  ],
  plate: {
    name: 'two-dimensional',
    alt: '太阳系被压成完全平坦的白色线刻，行星成了扁平的同心圆线条，躺在黑色平面上。',
    width: 1536,
    height: 1024,
    focus: 'center',
  } satisfies Plate,
}

export const SCALE_SECTION = {
  title: '尺度',
  intro:
    '这套书真正难写的地方是尺度：从一个人，到一颗行星，到四光年，到宇宙的边。下面这条尺子是对数的，每一格是十倍。拖动它，或者用方向键。',
  hint: '拖动 · 滚轮 · 方向键',
}

export const SENTENCES_SECTION = {
  title: '书摘',
  intro: '原作者从书里抄下来的句子，一共 423 条。',
  linkText: '读全部 423 条',
}

export const ENDING = {
  /** display 尺寸的收尾，四个字 */
  title: '给岁月以文明',
  paragraphs: [
    '故事最后收在一间小屋里：一个小宇宙，一扇门，一块地，一株刚出土的芽。他们把借来的物质还了回去，只留下五公斤，还有一条鱼缸里的鱼。',
    '大宇宙能不能因此重启，书里没有写。',
  ],
  plate: {
    name: 'mini-universe',
    alt: '虚空中一间密闭小屋的内部：一堵空墙、一扇关着的金属门、一盏昏暗顶灯，地上一小块土里长着一株绿芽。',
    width: 1024,
    height: 1024,
  } satisfies Plate,
}

export const WORKS_SECTION = {
  title: '我的三体',
  intro: '原作者是这个系列的粉丝。十年，四季，从《我的世界》里的方块人开始。',
  plate: {
    name: 'voxel-tribute',
    alt: '由大块方体搭成的飞船走廊向暗处延伸，远端一条冷白色灯带，风格是体素方块。',
    width: 1536,
    height: 1024,
    // 走廊的灭点和地板格栅偏下：保下缘，纵深才在
    focus: '64%',
  } satisfies Plate,
}
