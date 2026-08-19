const COLORS = [
  '#22d3ee',
  '#34d399',
  '#fbbf24',
  '#1890ff',
  '#f472b6',
  '#fb923c',
  '#a78bfa',
  '#ffffff',
]

const PARTICLE_COUNT = 16

/** 在点击位置生成散花粒子 */
export function spawnClickBurst(clientX: number, clientY: number) {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const isPetal = i % 3 === 0
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.6
    const distance = 52 + Math.random() * 64
    const tx = Math.cos(angle) * distance
    const ty = Math.sin(angle) * distance
    const size = isPetal ? 12 + Math.random() * 10 : 10 + Math.random() * 10
    const delay = Math.random() * 0.05
    const duration = 0.55 + Math.random() * 0.35

    const el = document.createElement('span')
    el.className = `click-burst-particle${isPetal ? ' is-petal' : ''}`
    el.style.left = `${clientX}px`
    el.style.top = `${clientY}px`
    el.style.setProperty('--tx', `${tx}px`)
    el.style.setProperty('--ty', `${ty}px`)
    el.style.setProperty('--size', `${size}px`)
    el.style.setProperty('--delay', `${delay}s`)
    el.style.setProperty('--duration', `${duration}s`)
    el.style.background = COLORS[Math.floor(Math.random() * COLORS.length)]
    if (isPetal) {
      el.style.setProperty('--rot', `${Math.floor(Math.random() * 360)}deg`)
    }

    document.body.appendChild(el)
    el.addEventListener('animationend', () => el.remove(), { once: true })
  }
}

/** 全局监听按钮 pointerup，在释放时触发散花 */
export function setupClickBurst() {
  document.addEventListener(
    'pointerup',
    (e: PointerEvent) => {
      const target = e.target
      if (!(target instanceof Element)) return

      const btn = target.closest('button')
      if (!btn || btn.disabled) return

      const rect = btn.getBoundingClientRect()
      const x = e.clientX || rect.left + rect.width / 2
      const y = e.clientY || rect.top + rect.height / 2
      spawnClickBurst(x, y)
    },
    { passive: true },
  )
}
