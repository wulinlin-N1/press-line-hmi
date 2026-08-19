import type { ComputedRef, InjectionKey, Ref } from 'vue'

export type UnitStatus = 'run' | 'stop' | 'alarm'

export interface PrintUnit {
  id: number
  color: string
  status: UnitStatus
}

export interface Tensions {
  unwind: number
  rewind: number
}

export interface LineSimulator {
  running: Ref<boolean>
  speed: Ref<number>
  targetSpeed: Ref<number>
  units: PrintUnit[]
  tensions: Tensions
  deviations: number[]
  alarmCount: ComputedRef<number>
  stopCount: ComputedRef<number>
  activeUnitId: Ref<number | null>
  cycleStatus: (unit: PrintUnit) => void
  toggleRunning: () => void
}

export const lineSimulatorKey: InjectionKey<LineSimulator> = Symbol('lineSimulator')

export type WinderType = 'unwind' | 'rewind'

export interface MarkBoxLines {
  first: number
  prev: number
  current: number
}

export type MarkLineKey = keyof MarkBoxLines

export interface ColorTableValues {
  long: number[]
  trans: number[]
}

export type MarkRole = 'first' | 'prev' | 'current' | ''

export type ToggleAction = 'stop' | 'start'
