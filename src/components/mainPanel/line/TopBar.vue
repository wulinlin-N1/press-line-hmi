<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ToggleAction } from '../../../types'

const props = withDefaults(
  defineProps<{
    running?: boolean
    alarmCount?: number
    stopCount?: number
  }>(),
  { running: true, alarmCount: 0, stopCount: 0 },
)

const emit = defineEmits<{
  toggle: []
}>()

const showConfirm = ref(false)
const pendingAction = ref<ToggleAction | null>(null)

const confirmContent = computed(() => {
  if (pendingAction.value === 'stop') {
    return {
      title: '确认停机',
      message: '确定要停止整机运行吗？停机后所有色组将停止走料。',
      confirmLabel: '确认停机',
      confirmClass: 'confirm-stop',
    }
  }
  return {
    title: '确认开机',
    message: '确定要启动整机运行吗？开机后各色组将恢复走料。',
    confirmLabel: '确认开机',
    confirmClass: 'confirm-start',
  }
})

function onToggleClick() {
  pendingAction.value = props.running ? 'stop' : 'start'
  showConfirm.value = true
}

function confirmAction() {
  showConfirm.value = false
  pendingAction.value = null
  emit('toggle')
}

function cancelAction() {
  showConfirm.value = false
  pendingAction.value = null
}
</script>

<template>
  <header class="top-bar">
    <div class="tb-title">
      <h1>整机状态浏览</h1>
      <p>印刷生产线 · 整线走料示意图</p>
    </div>

    <div class="tb-right">
      <!-- 状态图例 -->
      <div class="tb-legend">
        <span class="chip"><i class="dot run"></i>运行</span>
        <span class="chip"><i class="dot stop"></i>停止 ×{{ stopCount }}</span>
        <span class="chip" :class="{ 'chip-alarm': alarmCount > 0 }">
          <i class="dot alarm" :class="{ 'alarm-blink': alarmCount > 0 }"></i>报警 ×{{ alarmCount }}
        </span>
      </div>

      <!-- 开机 / 停机 -->
      <button class="tb-btn" :class="{ off: !running }" @click="onToggleClick">
        {{ running ? '停机' : '开机' }}
      </button>

      <span class="tb-note">模拟数据 · 1s 刷新</span>
    </div>
  </header>

  <Teleport to="body">
    <div v-if="showConfirm" class="stop-confirm-overlay" @click.self="cancelAction">
      <div
        class="stop-confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="toggle-confirm-title"
      >
        <h2 id="toggle-confirm-title" class="stop-confirm-title">{{ confirmContent.title }}</h2>
        <p class="stop-confirm-message">{{ confirmContent.message }}</p>
        <div class="stop-confirm-actions">
          <button type="button" class="stop-confirm-btn cancel" @click="cancelAction">取消</button>
          <button
            type="button"
            class="stop-confirm-btn confirm"
            :class="confirmContent.confirmClass"
            @click="confirmAction"
          >
            {{ confirmContent.confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 14px 20px;
}
.tb-title h1 {
  margin: 0;
  font-size: 18px;
}
.tb-title p {
  margin: 2px 0 0;
  font-size: 16px;
  color: #6b7280;
}

.tb-right {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.tb-legend {
  display: flex;
  gap: 10px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 16px;
  color: #4b5563;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 3px 10px;
}
.chip-alarm {
  background: #fef2f2;
  color: #b91c1c;
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
}
.dot.run {
  background: #22c55e;
}
.dot.stop {
  background: #9ca3af;
}
.dot.alarm {
  background: #ef4444;
}

.tb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--btn-size);
  min-height: var(--btn-size);
  border: none;
  border-radius: 10px;
  padding: 8px 18px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: #ef4444;
  cursor: pointer;
  transition: filter 0.15s;
}
.tb-btn:hover {
  filter: brightness(1.08);
}
.tb-btn.off {
  background: #22c55e;
}

.tb-note {
  font-size: 11px;
  color: #9ca3af;
}

.stop-confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
}

.stop-confirm-dialog {
  width: min(420px, calc(100vw - 32px));
  padding: 24px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.25);
}

.stop-confirm-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.stop-confirm-message {
  margin: 12px 0 0;
  font-size: 15px;
  line-height: 1.6;
  color: #4b5563;
}

.stop-confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.stop-confirm-btn {
  min-width: var(--btn-size);
  min-height: var(--btn-size);
  padding: 8px 18px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: filter 0.15s;
}

.stop-confirm-btn:hover {
  filter: brightness(1.05);
}

.stop-confirm-btn.cancel {
  background: #f3f4f6;
  color: #374151;
}

.stop-confirm-btn.confirm-stop {
  background: #ef4444;
  color: #fff;
}

.stop-confirm-btn.confirm-start {
  background: #22c55e;
  color: #fff;
}
</style>
