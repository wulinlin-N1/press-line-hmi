<script setup lang="ts">
import { computed } from 'vue'
import type { PrintUnit, UnitStatus } from '../../../types'

const props = withDefaults(
  defineProps<{
    /** { id, color, status: 'run' | 'stop' | 'alarm' } */
    unit: PrintUnit
    /** 是否为当前运行中的色组（版辊上显示绿色指示球） */
    active?: boolean
    /** 整机是否在运转（控制绿色指示球旋转） */
    spinning?: boolean
  }>(),
  { active: false, spinning: true },
)

defineEmits<{
  click: []
}>()

const statusColors: Record<UnitStatus, string> = {
  run: '#22c55e',
  stop: '#9ca3af',
  alarm: '#ef4444',
}

const statusLabels: Record<UnitStatus, string> = {
  run: '运行',
  stop: '停止',
  alarm: '报警',
}

const isRun = computed(() => props.unit.status === 'run')
const isStop = computed(() => props.unit.status === 'stop')
const isAlarm = computed(() => props.unit.status === 'alarm')

const showActiveMarker = computed(() => props.active && isRun.value)

const dotColor = computed(() => statusColors[props.unit.status])

const statusText = computed(() => statusLabels[props.unit.status])
</script>

<template>
  <g style="cursor: pointer" @click="$emit('click')">
    <!-- <template v-if="active">（当前运行）</template> -->
    <title>
      {{ unit.id }} 号色组：{{ statusText }}
      点击查看详情
    </title>

    <!-- 报警红框（闪烁） -->
    <rect
      v-if="isAlarm"
      class="alarm-blink"
      x="-24"
      y="-20"
      width="82"
      height="252"
      rx="10"
      fill="rgba(239,68,68,0.10)"
      stroke="#ef4444"
      stroke-width="2.5"
    />

    <!-- 单元内部机构（停止时变灰变淡） -->
    <g :class="{ 'unit-fade': isStop }">
      <!-- 机架 -->
      <path
        d="M -4 -10 L 30 -2 L 30 150 L 20 168 M -10 -2 L -12 30"
        fill="none"
        stroke="#b9bec4"
        stroke-width="3"
        stroke-linecap="round"
      />
      <!-- 烘箱风嘴（斜杠） -->
      <line
        x1="4"
        y1="50"
        x2="18"
        y2="138"
        stroke="#cfd4d9"
        stroke-width="5"
        stroke-linecap="round"
      />
      <line
        x1="12"
        y1="46"
        x2="26"
        y2="134"
        stroke="#cfd4d9"
        stroke-width="5"
        stroke-linecap="round"
      />

      <!-- 压印辊（白） -->
      <circle cx="2" cy="148" r="10.5" fill="#f5f7f9" stroke="#aeb4ba" stroke-width="2" />
      <!-- 版辊（灰） -->
      <circle cx="2" cy="176" r="15" fill="#8f959b" stroke="#6e747a" stroke-width="2" />

      <!-- 当前运行色组：版辊绿色指示球（旋转） -->
      <g v-if="showActiveMarker" transform="translate(2 176)">
        <g>
          <circle r="7.5" fill="#22c55e" stroke="#15803d" stroke-width="1.5" />
          <circle r="4.2" fill="none" stroke="#bbf7d0" stroke-width="1.6" />
          <circle cx="0" cy="-5" r="1.6" fill="#bbf7d0" />
          <animateTransform
            v-if="spinning"
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to="360 0 0"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </g>
      </g>
      <!-- 版辊旋转标记（非当前运行单元） -->
      <g v-else-if="isRun" class="roller-spin">
        <circle cx="9" cy="176" r="2.2" fill="#dfe3e8" />
        <circle cx="-5" cy="176" r="2.2" fill="#6e747a" />
      </g>

      <!-- 顶部导辊 -->
      <circle cx="0" cy="0" r="9" fill="#ffffff" stroke="#9aa0a6" stroke-width="2" />
      <g :class="{ 'roller-spin slow': isRun }">
        <circle cx="4" cy="-4" r="1.8" fill="#9aa0a6" />
      </g>

      <!-- 墨槽 -->
      <polygon
        points="-20,196 26,196 19,209 -13,209"
        :fill="unit.color"
        stroke="rgba(0,0,0,0.28)"
        stroke-width="1.5"
      />
    </g>

    <!-- 状态指示灯（右上角） -->
    <circle
      cx="46"
      cy="24"
      r="5"
      :fill="dotColor"
      stroke="#ffffff"
      stroke-width="1.5"
      :class="{ 'alarm-blink': isAlarm }"
    />

    <!-- 单元编号 -->
    <text x="2" y="230" text-anchor="middle" font-size="13" font-weight="600" fill="#cbd5e1">
      {{ unit.id }}
    </text>
  </g>
</template>
