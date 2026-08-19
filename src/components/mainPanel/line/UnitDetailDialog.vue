<script setup lang="ts">
import { computed } from 'vue'
import { INK_NAMES } from '../../../composables/useLineSimulator'
import type { PrintUnit, UnitStatus } from '../../../types'

const props = withDefaults(
  defineProps<{
    unit?: PrintUnit | null
    /** 套色偏差 mm，1 号色组为 null */
    deviation?: number | null
    activeUnitId?: number | null
    running?: boolean
    speed?: number
  }>(),
  { unit: null, deviation: null, activeUnitId: null, running: false, speed: 0 },
)

defineEmits<{
  close: []
}>()

interface DetailRow {
  label: string
  value: string
  type?: 'status' | 'ink'
  highlight?: boolean
}

const statusMetaMap: Record<UnitStatus, { label: string; color: string }> = {
  run: { label: '运行', color: '#22c55e' },
  stop: { label: '停止', color: '#9ca3af' },
  alarm: { label: '报警', color: '#ef4444' },
}

const statusMeta = computed(() => {
  if (!props.unit) return null
  return statusMetaMap[props.unit.status]
})

const inkName = computed(() => {
  if (!props.unit) return ''
  return INK_NAMES[props.unit.id - 1] ?? '—'
})

const detailRows = computed((): DetailRow[] => {
  if (!props.unit || !statusMeta.value) return []

  const rows: DetailRow[] = [
    { label: '运行状态', value: statusMeta.value.label, type: 'status' },
    { label: '油墨颜色', value: inkName.value, type: 'ink' },
    { label: '当前车速', value: `${props.speed.toFixed(0)} m/min` },
    { label: '版辊周长', value: `${(520 + props.unit.id * 2.5).toFixed(1)} mm` },
    { label: '刮刀压力', value: `${(1.1 + props.unit.id * 0.04).toFixed(2)} bar` },
    { label: '烘箱温度', value: `${42 + props.unit.id * 2} °C` },
  ]

  if (props.deviation != null) {
    const sign = props.deviation > 0 ? '+' : ''
    rows.splice(2, 0, {
      label: '套色偏差',
      value: `${sign}${props.deviation.toFixed(1)} mm`,
      highlight: Math.abs(props.deviation) >= 2,
    })
  } else {
    rows.splice(2, 0, { label: '套色偏差', value: '基准色组' })
  }

  return rows
})

const badges = computed(() => {
  if (!props.unit) return []
  const list = []
  if (props.unit.id === props.activeUnitId && props.unit.status === 'run') {
    list.push({ label: '当前运行色组', type: 'run' })
    list.push({ label: '当前套色色组', type: 'register' })
  }
  return list
})
</script>

<template>
  <Teleport to="body">
    <div v-if="unit" class="unit-detail-overlay" @click.self="$emit('close')">
      <div
        class="unit-detail-dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`unit-detail-title-${unit.id}`"
      >
        <header class="unit-detail-header">
          <div class="unit-detail-title-row">
            <span class="unit-color-chip" :style="{ background: unit.color }"></span>
            <h2 :id="`unit-detail-title-${unit.id}`">{{ unit.id }} 号色组详情</h2>
          </div>
          <button type="button" class="unit-detail-close" aria-label="关闭" @click="$emit('close')">
            ×
          </button>
        </header>

        <div v-if="badges.length" class="unit-detail-badges">
          <span v-for="badge in badges" :key="badge.label" class="unit-badge" :class="badge.type">
            {{ badge.label }}
          </span>
        </div>

        <dl class="unit-detail-grid">
          <div v-for="row in detailRows" :key="row.label" class="detail-row">
            <dt>{{ row.label }}</dt>
            <dd
              :class="{
                highlight: row.highlight,
                ink: row.type === 'ink',
                status: row.type === 'status',
              }"
            >
              <template v-if="row.type === 'status' && statusMeta">
                <i class="status-dot" :style="{ background: statusMeta.color }"></i>
                {{ row.value }}
              </template>
              <template v-else-if="row.type === 'ink'">
                <span class="ink-swatch" :style="{ background: unit.color }"></span>
                {{ row.value }}
              </template>
              <template v-else>{{ row.value }}</template>
            </dd>
          </div>
        </dl>

        <footer class="unit-detail-footer">
          <button type="button" class="unit-detail-btn" @click="$emit('close')">关闭</button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.unit-detail-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
}

.unit-detail-dialog {
  width: min(480px, calc(100vw - 32px));
  padding: 22px 24px 20px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(13, 27, 46, 0.98) 0%, rgba(10, 22, 40, 0.98) 100%);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.45);
  color: #e2e8f0;
}

.unit-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.unit-detail-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.unit-color-chip {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.unit-detail-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.unit-detail-close {
  min-width: 36px;
  min-height: 36px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: #94a3b8;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.unit-detail-close:hover {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.1);
}

.unit-detail-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.unit-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.unit-badge.run {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.35);
}

.unit-badge.register {
  background: rgba(34, 211, 238, 0.12);
  color: #22d3ee;
  border: 1px solid rgba(34, 211, 238, 0.35);
}

.unit-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 20px;
  margin: 18px 0 0;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-row dt {
  font-size: 13px;
  color: #94a3b8;
}

.detail-row dd {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-row dd.highlight {
  color: #fb923c;
}

.detail-row dd.status .status-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.ink-swatch {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.unit-detail-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.unit-detail-btn {
  min-width: var(--btn-size);
  min-height: var(--btn-size);
  padding: 8px 22px;
  border: 1px solid rgba(34, 211, 238, 0.45);
  border-radius: 8px;
  background: rgba(34, 211, 238, 0.12);
  color: #22d3ee;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}

.unit-detail-btn:hover {
  background: rgba(34, 211, 238, 0.2);
}
</style>
