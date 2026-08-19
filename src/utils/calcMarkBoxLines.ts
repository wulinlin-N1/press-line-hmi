/** 观察窗口色标框宽度（与 MarkDisplay .mark-box 一致） */
export const MARK_BOX_WIDTH = 34

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export interface MarkBoxLinePositions {
  first: number
  prev: number
  current: number
}

/**
 * 计算三框位置（百分比）
 * - 前色与本色：始终贴邻，中心距 = 1 框宽
 * - 首色与前色：中间空白 = (前色号 - 首色号 - 1) 个框宽
 */
export function calcMarkBoxLines(
  containerWidth: number,
  clickRatio: number,
  currentUnit: number,
  firstUnit = 1,
): MarkBoxLinePositions {
  const boxWidthPct = (MARK_BOX_WIDTH / containerWidth) * 100
  const prevUnit = currentUnit - 1

  const gapPrevCurrent = boxWidthPct
  const gapFirstPrev = Math.max(0, (prevUnit - firstUnit) * boxWidthPct)
  const totalSpan = gapPrevCurrent + gapFirstPrev

  const current = clamp(clickRatio * 100, 5 + totalSpan, 95)
  return {
    first: current - gapPrevCurrent - gapFirstPrev,
    prev: current - gapPrevCurrent,
    current,
  }
}
