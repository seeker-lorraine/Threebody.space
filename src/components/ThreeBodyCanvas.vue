<script setup lang="ts">
/**
 * 三体运动可视化。原生 Canvas 2D，没有引擎，没有预录路径。
 *
 * 它真的在算：三个质点，牛顿引力，速度 Verlet 积分，
 * 每帧走若干个固定小步长，画 1px 白色轨迹拖尾。
 *
 * 构型是「自由落体三体」：三个质点摆成一个不规则三角形，从静止释放。
 * 这是经典的混沌构型——轨道没有任何周期性，近距交会、甩摆、突然变向，
 * 直到某个质点获得足够动能被甩出系统。这正是书里三体世界的日常：
 * 行星在三颗恒星之间被抛来抛去，没有恒纪元能永远持续。
 *
 * 之前用的是 8 字周期解加扰动，画面太规律，看着像编排好的舞蹈；
 * 现在的取舍反过来：接受「总会有质点逃逸」这个混沌的必然结局，
 * 逃逸后淡出、换一组初值重新开始一局。换局本身就是内容——
 * 每一局的舞步都不一样，这才是「无法长期预测」。
 *
 * 初值从一个筛过的种子池里取（scripts 里的数值试验筛的）：
 * 只留「能撑 40–160 个时间单位才逃逸」的局，太短的开场即散，太长的看不到换局。
 * 种子只决定三角形的形状，物理本身没有任何脚本。
 *
 * prefers-reduced-motion 时不启动循环，只积分若干步画一张静态图。
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { prefersReducedMotion } from '@/composables/useReducedMotion'
import {
  CHAOS_SEEDS,
  DT,
  accelerate,
  escaped,
  pushTrail,
  recenter,
  seedBodies,
  step,
} from '@/lib/threebody'

const props = withDefaults(defineProps<{ size?: number }>(), { size: 480 })

const canvas = ref<HTMLCanvasElement | null>(null)
const holder = ref<HTMLElement | null>(null)
/** 换局时的淡出淡入：只动 opacity，320ms，标准缓动 */
const fading = ref(false)

/**
 * 这里只留呈现参数。积分器、种子池、逃逸判据一律取自 @/lib/threebody，
 * 和 /simulation 满屏页是同一份——两处各写一遍迟早会走偏成两种物理。
 */
const STEPS_PER_FRAME = 12
/** 拖尾点数。页内画布只有 480px，比满屏页的 1400 短 */
const TRAIL_MAX = 620
/**
 * 取景半宽。故意比逃逸半径小：大部分时间三个质点都在 ±1.5 以内缠斗，
 * 按逃逸半径取景的话画面四周常年一圈空黑。取紧一点，
 * 逃逸的质点会先冲出画面边缘、随后整幅淡出换局——「被甩出去」看得见。
 */
const VIEW_R = 1.9

let seedIndex = Math.floor(Math.random() * CHAOS_SEEDS.length)
let bodies = seedBodies(CHAOS_SEEDS[seedIndex]!)
let frame = 0
let running = false
let switching = false
/** 换局那个 setTimeout 的句柄：卸载时必须清掉，否则回调会打到已销毁的实例上 */
let switchTimer = 0
/** 画布是否在视口内。切后台时主动停，回来再照这个状态恢复 */
let inView = false
let observer: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null

/** 换局：画面淡出 → 换一组初值 → 淡入。只动 opacity。 */
function nextRound() {
  if (switching) return
  switching = true
  fading.value = true
  switchTimer = window.setTimeout(() => {
    // 不重复上一局；顺序取也行，随机跳着取更不容易看出池子的存在
    let next = Math.floor(Math.random() * CHAOS_SEEDS.length)
    if (next === seedIndex) next = (next + 1) % CHAOS_SEEDS.length
    seedIndex = next
    bodies = seedBodies(CHAOS_SEEDS[seedIndex]!)
    accelerate(bodies)
    fading.value = false
    switching = false
    switchTimer = 0
  }, 360)
}

