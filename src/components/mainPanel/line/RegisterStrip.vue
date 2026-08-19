<script setup lang="ts">
import AlarmLamp from './AlarmLamp.vue'
import { unitX } from '../../../utils/buildWebPath.ts'

const VIEWBOX_WIDTH = 1124

withDefaults(
  defineProps<{
    /** 2~10 号色组套色偏差（mm），长度 9 */
    deviations: number[]
    /** 是否存在报警 */
    alarm?: boolean
    /** 当前正在进行套色的色组 id */
    activeUnitId?: number | null
  }>(),
  { alarm: false, activeUnitId: null },
)

/** 与 PrintUnit 编号锚点对齐 */
const unitCenterX = (id: number) => unitX(id) + 2

/** 偏差值 → 横杆纵向位移（像素），限制 ±14px */
const clamp = (v: number) => Math.max(-14, Math.min(14, v * 1.4))
</script>

<template>
  <div class="register-strip">
    <div class="register-strip-head">
      <span class="rs-label">套色偏差</span>
      <AlarmLamp :alarm="alarm" />
    </div>

    <svg :viewBox="`0 0 ${VIEWBOX_WIDTH} 62`" class="rs-svg" aria-label="套色偏差">
      <g v-for="(dev, i) in deviations" :key="i" :transform="`translate(${unitCenterX(i + 2)} 0)`">
        <!-- 竖杆（基准） -->
        <rect x="-3" y="4" width="6" height="44" rx="2" fill="#9aa0a6" />
        <!-- 横杆（随偏差上下移动） -->
        <rect
          class="register-bar"
          x="-17"
          y="23"
          width="34"
          height="6"
          rx="2"
          fill="#5b636c"
          :transform="`translate(0 ${clamp(dev)})`"
        />
        <circle
          v-if="activeUnitId === i + 2"
          class="register-active-dot"
          cx="14"
          cy="8"
          r="4.5"
          fill="#22c55e"
          stroke="#15803d"
          stroke-width="1.2"
        />
        <text x="0" y="60" text-anchor="middle" font-size="13" font-weight="600" fill="#cbd5e1">
          {{ i + 2 }}
        </text>
        <title>
          {{ i + 2 }} 号色组套色偏差：{{ dev.toFixed(1) }} mm <template v-if="activeUnitId === i +
          2">（当前套色）</template>
        </title>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.register-strip {
  padding: 10px 0 12px;
}

.register-strip-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 20px 6px;
}

.rs-label {
  font-size: 16px;
  font-weight: 600;
  color: #a9b8c7;
  white-space: nowrap;
}

.rs-svg {
  display: block;
  width: 100%;
  height: auto;
}

.register-bar {
  transition: none;
}

.register-active-dot {
  animation: register-dot-blink 0.9s ease-in-out infinite;
}

@keyframes register-dot-blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}
</style>
