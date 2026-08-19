<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import type { MarkBoxLines, MarkLineKey } from '../../types'
import { calcMarkBoxLines, type MarkBoxLinePositions } from '../../utils/calcMarkBoxLines'

const props = withDefaults(
  defineProps<{
    /** 三条竖线位置（窗口宽度百分比） */
    lines?: MarkBoxLines
    /** 本色单元号 */
    currentUnit?: number
    /** 首色单元号（基准） */
    firstUnit?: number
  }>(),
  {
    lines: () => ({ first: 76, prev: 82, current: 88 }),
    currentUnit: 4,
    firstUnit: 1,
  },
)

const emit = defineEmits<{
  place: [lines: MarkBoxLinePositions]
}>()

const LINE_DEFS: { key: MarkLineKey; label: string; color: string }[] = [
  { key: 'first', label: '首色', color: '#22c55e' },
  { key: 'prev', label: '前色', color: '#e11d48' },
  { key: 'current', label: '本色', color: '#22d3ee' },
]

const boxesVisible = ref(false)
const drawKey = ref(0)
const windowEl = ref<HTMLElement | null>(null)
const plotWrapRef = ref<HTMLElement | null>(null)
const plotCanvasRef = ref<HTMLCanvasElement | null>(null)
const lastClickRatio = ref<number | null>(null)

interface PointerStart {
  x: number
  y: number
}

let pointerStart: PointerStart | null = null

function placeFromClick(el: HTMLElement, clientX: number) {
  const rect = el.getBoundingClientRect()
  const clickRatio = (clientX - rect.left) / rect.width
  lastClickRatio.value = clickRatio
  emit('place', calcMarkBoxLines(rect.width, clickRatio, props.currentUnit, props.firstUnit))
}

function onPointerDown(e: PointerEvent) {
  pointerStart = { x: e.clientX, y: e.clientY }
}

function onPointerUp(e: PointerEvent) {
  if (!pointerStart) return
  const dx = e.clientX - pointerStart.x
  const dy = e.clientY - pointerStart.y
  pointerStart = null
  if (Math.hypot(dx, dy) > 8) return

  const el = e.currentTarget
  if (!(el instanceof HTMLElement)) return

  placeFromClick(el, e.clientX)
  boxesVisible.value = true
  drawKey.value += 1
}

function onPointerCancel() {
  pointerStart = null
}

watch(
  () => props.currentUnit,
  () => {
    if (!boxesVisible.value || lastClickRatio.value == null || !windowEl.value) return
    const rect = windowEl.value.getBoundingClientRect()
    emit(
      'place',
      calcMarkBoxLines(rect.width, lastClickRatio.value, props.currentUnit, props.firstUnit),
    )
    drawKey.value += 1
  },
)

function clearBoxes() {
  boxesVisible.value = false
  lastClickRatio.value = null
}

defineExpose({ clearBoxes })

/* ================= 波形绘制（exp(−t⁴) notch 布朗噪声做基底） ================= */
const N = 1200
const data = new Float32Array(N)

interface PlotRect {
  x0: number
  y0: number
  w: number
  h: number
}

interface WaveDip {
  center: number
  width: number
  depth: number
}

const TICK_AREA = 22
const TICK_STEP = 7
const TICK_MINOR = 5
const TICK_MID = 8
const TICK_MAJOR = 13

const plot: PlotRect = { x0: 0, y0: 0, w: 0, h: 0 }
let cssW = 0
let cssH = 0
let frameTimer: ReturnType<typeof setInterval> | null = null
let resizeObserver: ResizeObserver | null = null

function generateFrame() {
  const base: number[] = []
  let val = 0.5
  for (let i = 0; i < N; i++) {
    val += (Math.random() - 0.5) * 0.08
    val = Math.max(0.1, Math.min(0.9, val))
    base.push(val)
  }

  const dips: WaveDip[] = []
  const numDips = 3 + Math.floor(Math.random() * 2)
  for (let d = 0; d < numDips; d++) {
    dips.push({
      center: 100 + Math.random() * (N - 200),
      width: 15 + Math.random() * 35,
      depth: 0.12 + Math.random() * 0.18,
    })
  }

  for (let i = 0; i < N; i++) {
    let v = base[i]
    for (const dip of dips) {
      const t = (i - dip.center) / dip.width
      v -= dip.depth * Math.exp(-Math.pow(t, 4))
    }
    data[i] = v
  }
}

function dataXToPx(dx: number) {
  return plot.x0 + (dx / N) * plot.w
}

function dataYToPx(dy: number) {
  return plot.y0 + (1 - dy) * plot.h
}

function getPlotCtx() {
  return plotCanvasRef.value?.getContext('2d') ?? null
}

