<script setup lang="ts">
withDefaults(
  defineProps<{
    /** 偏差显示（mm） */
    deviation?: string
    windowPos?: number
    rollerFine?: number
    curveDrag?: number
  }>(),
  { deviation: '0.00', windowPos: 0, rollerFine: 0, curveDrag: 0 },
)

const emit = defineEmits<{
  'adjust-window': [delta: number]
  'adjust-roller': [delta: number]
  'nudge-window': [delta: number]
}>()
</script>

<template>
  <div class="controls">
    <!-- 中部：大箭头 + 功能按钮 + 偏差显示 -->
    <div class="mid-row">
      <button class="arrow-btn" title="窗口左移" @click="emit('nudge-window', -50)">
        <svg viewBox="0 0 24 24"><path d="M15 4 L6 12 L15 20 Z" fill="#3b82f6" /></svg>
      </button>
      <button class="func-btn" title="波形">
        <svg viewBox="0 0 24 24">
          <path d="M3 14 Q6 6 9 14 T15 14 T21 14" fill="none" stroke="#e11d48" stroke-width="2" />
          <path
            d="M3 18 Q6 12 9 18 T15 18 T21 18"
            fill="none"
            stroke="#e11d48"
            stroke-width="1.4"
          />
        </svg>
      </button>
      <button class="func-btn" title="光源">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="10" r="5" fill="none" stroke="#eab308" stroke-width="2" />
          <path d="M12 17 L12 21 M9 21 L15 21" stroke="#eab308" stroke-width="2" />
        </svg>
      </button>
      <span class="deviation">
        <b>{{ deviation }}</b> mm
      </span>
      <button class="arrow-btn" title="窗口右移" @click="emit('nudge-window', 50)">
        <svg viewBox="0 0 24 24"><path d="M9 4 L18 12 L9 20 Z" fill="#3b82f6" /></svg>
      </button>
    </div>

    <!-- 底部三组调节 -->
    <div class="group-row">
      <div class="ctl-group">
        <span class="ctl-label">窗口位置</span>
        <div class="ctl-body">
          <button class="chev-btn" @click="emit('adjust-window', -1)">
            <svg viewBox="0 0 24 24"><path d="M14 5 L7 12 L14 19 Z" fill="#3b82f6" /></svg>
          </button>
          <span class="ctl-value">{{ windowPos }}</span>
          <button class="chev-btn" @click="emit('adjust-window', 1)">
            <svg viewBox="0 0 24 24"><path d="M10 5 L17 12 L10 19 Z" fill="#3b82f6" /></svg>
          </button>
        </div>
      </div>

      <div class="ctl-group">
        <span class="ctl-label">版辊微调</span>
        <div class="ctl-body">
          <button class="chev-btn" @click="emit('adjust-roller', -0.1)">
            <svg viewBox="0 0 24 24"><path d="M14 5 L7 12 L14 19 Z" fill="#3b82f6" /></svg>
          </button>
          <span class="ctl-value">{{ rollerFine.toFixed(1) }}</span>
          <button class="chev-btn" @click="emit('adjust-roller', 0.1)">
            <svg viewBox="0 0 24 24"><path d="M10 5 L17 12 L10 19 Z" fill="#3b82f6" /></svg>
          </button>
        </div>
      </div>

      <div class="ctl-group">
        <span class="ctl-label">曲线拖动</span>
        <div class="ctl-body">
          <button class="text-btn">测量</button>
          <span class="ctl-value">{{ curveDrag }} <small>mm</small></span>
          <button class="text-btn">移动</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mid-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.arrow-btn {
  width: var(--btn-size);
  height: var(--btn-size);
  border: 1px solid rgba(100, 116, 139, 0.4);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.75);
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
}
.arrow-btn:hover {
  border-color: rgba(24, 144, 255, 0.45);
  background: rgba(24, 144, 255, 0.12);
}
.arrow-btn svg {
  width: 26px;
  height: 26px;
}
.func-btn {
  width: var(--btn-size);
  height: var(--btn-size);
  border: 1px solid rgba(100, 116, 139, 0.4);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.75);
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
}
.func-btn:hover {
  border-color: rgba(24, 144, 255, 0.45);
  background: rgba(24, 144, 255, 0.12);
}
.func-btn svg {
  width: 24px;
  height: 24px;
}
.deviation {
  font-size: 15px;
  color: #e2e8f0;
  background: rgba(13, 27, 46, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 6px 12px;
  font-variant-numeric: tabular-nums;
}
.deviation b {
  font-size: 17px;
  color: #22d3ee;
}

.group-row {
  display: flex;
  gap: 40px;
}
.ctl-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.ctl-label {
  font-size: 16px;
  color: #e2e8f0;
  text-align: center;
}
.ctl-body {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 5px 8px;
  background: rgba(13, 27, 46, 0.85);
}
.chev-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--btn-size);
  height: var(--btn-size);
  min-width: var(--btn-size);
  min-height: var(--btn-size);
  padding: 0;
  border: 1px solid rgba(100, 116, 139, 0.4);
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.75);
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
}
.chev-btn:hover {
  border-color: rgba(24, 144, 255, 0.45);
  background: rgba(24, 144, 255, 0.12);
}
.chev-btn svg {
  width: 32px;
  height: 32px;
}
.ctl-value {
  min-width: 48px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  font-variant-numeric: tabular-nums;
}
.ctl-value small {
  font-size: 11px;
  color: #cbd5e1;
  font-weight: 400;
}
.text-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--btn-size);
  min-height: var(--btn-size);
  border: 1px solid rgba(100, 116, 139, 0.4);
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.75);
  font-size: 16px;
  font-family: inherit;
  color: #e2e8f0;
  padding: 6px 12px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s,
    background 0.2s;
}
.text-btn:hover {
  border-color: rgba(24, 144, 255, 0.45);
  color: #cbd5e1;
  background: rgba(24, 144, 255, 0.12);
}
</style>
