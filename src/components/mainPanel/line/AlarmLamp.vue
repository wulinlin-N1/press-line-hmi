<script setup lang="ts">
withDefaults(
  defineProps<{
    /** 是否存在报警（灯变红并闪烁） */
    alarm?: boolean
  }>(),
  { alarm: false },
)
</script>

<template>
  <svg viewBox="0 0 70 54" class="alarm-lamp" role="img" aria-label="报警灯">
    <rect
      x="2"
      y="2"
      width="66"
      height="50"
      rx="8"
      fill="#f8fafc"
      stroke="#d97706"
      stroke-width="3"
    />
    <rect
      x="12"
      y="11"
      width="46"
      height="32"
      rx="6"
      :fill="alarm ? '#ef4444' : '#fbbf24'"
      :class="{ 'alarm-blink': alarm }"
    />
    <ellipse cx="26" cy="19" rx="9" ry="4.5" fill="rgba(255,255,255,0.45)" />
    <title>{{ alarm ? '存在报警' : '无报警' }}</title>
  </svg>
</template>

<style scoped>
.alarm-lamp {
  width: 70px;
  height: 54px;
  display: block;
}
</style>
