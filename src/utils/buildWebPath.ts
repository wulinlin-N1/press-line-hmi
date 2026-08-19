import type { WinderType } from '../types'

/** 整线走料路径（全局坐标，与 MachineLine viewBox 一致） */

const UNIT_Y = 46
const WEB_Y = 242
const TOP_R = 9
const BOT_R = 15

/** 放卷/收卷 A·B 辊布局（与 WinderStation 一致） */
const WINDER = {
  unwindOffset: { x: 8, y: 16 },
  rewindOffset: { x: 986, y: 46 },
  slotW: 130,
  rollCx: 56,
  rollAR: 21,
  rollBR: 16.5,
  rollACy: 168,
  sensorOffsetX: 18,
  sensorShelfOffsetY: 10,
  rollBCy: 0,
  contactY: 0,
  sensorLocalCx: 0,
  sensorLocalCy: 0,
}

WINDER.rollBCy = WINDER.rollACy + WINDER.rollAR + WINDER.rollBR
WINDER.contactY = WINDER.rollACy + WINDER.rollAR
WINDER.sensorLocalCx = WINDER.rollCx + WINDER.rollBR + WINDER.sensorOffsetX
WINDER.sensorLocalCy = WINDER.rollBCy + WINDER.sensorShelfOffsetY

function winderOffset(type: WinderType) {
  return type === 'unwind' ? WINDER.unwindOffset : WINDER.rewindOffset
}

function winderLocalToGlobal(type: WinderType, lx: number, ly: number) {
  const offset = winderOffset(type)
  const x = type === 'rewind' ? offset.x + (WINDER.slotW - lx) : offset.x + lx
  return { x, y: offset.y + ly }
}

/** A/B 辊 nip 贴合点 */
function winderNipGlobal(type: WinderType) {
  return winderLocalToGlobal(type, WINDER.rollCx, WINDER.contactY)
}

/** 紫色传感器（B 辊外侧水平段） */
function winderSensorGlobal(type: WinderType) {
  return winderLocalToGlobal(type, WINDER.sensorLocalCx, WINDER.sensorLocalCy)
}

export const unitX = (i: number) => 150 + (i - 1) * 84

/** 色组穿料：上进 → 过顶辊 → 右侧下行 → 绕底辊 → 底部出 */
function appendPrintUnit(parts: string[], i: number, fromBottom: boolean) {
  const x = unitX(i)
  const entryX = x - 18
  const railX = x + 28
  const botCx = x + 2
  const botCy = 222

  if (fromBottom) {
    parts.push(`L ${entryX} ${WEB_Y}`)
    parts.push(`L ${entryX} 58`)
  }

  parts.push(`L ${x - TOP_R} ${UNIT_Y}`)
  parts.push(`A ${TOP_R} ${TOP_R} 0 0 1 ${x + TOP_R} ${UNIT_Y}`)
  parts.push(`L ${railX} ${UNIT_Y + 8}`)
  parts.push(`L ${railX} ${botCy - BOT_R}`)
  parts.push(`L ${botCx + BOT_R} ${botCy - BOT_R}`)
  parts.push(`A ${BOT_R} ${BOT_R} 0 0 1 ${botCx - BOT_R} ${botCy}`)
  parts.push(`L ${x + 66} ${WEB_Y}`)
}

/** 生成整线连续穿料路径 */
export function buildWebPath() {
  const p: string[] = []
  const nip = winderNipGlobal('unwind')
  const sensor = winderSensorGlobal('unwind')
  const rewindNip = winderNipGlobal('rewind')
  const rewindSensor = winderSensorGlobal('rewind')
  const bRight = winderLocalToGlobal('unwind', WINDER.rollCx + WINDER.rollBR, WINDER.rollBCy)
  const bLeft = winderLocalToGlobal('rewind', WINDER.rollCx + WINDER.rollBR, WINDER.rollBCy)

  p.push(`M ${nip.x} ${nip.y}`)
  p.push(`L ${nip.x + 12} ${nip.y}`)
  p.push(`L ${bRight.x} ${bRight.y}`)
  p.push(`L ${sensor.x} ${sensor.y}`)
  p.push(`L 125 ${sensor.y}`)
  p.push(`L 125 72`)
  p.push('L 108 62 L 88 57 L 64 40 L 70 32')
  p.push('L 63 46 A 11 11 0 0 1 85 46')
  p.push('L 106 60 L 120 68 L 141 46')

  appendPrintUnit(p, 1, false)

  for (let i = 2; i <= 10; i++) {
    appendPrintUnit(p, i, true)
  }

  p.push('L 978 242')
  p.push(`L 1018 ${rewindSensor.y + 6} L 1018 102`)
  p.push('L 1014 92 L 1036 86 L 1044 70 L 1052 63')
  p.push('L 1064 68 L 1070 90')
  p.push(`L 1070 ${rewindSensor.y}`)
  p.push(`L ${rewindSensor.x} ${rewindSensor.y}`)
  p.push(`L ${bLeft.x} ${rewindSensor.y}`)
  p.push(`L ${bLeft.x} ${bLeft.y}`)
  p.push(`L ${rewindNip.x} ${rewindNip.y}`)

  return p.join(' ')
}
