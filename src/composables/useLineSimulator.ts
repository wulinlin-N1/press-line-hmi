import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import type { PrintUnit, UnitStatus } from '../types'

/** 10 个色组的油墨颜色 */
export const INK_COLORS = [
  '#8fd3e8', // 1 浅青
  '#2b2f33', // 2 黑
  '#2f5fe3', // 3 蓝
  '#3a3f44', // 4 黑
  '#8e1b2f', // 5 深红
  '#c6d42e', // 6 黄绿
  '#9fd9e8', // 7 浅蓝
  '#9aa0a6', // 8 灰
  '#8e44ad', // 9 紫
  '#e08bb8', // 10 品红
] as const

/** 各色组油墨名称 */
export const INK_NAMES = ['浅青', '黑', '蓝', '黑', '深红', '黄绿', '浅蓝', '灰', '紫', '品红'] as const

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const round1 = (n: number) => Math.round(n * 10) / 10

function nextStatus(status: UnitStatus): UnitStatus {
  if (status === 'run') return 'stop'
  if (status === 'stop') return 'alarm'
  return 'run'
}

/**
 * 整机模拟数据源：车速 / 各单元状态 / 放收卷张力 / 套色偏差
 * 每 1s 定时刷新，供界面绑定
 */
export function useLineSimulator() {
  const running = ref(true)
  const speed = ref(0)
  const targetSpeed = ref(24)

  const units = reactive<PrintUnit[]>(
    Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      color: INK_COLORS[i],
      status: 'run' as UnitStatus,
    })),
  )

  const tensions = reactive({ unwind: 0, rewind: 0 })
  const activeUnitId = ref<number | null>(1)
  const deviations = reactive([-0.6, -1.7, 2.2, 2.8, -0.6, -1.1, 0.6, -1.2, -0.8])

  units[1].status = 'stop'
  units[4].status = 'alarm'
  activeUnitId.value = 3

  const alarmCount = computed(() => units.filter((u) => u.status === 'alarm').length)
  const stopCount = computed(() => units.filter((u) => u.status === 'stop').length)

  let timer: ReturnType<typeof setInterval> | null = null

  function tick() {
    const goal = running.value ? targetSpeed.value : 0
    speed.value = Math.max(0, round1(speed.value + (goal - speed.value) * 0.25 + rand(-2.5, 2.5)))
    if (!running.value && speed.value < 0.4) speed.value = 0

    if (running.value) {
      tensions.unwind = round1(rand(16, 24))
      tensions.rewind = round1(rand(20, 28))
      if (Math.random() < 0.3) {
        const u = units[Math.floor(Math.random() * units.length)]
        const r = Math.random()
        u.status = r < 0.72 ? 'run' : r < 0.88 ? 'stop' : 'alarm'
      }
      const alarms = units.filter((u) => u.status === 'alarm')
      alarms.slice(2).forEach((u) => {
        u.status = 'run'
      })

      const runningUnits = units.filter((u) => u.status === 'run')
      if (runningUnits.length) {
        if (!runningUnits.some((u) => u.id === activeUnitId.value)) {
          activeUnitId.value = runningUnits[0].id
        } else if (Math.random() < 0.18) {
          const idx = runningUnits.findIndex((u) => u.id === activeUnitId.value)
          activeUnitId.value = runningUnits[(idx + 1) % runningUnits.length].id
        }
      } else {
        activeUnitId.value = null
      }
    } else {
      activeUnitId.value = null
    }
  }

  function cycleStatus(unit: PrintUnit) {
    unit.status = nextStatus(unit.status)
    if (unit.status === 'run' && running.value) {
      activeUnitId.value = unit.id
    }
  }

  function toggleRunning() {
    running.value = !running.value
    if (running.value) {
      units.forEach((u) => {
        u.status = 'run'
      })
      activeUnitId.value = 1
    } else {
      activeUnitId.value = null
    }
  }

  onMounted(() => {
    tick()
    timer = setInterval(tick, 1000)
  })
  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return {
    running,
    speed,
    targetSpeed,
    units,
    tensions,
    deviations,
    alarmCount,
    stopCount,
    activeUnitId,
    cycleStatus,
    toggleRunning,
  }
}
