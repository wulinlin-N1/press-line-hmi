<script setup lang="ts">
import { computed } from 'vue'
import PrintUnit from './PrintUnit.vue'
import WinderStation from './WinderStation.vue'
import type { PrintUnit as PrintUnitType, Tensions } from '../../../types/index.ts'
import { buildWebPath, unitX } from '../../../utils/buildWebPath.ts'

withDefaults(
  defineProps<{
    /** 10 个色组 [{ id, color, status }] */
    units: PrintUnitType[]
    /** { unwind, rewind } 张力 */
    tensions: Tensions
    /** 当前运行中的色组 id */
    activeUnitId?: number | null
    /** 整机是否开机（控制料膜/辊筒动画） */
    running?: boolean
    /** 当前车速，低于 1 视为静止 */
    speed?: number
  }>(),
  { activeUnitId: null, running: true, speed: 0 },
)

defineEmits<{
  'unit-click': [unit: PrintUnitType]
}>()

const webPath = computed(() => buildWebPath())
</script>

<template>
  <svg
    viewBox="0 0 1124 332"
    class="machine-line"
    :class="{ 'machine-halt': !running || speed < 1 }"
    role="img"
    aria-label="整线走料示意图"
  >
    <!-- 料膜：实线底轨 + 虚线流动（同一路径，完全贴合） -->
    <path
      class="web-base"
      :d="webPath"
      fill="none"
      stroke="#6b7280"
      stroke-width="2.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      class="web-flow"
      :d="webPath"
      fill="none"
      stroke="#aeb4ba"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- 机构层 -->
    <g class="machine-units">
      <g transform="translate(8 16)">
        <WinderStation type="unwind" :tension="tensions.unwind" :running="running && speed >= 1" />
      </g>

      <g v-for="u in units" :key="u.id" :transform="`translate(${unitX(u.id)} 46)`">
        <PrintUnit
          :unit="u"
          :active="u.id === activeUnitId"
          :spinning="running && speed >= 1"
          @click="$emit('unit-click', u)"
        />
      </g>

      <g transform="translate(986 46)">
        <WinderStation type="rewind" :tension="tensions.rewind" :running="running && speed >= 1" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.machine-line {
  display: block;
  width: 100%;
  height: auto;
  background: linear-gradient(180deg, rgba(13, 27, 46, 0.85) 0%, rgba(10, 22, 40, 0.95) 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.web-base {
  opacity: 0.85;
}

.web-flow {
  stroke-dasharray: 8 8;
  animation: web-run 1.2s linear infinite;
}

.machine-line.machine-halt .web-flow {
  animation-play-state: paused;
  opacity: 0;
}

@keyframes web-run {
  to {
    stroke-dashoffset: -16;
  }
}

:deep(.roller-spin) {
  transform-box: fill-box;
  transform-origin: center;
  animation: spin 2.4s linear infinite;
}

:deep(.roller-spin.slow) {
  animation-duration: 3.6s;
}

.machine-line.machine-halt :deep(.roller-spin) {
  animation-play-state: paused;
}

:deep(.unit-fade) {
  opacity: 0.45;
}

:deep(.alarm-blink) {
  animation: alarm-blink 0.9s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes alarm-blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}
</style>
