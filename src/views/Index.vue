<script setup lang="ts">
import { onMounted, onUnmounted, provide, ref } from 'vue'
import alarmImg from '../assets/alarm.png'
import MainPanel from '../components/mainPanel/Index.vue'
import MarkLockView from '../components/markLock/MarkLockView.vue'
import { useLineSimulator } from '../composables/useLineSimulator.ts'
import { lineSimulatorKey } from '../types/index.ts'

const lineSimulator = useLineSimulator()
provide(lineSimulatorKey, lineSimulator)

const { speed, running } = lineSimulator

const activeNav = ref('main')

const navItems = [
  {
    key: 'main',
    label: '生产准备',
    icon: 'home',
  },
  {
    key: 'process',
    label: '锁定色标',
    icon: 'process',
  },
  {
    key: 'trend',
    label: '套色偏差',
    icon: 'trend',
  },
  {
    key: 'alarm',
    label: '张力设定',
    icon: 'alarm',
  },
  {
    key: 'history',
    label: '生产统计',
    icon: 'history',
  },
  {
    key: 'settings',
    label: '报警监控',
    icon: 'settings',
  },
]

const currentTime = ref('')
const batchNo = ref('20240603')
const thickness = ref('600.0')
const linkageStatus = ref('联动运行')
const markLockOpen = ref(false)

function handleNavClick(key: string) {
  activeNav.value = key
  if (key === 'process') {
    markLockOpen.value = true
  }
}

function closeMarkLock() {
  markLockOpen.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && markLockOpen.value) {
    closeMarkLock()
  }
}

function formatTime(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  currentTime.value = formatTime(new Date())
  timer = setInterval(() => {
    currentTime.value = formatTime(new Date())
  }, 1000)
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="hmi-page">
    <header class="hmi-header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-letter">R</span>
        </div>
        <div class="brand">
          <div class="brand-title">系统名称</div>
          <div class="brand-subtitle">系统描述</div>
        </div>
      </div>
      <div class="header-right">
        <div class="status-bar">
          <div class="status-item status-order">
            <span class="status-label">工单号</span>
            <span class="status-value">{{ batchNo }}</span>
          </div>

          <div class="status-divider"></div>

          <div class="status-item status-width">
            <span class="status-label">料宽</span>
            <span class="status-value-row">
              <span class="status-value">{{ thickness }}</span>
              <span class="status-unit">mm</span>
            </span>
          </div>

          <div class="status-divider"></div>

          <div class="status-item status-linkage">
            <span class="linkage-badge" :class="{ running }">
              <span class="linkage-dot"></span>
              {{ linkageStatus }}
            </span>
          </div>

          <div class="status-divider"></div>

          <div class="status-item status-speed">
            <span class="status-label">车速度</span>
            <span class="speed-row">
              <span class="speed-value">{{ speed.toFixed(0) }}</span>
              <span class="speed-unit">m/min</span>
            </span>
            <span
              class="status-lamp"
              :class="{ 'is-running': running }"
              :title="running ? '设备运行中' : '设备已停止'"
            >
              <img class="alarm-icon" :src="alarmImg" alt="设备状态" />
            </span>
          </div>
        </div>
      </div>
      <div class="header-user">
        <div class="user-info">
          <svg
            class="user-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          <span class="user-name">Engineer</span>
          <svg
            class="arrow-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        <time class="datetime">{{ currentTime }}</time>
      </div>
    </header>

    <!-- 主体模块 -->
    <MainPanel />

    <nav class="hmi-nav">
      <button
        v-for="item in navItems"
        :key="item.key"
        type="button"
        class="nav-item"
        :class="{ active: activeNav === item.key }"
        @click="handleNavClick(item.key)"
      >
        <svg
          v-if="item.icon === 'home'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" />
        </svg>
        <svg
          v-else-if="item.icon === 'process'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <rect x="3" y="3" width="6" height="6" rx="1" />
          <rect x="15" y="3" width="6" height="6" rx="1" />
          <rect x="9" y="15" width="6" height="6" rx="1" />
          <path d="M6 9v3h12V9M12 12v3" />
        </svg>
        <svg
          v-else-if="item.icon === 'trend'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path d="M3 17l6-6 4 4 8-10" />
          <path d="M17 5h4v4" />
        </svg>
        <svg
          v-else-if="item.icon === 'alarm'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path
            d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
        <svg
          v-else-if="item.icon === 'history'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path d="M8 6h13M8 12h13M8 18h13" />
          <path d="M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
        <svg
          v-else-if="item.icon === 'settings'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <circle cx="12" cy="12" r="3" />
          <path
            d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          />
        </svg>
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <Teleport to="body">
      <div v-if="markLockOpen" class="mark-lock-overlay" @click.self="closeMarkLock">
        <div class="mark-lock-modal" role="dialog" aria-modal="true" aria-label="锁定色标">
          <div class="mark-lock-body">
            <MarkLockView @close="closeMarkLock" />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.hmi-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0a1628;
  /* background: #162232; */
  color: #fff;
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

.hmi-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: 56px;
  padding: 6px 24px;
  background: #0d1117;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-self: start;
}

