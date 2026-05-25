import { computed, onBeforeUnmount, ref, watch, type ComputedRef, type Ref } from 'vue'

export interface UseCountdownOptions {
  /** Tick interval in ms (default 1000). */
  interval?: number
  /** Automatically start when the hook is called (default true). */
  immediate?: boolean
  /** Called when the countdown reaches zero. */
  onFinish?: () => void
}

/**
 * Reactive countdown timer.
 *
 * @example
 * const { remaining, start, stop, isFinished } = useCountdown(60_000)
 * start()
 */
export function useCountdown(
  durationMs: number,
  options: UseCountdownOptions = {},
): {
  remaining: Ref<number>
  isFinished: ComputedRef<boolean>
  start: (newDurationMs?: number) => void
  stop: () => void
  reset: () => void
} {
  const { interval = 1000, immediate = true, onFinish } = options
  const remaining = ref(durationMs)
  const isFinished = computed(() => remaining.value <= 0)
  let timer: ReturnType<typeof setInterval> | null = null

  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  const start = (newDurationMs?: number) => {
    stop()
    if (typeof newDurationMs === 'number') remaining.value = newDurationMs
    timer = setInterval(() => {
      remaining.value = Math.max(0, remaining.value - interval)
      if (remaining.value <= 0) {
        stop()
        onFinish?.()
      }
    }, interval)
  }

  const reset = () => {
    stop()
    remaining.value = durationMs
  }

  if (immediate) start()
  watch(isFinished, (done) => {
    if (done) stop()
  })
  onBeforeUnmount(stop)

  return { remaining, isFinished, start, stop, reset }
}
