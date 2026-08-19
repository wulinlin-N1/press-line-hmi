<script setup lang="ts">
import { computed, useId } from 'vue'
import type { MarkRole } from '../../types'

const markGradId = useId()

const props = withDefaults(
  defineProps<{
    /** 当前选中的印刷单元（本色） */
    current: number
    /** 首色标记编号（基准，固定为 1） */
    first?: number
  }>(),
  { first: 1 },
)

const emit = defineEmits<{
  select: [unit: number]
  clear: []
}>()

/** 前色 = 当前单元的上一个单元 */
const prev = computed(() => props.current - 1)

const roleOf = (i: number): MarkRole =>
  i === props.first ? 'first' : i === prev.value ? 'prev' : i === props.current ? 'current' : ''

function onItemClick(i: number) {
  emit('clear')
  if (i > 1) emit('select', i)
}
</script>

<template>
  <div class="mark-row">
    <svg class="mark-defs" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient :id="markGradId" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#e5e7eb" />
          <stop offset="100%" stop-color="#9ca3af" />
        </linearGradient>
      </defs>
    </svg>
    <div v-for="i in 10" :key="i" class="mark-item" :class="roleOf(i)" @click="onItemClick(i)">
      <span class="mark-num">{{ i }}</span>
      <span class="mark-box">
        <svg viewBox="0 0 24 30" class="mark-shape">
          <path
            d="M4 3 L20 3 L15 27 L9 27 Z"
            :fill="`url(#${markGradId})`"
            stroke="#6b7280"
            stroke-width="1.2"
          />
        </svg>
      </span>
      <title v-if="roleOf(i) === 'first'">首色（基准）</title>
      <title v-else-if="roleOf(i) === 'prev'">前色</title>
      <title v-else-if="roleOf(i) === 'current'">本色（当前单元）</title>
    </div>
  </div>
</template>

<style scoped>
.mark-row {
  position: relative;
  display: flex;
  gap: 10px;
}
.mark-defs {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}
.mark-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  width: 68px;
}
.mark-num {
  font-size: 13px;
  font-weight: 700;
  color: #cbd5e1;
}
.mark-box {
  display: block;
  padding: 2px;
  border: 2px solid transparent;
  border-radius: 3px;
}
.mark-shape {
  width: 24px;
  height: 30px;
  display: block;
}

.mark-item.first .mark-box {
  border-color: #22c55e;
}
.mark-item.prev .mark-box {
  border-color: #e11d48;
}
.mark-item.current .mark-box {
  border-color: #22d3ee;
}
.mark-item.current .mark-num {
  color: #22d3ee;
}
</style>
