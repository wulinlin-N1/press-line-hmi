<script setup lang="ts">
import type { ColorTableValues } from '../../types'

defineProps<{
  /** { long: [本色, 前色, 首色], trans: [本色, 前色, 首色] } */
  values: ColorTableValues
}>()
</script>

<template>
  <table class="color-table">
    <thead>
      <tr>
        <th>色标</th>
        <th class="c-current">本色</th>
        <th class="c-prev">前色</th>
        <th class="c-first">首色</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>纵向</td>
        <td>{{ values.long[0] }}</td>
        <td>{{ values.long[1] }}</td>
        <td>{{ values.long[2] }}</td>
      </tr>
      <tr>
        <td>横向</td>
        <td>{{ values.trans[0] }}</td>
        <td>{{ values.trans[1] }}</td>
        <td>{{ values.trans[2] }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.color-table {
  border-collapse: collapse;
  font-size: 13px;
  color: #e2e8f0;
  font-variant-numeric: tabular-nums;
}
.color-table th,
.color-table td {
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 4px 14px;
  text-align: center;
  min-width: 52px;
}
.color-table th {
  background: rgba(13, 27, 46, 0.85);
  font-weight: 600;
  color: #94a3b8;
}
.color-table td {
  background: rgba(10, 22, 40, 0.6);
}
.c-current {
  border-bottom: 3px solid #22d3ee;
}
.c-prev {
  border-bottom: 3px solid #e11d48;
}
.c-first {
  border-bottom: 3px solid #22c55e;
}
</style>