function renderCurveLayer() {
  const c = getPlotCtx()
  if (!c) return
  c.clearRect(0, 0, cssW, cssH)
  c.fillStyle = '#0F1B2E'
  c.fillRect(0, 0, cssW, cssH)

  c.strokeStyle = 'rgba(255,255,255,0.06)'
  c.lineWidth = 1
  for (let y = plot.y0; y <= plot.y0 + plot.h; y += 40) {
    c.beginPath()
    c.moveTo(plot.x0, y)
    c.lineTo(plot.x0 + plot.w, y)
    c.stroke()
  }

  c.beginPath()
  c.strokeStyle = '#b91c1c'
  c.lineWidth = 1.5
  for (let i = 0; i < N; i++) {
    const px = dataXToPx(i)
    const py = dataYToPx(data[i])
    if (i === 0) c.moveTo(px, py)
    else c.lineTo(px, py)
  }
  c.stroke()

  c.beginPath()
  c.fillStyle = 'rgba(185, 28, 28, 0.08)'
  c.moveTo(dataXToPx(0), plot.y0 + plot.h)
  for (let i = 0; i < N; i++) {
    c.lineTo(dataXToPx(i), dataYToPx(data[i]))
  }
  c.lineTo(dataXToPx(N - 1), plot.y0 + plot.h)
  c.closePath()
  c.fill()

  drawScale(c)
}

function drawScale(c: CanvasRenderingContext2D) {
  const y0 = plot.y0 + plot.h
  const x0 = plot.x0
  const count = Math.floor(plot.w / TICK_STEP)

  c.strokeStyle = 'rgba(169, 184, 199, 0.8)'
  c.lineWidth = 1
  c.beginPath()
  c.moveTo(x0, y0)
  c.lineTo(x0 + plot.w, y0)
  for (let i = 0; i <= count; i++) {
    const x = x0 + i * TICK_STEP
    let h = TICK_MINOR
    if (i % 10 === 0) h = TICK_MAJOR
    else if (i % 5 === 0) h = TICK_MID
    c.moveTo(x, y0)
    c.lineTo(x, y0 + h)
  }
  c.stroke()
}

function resizePlot() {
  const canvas = plotCanvasRef.value
  const wrap = plotWrapRef.value
  if (!canvas || !wrap) return

  const rect = wrap.getBoundingClientRect()
  cssW = Math.max(320, rect.width)
  cssH = Math.max(80, rect.height)
  const dpr = window.devicePixelRatio || 1

  canvas.width = Math.round(cssW * dpr)
  canvas.height = Math.round(cssH * dpr)
  canvas.style.height = cssH + 'px'

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  plot.x0 = 0
  plot.y0 = 16
  plot.w = cssW
  plot.h = Math.max(80, cssH - plot.y0 - TICK_AREA)

  renderCurveLayer()
}

function pushFrame() {
  generateFrame()
  renderCurveLayer()
}

onMounted(() => {
  resizePlot()
  pushFrame()

  window.addEventListener('resize', resizePlot)
  if (plotWrapRef.value) {
    resizeObserver = new ResizeObserver(resizePlot)
    resizeObserver.observe(plotWrapRef.value)
  }

  frameTimer = setInterval(pushFrame, 500)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizePlot)
  resizeObserver?.disconnect()
  if (frameTimer) clearInterval(frameTimer)
})
</script>

<template>
  <div class="mark-display">
    <div
      ref="windowEl"
      class="window"
      :style="{ '--tick-area': TICK_AREA + 'px' }"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
    >
      <div ref="plotWrapRef" class="plot-wrap">
        <canvas ref="plotCanvasRef" aria-hidden="true" />
      </div>

      <!-- 三个色标框（点击后显示） -->
      <div
        v-for="d in LINE_DEFS"
        v-show="boxesVisible"
        :key="`${d.key}-${drawKey}`"
        class="mark-box"
        :style="{ left: lines[d.key] + '%', '--box-color': d.color }"
      >
        <span class="mark-box-frame" />
      </div>

      <p v-if="!boxesVisible" class="window-hint">点击窗口绘制色标框</p>
      <p v-else class="window-hint window-hint-sub">再次点击可重新定位</p>
    </div>

    <div class="legend">
      <span v-for="d in LINE_DEFS" :key="'lg-' + d.key" class="legend-item">
        {{ d.label }}<i :style="{ background: d.color }" />
      </span>
    </div>
  </div>
</template>

<style scoped>
.mark-display {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.window {
  position: relative;
  flex: 1;
  height: 240px;
  background: rgba(13, 27, 46, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  cursor: crosshair;
  touch-action: manipulation;
  user-select: none;
}

.plot-wrap {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.plot-wrap canvas {
  display: block;
  width: 100%;
}

.mark-box {
  position: absolute;
  top: 0;
  bottom: var(--tick-area);
  width: 34px;
  transform: translateX(-50%);
  pointer-events: none;
  transition: left 0.35s ease;
  animation: box-in 0.25s ease;
  z-index: 3;
}

@keyframes box-in {
  from {
    opacity: 0.35;
    transform: translateX(-50%) scaleY(0.92);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) scaleY(1);
  }
}

.mark-box-frame {
  position: absolute;
  inset: 0;
  border: 2px solid var(--box-color);
  background: rgba(255, 255, 255, 0.04);
  box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.03);
}

.window-hint {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  font-size: 13px;
  color: #a9b8c7;
  pointer-events: none;
}

.window-hint-sub {
  align-items: flex-end;
  padding-bottom: 28px;
  font-size: 16px;
  opacity: 0.7;
}

.legend {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
  color: #94a3b8;
}

.legend-item i {
  width: 22px;
  height: 3px;
  display: inline-block;
}
</style>
