<script setup lang="ts">
import { computed } from 'vue'
import type { WinderType } from '../../../types'

const props = withDefaults(
  defineProps<{
    /** unwind = 放卷（左）；rewind = 收卷（右，内部机构水平镜像） */
    type?: WinderType
    /** 张力值（模拟数据驱动） */
    tension?: number
    /** 是否运行（辊筒标记旋转） */
    running?: boolean
  }>(),
  { type: 'unwind', tension: 0, running: true },
)

const SLOT_W = 130
const ROLL_A_R = 21
const ROLL_B_R = 16.5
const ROLL_CX = 56
const ROLL_A_CY = 168
const ROLL_B_CY = ROLL_A_CY + ROLL_A_R + ROLL_B_R
/** 光电传感器：B 辊外侧水平走料段上（镜像后左右对称） */
const SENSOR_CX = ROLL_CX + ROLL_B_R + 18
const SENSOR_SHELF_Y = ROLL_B_CY + 10
const TENSION_BOX_W = 46
const TENSION_BOX_H = 22
const TENSION_CX = 43
const TENSION_BOX_Y = 128

const isRewind = computed(() => props.type === 'rewind')

/** 内部机构镜像（仅图形，不含文字） */
const flip = computed(() => (isRewind.value ? `translate(${SLOT_W} 0) scale(-1 1)` : ''))

/** 文字中心坐标（镜像后保持文字正向） */
const tx = (x: number) => (isRewind.value ? SLOT_W - x : x)

const tensionBoxX = computed(() => tx(TENSION_CX) - TENSION_BOX_W / 2)

const label = computed(() => (isRewind.value ? '收卷' : '放卷'))
const tensionText = computed(() => props.tension.toFixed(1))
</script>

<template>
  <g>
    <defs>
      <radialGradient :id="`rollA-${type}`" cx="35%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#64b5f6" />
        <stop offset="100%" stop-color="#1976d2" />
      </radialGradient>
      <radialGradient :id="`rollB-${type}`" cx="35%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#c3c9cf" />
        <stop offset="100%" stop-color="#757c83" />
      </radialGradient>
    </defs>

    <!-- 内部机构（收卷时镜像） -->
    <g :transform="flip">
      <!-- A 辊（工作辊，上） -->
      <g :transform="`translate(${ROLL_CX} ${ROLL_A_CY})`">
        <circle :r="ROLL_A_R" :fill="`url(#rollA-${type})`" stroke="#1565c0" stroke-width="2" />
        <g>
          <circle cx="0" cy="-12" r="2.6" fill="rgba(255,255,255,0.85)" />
          <animateTransform
            v-if="running"
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to="360 0 0"
            dur="3.6s"
            repeatCount="indefinite"
          />
        </g>
      </g>

      <!-- B 辊（备辊，下，与 A 贴合） -->
      <g :transform="`translate(${ROLL_CX} ${ROLL_B_CY})`">
        <circle :r="ROLL_B_R" :fill="`url(#rollB-${type})`" stroke="#5f666d" stroke-width="2" />
      </g>

      <!-- 光电传感器（紫点，B 辊外侧水平走料段） -->
      <rect
        :x="SENSOR_CX - 14"
        :y="SENSOR_SHELF_Y + 3"
        width="28"
        height="3"
        rx="1"
        fill="#9aa0a6"
      />
      <circle :cx="SENSOR_CX" :cy="SENSOR_SHELF_Y" r="4.5" fill="#8e24aa" />

      <!-- 底座 -->
      <rect
        :x="ROLL_CX - 4"
        :y="ROLL_B_CY + ROLL_B_R + 6"
        width="26"
        height="4"
        rx="1"
        fill="#9aa0a6"
      />

      <!-- 摆辊（青色靶心） -->
      <g transform="translate(66 30)">
        <circle r="11" fill="#22c3d6" stroke="#0e7c86" stroke-width="2" />
        <circle r="6" fill="none" stroke="#e6fffb" stroke-width="2" />
        <circle r="2.2" fill="#e6fffb" />
        <g>
          <circle cx="7" cy="0" r="1.8" fill="#0e7c86" />
          <animateTransform
            v-if="running"
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to="360 0 0"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </g>
      </g>

      <!-- 小导辊 + 接料台 -->
      <circle cx="98" cy="44" r="5.5" fill="#c9ced4" stroke="#9aa0a6" stroke-width="1.5" />
      <circle cx="112" cy="52" r="4.5" fill="#c9ced4" stroke="#9aa0a6" stroke-width="1.5" />
      <rect x="84" y="56" width="42" height="6" rx="1.5" fill="#a8aeb4" />
      <rect x="84" y="62" width="42" height="2" rx="1" fill="#7d848a" />
    </g>

    <!-- 文字（不随机构镜像） -->
    <rect
      :x="tensionBoxX"
      :y="TENSION_BOX_Y"
      :width="TENSION_BOX_W"
      :height="TENSION_BOX_H"
      rx="3"
      fill="none"
      stroke="rgba(255, 255, 255, 0.25)"
      stroke-width="1.5"
    />
    <text
      :x="tx(TENSION_CX)"
      y="144"
      text-anchor="middle"
      font-size="13"
      font-weight="700"
      fill="#e2e8f0"
    >
      {{ tensionText }}
    </text>
    <text
      :x="tx(ROLL_CX)"
      :y="ROLL_A_CY + 5"
      text-anchor="middle"
      font-size="16"
      font-weight="700"
      fill="#ffffff"
      >A</text
    >
    <text
      :x="tx(ROLL_CX)"
      :y="ROLL_B_CY + 5"
      text-anchor="middle"
      font-size="14"
      font-weight="700"
      fill="#ffffff"
      >B</text
    >
    <text
      :x="tx(ROLL_CX)"
      :y="ROLL_B_CY + ROLL_B_R + 36"
      text-anchor="middle"
      font-size="14"
      fill="#94a3b8"
      >{{ label }}</text
    >
  </g>
</template>
