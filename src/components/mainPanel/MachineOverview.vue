<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import MaterialFlowDiagram from './MaterialFlowDiagram.vue'
import { lineSimulatorKey } from '../../types/index.ts'

const lineSimulator = inject(lineSimulatorKey)
if (!lineSimulator) {
  throw new Error('lineSimulator is not provided')
}

const { alarmCount, running } = lineSimulator

const unwindDiameter = ref(480)
const windDiameter = ref(220)
const unwindMax = 600
const windMax = 550

const reelStats = [
  { label: '收料总长度', value: '0.07', unit: 'm' },
  { label: '收料 A 轴', value: '0.04', unit: 'm' },
  { label: '收料 B 轴', value: '0.03', unit: 'm' },
]

const dancers = [
  { label: '送卷摆臂', value: 50 },
  { label: '收卷摆臂', value: 50 },
  { label: '引入摆臂', value: 61 },
  { label: '引出摆臂', value: 41 },
]

const registerItems = [
  { station: '02', value: -0.06 },
  { station: '03', value: -0.17 },
  { station: '04', value: 0.22 },
  { station: '05', value: 0.28, highlight: true },
  { station: '06', value: -0.06 },
  { station: '07', value: -0.11 },
  { station: '08', value: 0.06 },
  { station: '09', value: -0.12 },
  { station: '10', value: -0.08 },
]

const speedPresets = [24, 36, 120, 150]
const activePreset = ref<number | null>(null)
const accelTime = ref(12.0)
const decelTime = ref(12.0)

const summaryItems = computed(() => [
  { label: '运行状态', value: running.value ? '运行中' : '已停机', type: 'running' },
  { label: '本班产量', value: '0.07 m' },
  { label: '套色合格率', value: '98.6 %' },
  {
    label: '当前报警',
    value: alarmCount.value === 0 ? '无' : `${alarmCount.value} 条`,
    type: alarmCount.value > 0 ? 'alarm' : undefined,
  },
])

function dancerOffset(value: number) {
  return Math.round(value - 50)
}

function formatDancerValue(value: number) {
  const offset = dancerOffset(value)
  const sign = offset > 0 ? '+' : ''
  return `${sign}${offset}%`
}

function dancerTone(value: number) {
  const offset = dancerOffset(value)
  if (offset > 0) return 'is-positive'
  if (offset < 0) return 'is-negative'
  return 'is-neutral'
}

function dancerFillStyle(value: number) {
  const center = 50
  if (value >= center) {
    return { left: '50%', width: `${value - center}%` }
  }
  return { left: `${value}%`, width: `${center - value}%` }
}

