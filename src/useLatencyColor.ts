import { computed, type ComputedRef, type Ref } from 'vue'
import { getLatencyColor } from '@user-xxy/utils'

/**
 * Compute a Tailwind-style color from a reactive latency value.
 *
 * @example
 * const latency = ref(120)
 * const color = useLatencyColor(latency)
 */
export function useLatencyColor(latency: Ref<number>): ComputedRef<string> {
  return computed(() => getLatencyColor(latency.value))
}