function draw(ctx: CanvasRenderingContext2D, w: number, h: number, dpr: number) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  const scale = Math.min(w, h) / (VIEW_R * 2)
  const px = (v: number) => w / 2 + v * scale
  const py = (v: number) => h / 2 + v * scale

  // 轨迹：1px 白线，越旧越淡。分段画，透明度按点的新旧递减。
  ctx.lineWidth = 1
  ctx.lineCap = 'butt'
  for (const b of bodies) {
    const n = b.trail.length / 2
    for (let i = 1; i < n; i++) {
      const age = i / n
      ctx.strokeStyle = `rgba(242, 242, 240, ${(age * age * 0.5).toFixed(3)})`
      ctx.beginPath()
      ctx.moveTo(px(b.trail[(i - 1) * 2]!), py(b.trail[(i - 1) * 2 + 1]!))
      ctx.lineTo(px(b.trail[i * 2]!), py(b.trail[i * 2 + 1]!))
      ctx.stroke()
    }
  }

  /*
    三个质点画成圆。
    --r: 2px 那条直角规范管的是 UI 容器（卡片、输入框、按钮），
    用意是避开 pill 和毛玻璃那一套；这里画的不是 UI，是天体——
    这一节的标题就叫「三颗太阳」，把太阳画成方块反而是没有含义的风格化。
  */
  ctx.fillStyle = '#f2f2f0'
  for (const b of bodies) {
    ctx.beginPath()
    ctx.arc(px(b.x), py(b.y), 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

let ctx: CanvasRenderingContext2D | null = null
let cssW = props.size
let cssH = props.size
let dpr = 1

/** 按当前容器宽度与 DPR 重建画布。返回尺寸是否真的变了 */
function setup() {
  const el = canvas.value
  if (!el) return false
  const nextDpr = Math.min(window.devicePixelRatio || 1, 2)
  // 混沌构型的活动范围是各向同性的（不是 8 字那种扁长条），方形取景
  const nextW = Math.round(Math.min(props.size, el.parentElement?.clientWidth || props.size))
  if (nextW === cssW && nextDpr === dpr && ctx) return false

  dpr = nextDpr
  cssW = nextW
  cssH = nextW
  el.width = Math.round(cssW * dpr)
  el.height = Math.round(cssH * dpr)
  el.style.width = `${cssW}px`
  el.style.height = `${cssH}px`
  ctx = el.getContext('2d')
  return true
}

/**
 * 容器宽度变了（转屏、拖窗口）或 DPR 变了（把窗口拖到另一块屏）都要重建画布：
 * 否则画布只是被 CSS 拉伸，1px 的线会发虚，轨迹也不再对应真实坐标。
 */
function onResize() {
  if (!setup()) return
  if (ctx) draw(ctx, cssW, cssH, dpr)
}

function tick() {
  if (!ctx) return
  if (!switching) {
    for (let i = 0; i < STEPS_PER_FRAME; i++) step(bodies, DT)
    recenter(bodies)
    pushTrail(bodies, TRAIL_MAX)
    if (escaped(bodies)) nextRound()
  }
  draw(ctx, cssW, cssH, dpr)
  frame = requestAnimationFrame(tick)
}

function start() {
  if (running || !ctx) return
  running = true
  frame = requestAnimationFrame(tick)
}

function stop() {
  running = false
  if (frame) cancelAnimationFrame(frame)
  frame = 0
}

/** 切到后台就停：rAF 反正会被浏览器节流，没必要让它继续排队 */
function onVisibility() {
  if (document.hidden) stop()
  else if (inView) start()
}

/** 静态一帧：先积分一段，画出已经走乱的轨迹，然后停手 */
function still() {
  if (!ctx) return
  for (let n = 0; n < 9000; n++) {
    step(bodies, DT)
    if (n % 12 === 0) pushTrail(bodies, TRAIL_MAX)
  }
  recenter(bodies)
  draw(ctx, cssW, cssH, dpr)
}

onMounted(() => {
  setup()
  if (!ctx) return
  accelerate(bodies)

  // 尺寸/DPR 的监听先挂：减弱动态效果那条分支同样要能重画
  if (typeof ResizeObserver !== 'undefined' && holder.value) {
    resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(holder.value)
  }
  // ResizeObserver 抓不到「DPR 变了但 CSS 尺寸没变」——把窗口拖到另一块屏
  window.addEventListener('resize', onResize, { passive: true })

  if (prefersReducedMotion()) {
    still()
    return
  }

  // 只在画布进视口时跑，滚过去就停——不让它在后台白烧 CPU
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        inView = e.isIntersecting
        if (inView) start()
        else stop()
      }
    },
    { threshold: 0.05 },
  )
  if (holder.value) observer.observe(holder.value)
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  stop()
  if (switchTimer) window.clearTimeout(switchTimer)
  switchTimer = 0
  observer?.disconnect()
  resizeObserver?.disconnect()
  window.removeEventListener('resize', onResize)
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<template>
  <div ref="holder" class="sim">
    <canvas
      ref="canvas"
      class="sim__canvas"
      :class="{ 'is-fading': fading }"
      role="img"
      aria-label="三体运动模拟：三个质点从静止释放，在彼此引力下作混沌运动，白色细线是走过的轨迹。某个质点被甩出后，换一组初始位置重新开始。"
    ></canvas>
  </div>
</template>

<style scoped>
.sim {
  /* 描边和圆角写在同一个盒子上，四个角不会被裁 */
  display: inline-block;
  border: 1px solid var(--ink-2);
  border-radius: var(--r);
  background: var(--void);
  line-height: 0;
}

.sim__canvas {
  display: block;
  max-width: 100%;
  transition: opacity 320ms var(--ease);
}

.sim__canvas.is-fading {
  opacity: 0;
}
</style>