function formatRegisterValue(value: number) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}`
}

function getGaugeRotation(value: number) {
  return Math.max(-45, Math.min(45, value * 80))
}
</script>

<template>
  <div class="overview">
    <div class="overview-col overview-left">
      <section class="panel-card">
        <header class="panel-header">
          <h3 class="panel-title">收放卷</h3>
        </header>
        <div class="panel-body">
          <div class="reel-bar-group">
            <div class="reel-bar-item">
              <div class="reel-bar-head">
                <span class="reel-bar-label">放卷直径</span>
                <span class="reel-bar-value">{{ unwindDiameter }} <small>mm</small></span>
              </div>
              <div class="progress-track">
                <div
                  class="progress-fill progress-fill-cyan"
                  :style="{ width: `${(unwindDiameter / unwindMax) * 100}%` }"
                ></div>
              </div>
            </div>
            <div class="reel-bar-item">
              <div class="reel-bar-head">
                <span class="reel-bar-label">收卷直径</span>
                <span class="reel-bar-value">{{ windDiameter }} <small>mm</small></span>
              </div>
              <div class="progress-track">
                <div
                  class="progress-fill progress-fill-green"
                  :style="{ width: `${(windDiameter / windMax) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
          <ul class="stat-list">
            <li v-for="item in reelStats" :key="item.label" class="stat-row">
              <span class="stat-label">{{ item.label }}</span>
              <span class="stat-value">
                {{ item.value }} <small>{{ item.unit }}</small>
                <button type="button" class="stat-reset" aria-label="重置">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                </button>
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section class="panel-card panel-card-grow">
        <header class="panel-header">
          <h3 class="panel-title">摆臂位置</h3>
        </header>
        <div class="panel-body dancer-body">
          <div
            v-for="item in dancers"
            :key="item.label"
            class="dancer-row"
            :class="dancerTone(item.value)"
          >
            <div class="dancer-gauge" :aria-label="`${item.label} ${formatDancerValue(item.value)}`">
              <div class="dancer-rail">
                <span class="dancer-end dancer-end-left"></span>
                <span class="dancer-end dancer-end-right"></span>
                <div class="dancer-zero"></div>
                <div class="dancer-fill" :style="dancerFillStyle(item.value)"></div>
                <div class="dancer-thumb" :style="{ left: `${item.value}%` }">
                  <i></i>
                  <i></i>
                </div>
              </div>
              <div class="dancer-scale">
                <span>−</span>
                <span>0</span>
                <span>+</span>
              </div>
            </div>
            <div class="dancer-meta">
              <span class="dancer-value">{{ formatDancerValue(item.value) }}</span>
              <span class="dancer-label">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="overview-col overview-center">
      <MaterialFlowDiagram />

      <!-- <section class="panel-card">
        <header class="panel-header panel-header-split">
          <h3 class="panel-title">套色偏差 <span>REGISTER</span></h3>
          <span class="register-max">最大 <strong>+0.28 mm</strong> (05 组)</span>
        </header>
        <div class="panel-body register-body">
          <div
            v-for="item in registerItems"
            :key="item.station"
            class="register-item"
            :class="{ highlight: item.highlight }"
          >
            <div class="register-gauge">
              <svg viewBox="0 0 40 40" aria-hidden="true">
                <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(100,116,139,0.3)" stroke-width="1.5" />
                <circle cx="20" cy="20" r="2.5" fill="#22d3ee" />
                <line
                  x1="20"
                  y1="20"
                  x2="20"
                  y2="8"
                  stroke="#22d3ee"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  :transform="`rotate(${getGaugeRotation(item.value)} 20 20)`"
                />
              </svg>
            </div>
            <span class="register-value">{{ formatRegisterValue(item.value) }}</span>
            <span class="register-station">{{ item.station }}</span>
          </div>
        </div>
      </section> -->
    </div>

    <div class="overview-col overview-right">
      <section class="panel-card">
        <header class="panel-header">
          <h3 class="panel-title">速度设定</h3>
        </header>
        <div class="panel-body">
          <div class="speed-preset-label">自动升速至：</div>
          <div class="speed-presets">
            <button
              v-for="preset in speedPresets"
              :key="preset"
              type="button"
              class="preset-btn"
              :class="{ active: activePreset === preset }"
              @click="activePreset = preset"
            >
              {{ preset }}
            </button>
          </div>
          <div class="speed-manual">
            <button type="button" class="manual-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 15l5-5 5 5" />
                <path d="M7 11l5-5 5 5" />
              </svg>
              手动升速
            </button>
            <button type="button" class="manual-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 9l5 5 5-5" />
                <path d="M7 13l5 5 5-5" />
              </svg>
              手动降速
            </button>
          </div>
          <div class="slider-group">
            <div class="slider-item">
              <div class="slider-head">
                <span>加速时间</span>
                <span class="slider-value">{{ accelTime.toFixed(1) }} s</span>
              </div>
              <input
                v-model.number="accelTime"
                type="range"
                min="0"
                max="30"
                step="0.1"
                class="range-input"
              />
            </div>
            <div class="slider-item">
              <div class="slider-head">
                <span>减速时间</span>
                <span class="slider-value">{{ decelTime.toFixed(1) }} s</span>
              </div>
              <input
                v-model.number="decelTime"
                type="range"
                min="0"
                max="30"
                step="0.1"
                class="range-input"
              />
            </div>
          </div>
        </div>
      </section>

      <section class="panel-card panel-card-grow">
        <header class="panel-header">
          <h3 class="panel-title">运行摘要</h3>
        </header>
        <div class="panel-body">
          <ul class="summary-list">
            <li v-for="item in summaryItems" :key="item.label" class="summary-row">
              <span class="summary-label">{{ item.label }}</span>
              <span class="summary-value" :class="item.type">{{ item.value }}</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.overview {
  display: grid;
  grid-template-columns: 280px 1fr 280px;
  gap: 12px;
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
  /* padding-top: 50px; */
  overflow: hidden;
}

.overview-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.panel-card {
  /* background: rgba(13, 27, 46, 0.75); */
  background: #2b3a4ba6;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  overflow: hidden;
}

.panel-card-grow {
  flex: 1;
  min-height: 0;
}

.panel-header {
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.panel-header-split {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #e2e8f0;
}

.panel-title span {
  margin-left: 6px;
  font-size: 16px;
  font-weight: 500;
  color: #a9b8c7;
  letter-spacing: 0.5px;
}

.panel-body {
  padding: 14px;
}

.reel-bar-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.reel-bar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.reel-bar-label {
  font-size: 16px;
  color: #94a3b8;
}

.reel-bar-value {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.reel-bar-value small {
  font-size: 16px;
  font-weight: 500;
  color: #a9b8c7;
}

.progress-track {
  height: 8px;
  background: rgba(100, 116, 139, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-fill-cyan {
  background: linear-gradient(90deg, #0891b2, #22d3ee);
}

.progress-fill-green {
  background: linear-gradient(90deg, #059669, #34d399);
}

.stat-list {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 12px;
}

.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}

.stat-label {
  font-size: 16px;
  color: #a9b8c7;
}

.stat-value {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
}

.stat-value small {
  font-size: 16px;
  color: #a9b8c7;
  font-weight: 500;
}

.stat-reset {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--btn-size);
  height: var(--btn-size);
  min-width: var(--btn-size);
  min-height: var(--btn-size);
  padding: 0;
  border: none;
  background: transparent;
  color: #a9b8c7;
  cursor: pointer;
}

.stat-reset svg {
  width: 20px;
  height: 20px;
}

.stat-reset:hover {
  color: #22d3ee;
}

.dancer-body {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  gap: 10px;
  min-height: 160px;
}

.dancer-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-radius: 8px;
  background: rgba(8, 16, 28, 0.45);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.dancer-gauge {
  flex: 1;
  min-width: 0;
}

.dancer-rail {
  position: relative;
  height: 8px;
  margin: 8px 12px 0;
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.28);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.35);
}

.dancer-end {
  position: absolute;
  top: 50%;
  width: 2px;
  height: 10px;
  margin-top: -5px;
  background: rgba(203, 213, 225, 0.55);
}

.dancer-end-left {
  left: 0;
}

.dancer-end-right {
  right: 0;
}

.dancer-zero {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 2px;
  height: 16px;
  margin: -8px 0 0 -1px;
  border-radius: 1px;
  background: #e2e8f0;
  box-shadow: 0 0 8px rgba(226, 232, 240, 0.45);
  z-index: 1;
}

.dancer-fill {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 999px;
  opacity: 0.9;
}

.dancer-row.is-positive .dancer-fill {
  background: linear-gradient(90deg, rgba(34, 211, 238, 0.15), #22d3ee);
}

.dancer-row.is-negative .dancer-fill {
  background: linear-gradient(90deg, #fb923c, rgba(251, 146, 60, 0.15));
}

.dancer-row.is-neutral .dancer-fill {
  background: transparent;
}

.dancer-thumb {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  width: 24px;
  height: 18px;
  transform: translate(-50%, -50%);
  border-radius: 3px;
  background: linear-gradient(180deg, #334155 0%, #0f172a 100%);
  border: 1px solid #e2e8f0;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.4),
    0 0 10px rgba(34, 211, 238, 0.18);
}

.dancer-thumb i {
  display: block;
  width: 1px;
  height: 10px;
  background: rgba(148, 163, 184, 0.9);
}

.dancer-row.is-positive .dancer-thumb {
  border-color: #67e8f9;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.4),
    0 0 12px rgba(34, 211, 238, 0.45);
}

.dancer-row.is-negative .dancer-thumb {
  border-color: #fdba74;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.4),
    0 0 12px rgba(251, 146, 60, 0.4);
}

.dancer-scale {
  display: flex;
  justify-content: space-between;
  margin: 6px 8px 0;
  font-size: 16px;
  line-height: 1;
  color: #ccc;
  font-variant-numeric: tabular-nums;
}

.dancer-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
  min-width: 78px;
}

.dancer-value {
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.3px;
}

.dancer-row.is-positive .dancer-value {
  color: #22d3ee;
  text-shadow: 0 0 8px rgba(34, 211, 238, 0.35);
}

.dancer-row.is-negative .dancer-value {
  color: #fb923c;
  text-shadow: 0 0 8px rgba(251, 146, 60, 0.3);
}

.dancer-row.is-neutral .dancer-value {
  color: #cbd5e1;
}

.dancer-label {
  font-size: 20px;
  color: #94a3b8;
  white-space: nowrap;
}

.register-max {
  font-size: 16px;
  color: #a9b8c7;
  white-space: nowrap;
}

.register-max strong {
  color: #fb923c;
}

.register-body {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  overflow-x: auto;
}

.register-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 52px;
}

.register-gauge svg {
  width: 40px;
  height: 40px;
}

.register-value {
  font-size: 16px;
  font-weight: 600;
  color: #94a3b8;
  font-variant-numeric: tabular-nums;
}

.register-item.highlight .register-value {
  color: #fb923c;
}

.register-station {
  font-size: 10px;
  color: #475569;
}

.speed-preset-label {
  margin-bottom: 8px;
  font-size: 18px;
  color: #a9b8c7;
}

.speed-presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.preset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: var(--btn-size);
  min-height: var(--btn-size);
  padding: 10px 0;
  border: 1px solid rgba(100, 116, 139, 0.4);
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.6);
  color: #94a3b8;
  font-size: 16px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn:hover {
  border-color: rgba(34, 211, 238, 0.5);
  color: #22d3ee;
}

.preset-btn.active {
  border-color: #22d3ee;
  color: #22d3ee;
  background: rgba(34, 211, 238, 0.1);
}

.speed-manual {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
}

.manual-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: var(--btn-size);
  min-height: var(--btn-size);
  padding: 10px 8px;
  border: 1px solid rgba(100, 116, 139, 0.35);
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.6);
  color: #94a3b8;
  font-size: 16px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.manual-btn svg {
  width: 20px;
  height: 20px;
}

.manual-btn:hover {
  border-color: rgba(34, 211, 238, 0.5);
  color: #22d3ee;
}

.slider-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 14px;
}

.slider-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 16px;
  color: #a9b8c7;
}

.slider-value {
  color: #22d3ee;
  font-weight: 600;
}

.range-input {
  width: 100%;
  height: 4px;
  appearance: none;
  background: rgba(100, 116, 139, 0.3);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.range-input::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #22d3ee;
  box-shadow: 0 0 8px rgba(34, 211, 238, 0.8);
  cursor: pointer;
}

.summary-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-label {
  font-size: 16px;
  color: #a9b8c7;
}

.summary-value {
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
}

.summary-value.running {
  color: #34d399;
}

.summary-value.alarm {
  color: #ef4444;
}
</style>
