import { ref, watch, type Ref } from 'vue'
import { isBrowser } from '@user-xxy/utils'

/**
 * Reactive `localStorage` reference with JSON serialisation.
 *
 * @example
 * const token = useLocalStorage<string>('token', '')
 * token.value = 'abc' // persisted automatically
 */
export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  const read = (): T => {
    if (!isBrowser) return defaultValue
    const raw = window.localStorage.getItem(key)
    if (raw == null) return defaultValue
    try {
      return JSON.parse(raw) as T
    } catch {
      return defaultValue
    }
  }
  const data = ref(read()) as Ref<T>
  watch(
    data,
    (val) => {
      if (!isBrowser) return
      if (val == null) window.localStorage.removeItem(key)
      else window.localStorage.setItem(key, JSON.stringify(val))
    },
    { deep: true },
  )
  return data
}
