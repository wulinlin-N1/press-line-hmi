<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import PuSelector from './PuSelector.vue'
import MarkShapeRow from './MarkShapeRow.vue'
import MarkDisplay from './MarkDisplay.vue'
import MarkControls from './MarkControls.vue'
import ColorTable from './ColorTable.vue'
import type { ColorTableValues, MarkBoxLines } from '../../types/index.ts'
import type { MarkBoxLinePositions } from '../../utils/calcMarkBoxLines.ts'

defineEmits<{
  close: []
}>()

const PU_LIST = [2, 3, 4, 5, 6, 7, 8, 9, 10]
const FIRST_MARK = 1

const selected = ref(4)
const markDisplayRef = ref<InstanceType<typeof MarkDisplay> | null>(null)
const windowPos = ref(554)
const rollerFine = ref(0)
const curveDrag = ref(0)

const values = reactive<ColorTableValues>({ long: [-595, 2101, 0], trans: [-358, 499, 0] })
const lines = reactive<MarkBoxLines>({ first: 76, prev: 82, current: 88 })

const rand = (min: number, max: number) => min + Math.random() * (max - min)

function rebase() {
  values.long = [Math.round(rand(-700, -300)), Math.round(rand(1500, 2600)), 0]
  values.trans = [Math.round(rand(-500, -200)), Math.round(rand(300, 700)), 0]
}

function selectPu(i: number) {
  selected.value = i
  rebase()
}

function onPlaceBoxes(next: MarkBoxLinePositions) {
  lines.first = next.first
  lines.prev = next.prev
  lines.current = next.current
}

function onClearBoxes() {
  markDisplayRef.value?.clearBoxes()
}

function tick() {
  values.long[0] += Math.round(rand(-12, 12))
  values.trans[0] += Math.round(rand(-8, 8))
  values.long[1] += Math.round(rand(-20, 20))
  values.trans[1] += Math.round(rand(-14, 14))
}

const deviationMm = computed(() => (values.long[0] / 294).toFixed(2))

let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  timer = setInterval(tick, 1000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="mark-lock">
    <!-- 头部 -->
    <header class="ml-header">
      <span class="ml-title">锁定标记</span>
      <div class="ml-header-right">
        <span class="single-mark">单标记 <i /></span>
        <button type="button" class="close-btn" @click="$emit('close')">关闭</button>
      </div>
    </header>

    <!-- PU 选择 -->
    <section class="ml-section">
      <PuSelector :units="PU_LIST" :selected="selected" @select="selectPu" />
    </section>

    <!-- 标记形状行 -->
    <section class="ml-section">
      <MarkShapeRow
        :current="selected"
        :first="FIRST_MARK"
        @clear="onClearBoxes"
        @select="selectPu"
      />
    </section>

    <!-- 观察窗口（波形留白） -->
    <section class="ml-section">
      <MarkDisplay
        ref="markDisplayRef"
        :lines="lines"
        :current-unit="selected"
        :first-unit="FIRST_MARK"
        @place="onPlaceBoxes"
      />
    </section>

    <!-- 控制区 + 色标表 -->
    <section class="ml-bottom">
      <MarkControls
        :deviation="deviationMm"
        :window-pos="windowPos"
        :roller-fine="rollerFine"
        :curve-drag="curveDrag"
        @adjust-window="(d) => (windowPos += d)"
        @adjust-roller="(d) => (rollerFine = Math.round((rollerFine + d) * 10) / 10)"
        @nudge-window="(d) => (windowPos += d)"
      />
      <ColorTable :values="values" />
    </section>
  </div>
</template>

<style scoped>
.mark-lock {
  --ml-bg: #0a1628;
  --ml-panel: rgba(13, 27, 46, 0.85);
  --ml-header: #0d1117;
  --ml-border: rgba(255, 255, 255, 0.08);
  --ml-border-soft: rgba(100, 116, 139, 0.35);
  --ml-text: #e2e8f0;
  --ml-text-muted: #a9b8c7;
  --ml-text-secondary: #94a3b8;
  --ml-accent: #1890ff;
  --ml-accent-soft: rgba(24, 144, 255, 0.25);
  --ml-cyan: #22d3ee;
  --ml-btn-bg: rgba(15, 23, 42, 0.75);
  --ml-btn-hover: rgba(24, 144, 255, 0.12);
  --ml-surface: rgba(10, 22, 40, 0.95);

  height: 100%;
  padding: 16px 22px 20px;
  color: var(--ml-text);
  background: var(--ml-bg);
}

.ml-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--ml-border);
}

.ml-title {
  border: 1px solid rgba(245, 158, 11, 0.55);
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 16px;
  font-weight: 600;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.1);
}

.ml-header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.single-mark {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #e2e8f0;
}

.single-mark i {
  width: 10px;
  height: 14px;
  background: var(--ml-text);
  display: inline-block;
}

.close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--btn-size);
  min-height: var(--btn-size);
  border: 1px solid var(--ml-border-soft);
  border-radius: 6px;
  background: var(--ml-btn-bg);
  font-size: 16px;
  font-family: inherit;
  color: var(--ml-text);
  padding: 6px 18px;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s;
}

.close-btn:hover {
  background: var(--ml-btn-hover);
  border-color: rgba(24, 144, 255, 0.45);
}

.ml-section {
  margin-bottom: 16px;
}

.ml-bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
</style>
