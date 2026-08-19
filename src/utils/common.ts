export type DebouncedFn = ((this: unknown, ...args: unknown[]) => void) & {
  cancel: () => void
}

export function debounce(delay: number, callback: (...args: unknown[]) => void): DebouncedFn {
  let task: ReturnType<typeof setTimeout> | undefined
  const debounced = function (this: unknown, ...args: unknown[]) {
    clearTimeout(task)
    task = setTimeout(() => {
      callback.apply(this, args)
    }, delay)
  } as DebouncedFn
  debounced.cancel = () => {
    clearTimeout(task)
    task = undefined
  }
  return debounced
}