.logo {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(24, 144, 255, 0.5);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(24, 144, 255, 0.08);
}

.logo-letter {
  font-size: 18px;
  font-weight: 700;
  color: #1890ff;
}

.brand-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 10px;
  color: #a9b8c7;
  letter-spacing: 0.3px;
  margin-top: 2px;
}

.header-title {
  margin: 0;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 2px;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: center;
  justify-self: center;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-self: end;
  flex-shrink: 0;
}

.status-bar {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 8px;
  flex-shrink: 0;
}

.status-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 0 28px;
  height: 100%;
}

.status-order {
  min-width: 110px;
}

.status-width {
  min-width: 110px;
}

.status-label {
  font-size: 16px;
  line-height: 1;
  color: #a9b8c7;
  white-space: nowrap;
}

.status-value {
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.5px;
}

.status-value-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.status-unit {
  font-size: 11px;
  line-height: 1;
  color: #a9b8c7;
}

.status-divider {
  width: 1px;
  height: 32px;
  background: rgba(100, 116, 139, 0.35);
  flex-shrink: 0;
}

.status-linkage {
  justify-content: center;
  padding: 0 28px;
  min-width: 130px;
}

.linkage-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 22px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  color: #a9b8c7;
  background: rgba(100, 116, 139, 0.15);
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.linkage-badge.running {
  color: #34d399;
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(52, 211, 153, 0.45);
}

.linkage-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #a9b8c7;
  flex-shrink: 0;
}

.linkage-badge.running .linkage-dot {
  background: #34d399;
  box-shadow: 0 0 6px rgba(52, 211, 153, 0.8);
}

.status-speed {
  flex-direction: row;
  align-items: center;
  gap: 14px;
  padding: 0 28px 0 28px;
  min-width: 160px;
}

.status-speed .status-label {
  align-self: center;
  min-width: 40px;
}

.speed-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.speed-value {
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
  color: #22d3ee;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 8px rgba(34, 211, 238, 0.6);
}

.speed-unit {
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  color: #22d3ee;
}

.status-lamp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  flex-shrink: 0;
}

.status-lamp:not(.is-running) .alarm-icon {
  opacity: 0.45;
  filter: grayscale(1);
}

.status-lamp.is-running {
  animation: lamp-blink 1s ease-in-out infinite;
}

@keyframes lamp-blink {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
    filter: drop-shadow(0 0 8px #ef4444) drop-shadow(0 0 18px #ef4444);
  }

  50% {
    opacity: 0.35;
    transform: scale(0.94);
    filter: drop-shadow(0 0 0 transparent);
  }
}

.alarm-icon {
  width: 66px;
  height: 66px;
  flex-shrink: 0;
  object-fit: contain;
  display: block;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--btn-size);
  height: var(--btn-size);
  padding: 0;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
}

.icon-btn svg {
  width: 22px;
  height: 22px;
}

.icon-btn:hover {
  color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #cbd5e1;
  font-size: 18px;
  cursor: pointer;
}

.user-icon {
  width: 18px;
  height: 18px;
}

.arrow-icon {
  width: 14px;
  height: 14px;
  color: #a9b8c7;
}

.datetime {
  font-size: 18px;
  color: #94a3b8;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.hmi-nav {
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: calc(var(--btn-size) + 16px);
  padding: 8px 24px;
  background: rgba(13, 27, 46, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: var(--btn-size);
  min-height: var(--btn-size);
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #a9b8c7;
  font-size: 20px;
  font-family: inherit;
  cursor: pointer;
  transition:
    color 0.2s,
    background 0.2s;
  white-space: nowrap;
}

.nav-item svg {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
}

.nav-item:hover {
  color: #cbd5e1;
}

.nav-item.active {
  color: #fff;
  background: rgba(24, 144, 255, 0.25);
}

.mark-lock-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
}

.mark-lock-modal {
  display: flex;
  flex-direction: column;
  width: 80%;
  height: 90%;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(13, 27, 46, 0.98) 0%, rgba(10, 22, 40, 0.99) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45);
}

.mark-lock-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
</style>
