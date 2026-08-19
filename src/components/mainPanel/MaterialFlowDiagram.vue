<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import TopBar from './line/TopBar.vue'
import MachineLine from './line/MachineLine.vue'
import RegisterStrip from './line/RegisterStrip.vue'
import UnitDetailDialog from './line/UnitDetailDialog.vue'
import { lineSimulatorKey, type PrintUnit } from '../../types/index.ts'

const lineSimulator = inject(lineSimulatorKey)
if (!lineSimulator) {
  throw new Error('lineSimulator is not provided')
}

const {
  running,
  speed,
  units,
  tensions,
  deviations,
  alarmCount,
  stopCount,
  activeUnitId,
  toggleRunning,
} = lineSimulator

const selectedUnit = ref<PrintUnit | null>(null)

const selectedDeviation = computed(() => {
  if (!selectedUnit.value || selectedUnit.value.id < 2) return null
  return deviations[selectedUnit.value.id - 2]
})

function openUnitDetail(unit: PrintUnit) {
  selectedUnit.value = unit
}

function closeUnitDetail() {
  selectedUnit.value = null
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && selectedUnit.value) {
    closeUnitDetail()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <section class="panel-card panel-card-line">
    <header class="panel-header panel-header-split">
      <div class="panel-title-row">
        <span class="status-dot" :class="{ running }"></span>
        <h3 class="panel-title">整机线</h3>
      </div>
    </header>
    <div class="panel-body line-body">
      <div class="line-placeholder">
        <div class="page">
          <div class="card">
            <TopBar
              :running="running"
              :alarm-count="alarmCount"
              :stop-count="stopCount"
              @toggle="toggleRunning"
            />

            <MachineLine
              :units="units"
              :tensions="tensions"
              :active-unit-id="activeUnitId"
              :running="running"
              :speed="speed"
              @unit-click="openUnitDetail"
            />

            <RegisterStrip
              :deviations="deviations"
              :alarm="alarmCount > 0"
              :active-unit-id="activeUnitId"
            />

            <UnitDetailDialog
              :unit="selectedUnit"
              :deviation="selectedDeviation"
              :active-unit-id="activeUnitId"
              :running="running"
              :speed="speed"
              @close="closeUnitDetail"
            />
          </div>

          <p class="hint">
            绿色版辊标记为当前运行色组 · 点击色组查看详情 · 报警时显示红框与顶部红灯
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page {
  width: 100%;
}
.panel-card {
  background: rgba(13, 27, 46, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  overflow: hidden;
}

.panel-card-line {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
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

.panel-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
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

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: #a9b8c7;
}

.status-dot.running {
  background: #34d399;
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.8);
}

.target-speed {
  font-size: 16px;
  color: #a9b8c7;
  white-space: nowrap;
}

.target-speed strong {
  color: #22d3ee;
  font-size: 16px;
}

.line-body {
  flex: 1;
  display: flex;
  min-height: 200px;
  padding: 14px;
}

.line-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px dashed rgba(100, 116, 139, 0.35);
  border-radius: 6px;
  color: #a9b8c7;
  font-size: 16px;
}

.line-placeholder small {
  font-size: 16px;
  color: #475569;
}
</style>
