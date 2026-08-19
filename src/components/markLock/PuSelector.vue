<script setup lang="ts">
defineProps<{
  /** 可选单元号列表，如 [2..10] */
  units: number[]
  /** 当前选中单元号 */
  selected: number
}>()

defineEmits<{
  select: [unit: number]
}>()
</script>

<template>
  <div class="pu-selector">
    <div v-for="u in units" :key="u" class="pu-item">
      <!-- 标记检测小图标 -->
      <svg viewBox="0 0 20 22" class="pu-icon">
        <path d="M10 2 L13 8 L7 8 Z" fill="#e11d48" />
        <circle cx="5" cy="6" r="1.6" fill="#facc15" />
        <circle cx="15" cy="6" r="1.6" fill="#facc15" />
        <path d="M6 11 L14 11 L12 20 L8 20 Z" fill="#c9ced4" stroke="#6b7280" stroke-width="1" />
      </svg>
      <button class="pu-btn" :class="{ active: u === selected }" @click="$emit('select', u)">
        PU{{ u }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.pu-selector {
  display: flex;
  gap: 10px;
  padding-left: 78px;
}
.pu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  width: 68px;
}
.pu-icon {
  width: 20px;
  height: 22px;
}
.pu-btn {
  width: 68px;
  min-width: var(--btn-size);
  min-height: var(--btn-size);
  border: 1px solid rgba(100, 116, 139, 0.4);
  background: rgba(15, 23, 42, 0.75);
  color: #94a3b8;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  border-radius: 5px;
  padding: 5px 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.pu-btn:hover {
  border-color: rgba(24, 144, 255, 0.45);
  color: #cbd5e1;
}
.pu-btn.active {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(245, 158, 11, 0.65);
  color: #fbbf24;
}
</style>
