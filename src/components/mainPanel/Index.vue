<script setup lang="ts">
import { ref } from 'vue'
import MachineOverview from './MachineOverview.vue'

const activeMainTab = ref('overview')

const mainNavItems = [
  { key: 'overview', label: '整机浏览' },
  { key: 'params', label: '准备参数' },
  { key: 'actions', label: '配方操作' }
] as const
</script>

<template>
  <main class="hmi-main">
    <nav class="main-nav">
      <button
        v-for="item in mainNavItems"
        :key="item.key"
        type="button"
        class="main-nav-item"
        :class="{ active: activeMainTab === item.key }"
        @click="activeMainTab = item.key"
      >
        {{ item.label }}
      </button>
    </nav>
    <div class="main-content">
      <MachineOverview v-if="activeMainTab === 'overview'" />
      <div v-else class="params-placeholder">准备参数</div>
    </div>
  </main>
</template>

<style scoped>
.hmi-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.main-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: calc(var(--btn-size) + 8px);
  padding: 4px 24px;
  background: rgba(13, 27, 46, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.main-nav-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--btn-size);
  min-height: var(--btn-size);
  padding: 8px 24px;
  border: none;
  border-radius: 4px;
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

.main-nav-item:hover {
  color: #cbd5e1;
}

.main-nav-item.active {
  color: #fff;
  background: rgba(24, 144, 255, 0.25);
}

.main-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.params-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #a9b8c7;
  font-size: 16px;
}
</style>
