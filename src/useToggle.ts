import { ref, type Ref } from 'vue'

/**
 * Reactive boolean toggle.
 *
 * @example
 * const { value, toggle, setTrue, setFalse } = useToggle()
 */
export function useToggle(initial = false): {
  value: Ref<boolean>
  toggle: () => void
  setTrue: () => void
  setFalse: () => void
} {
  const value = ref(initial)
  return {
    value,
    toggle: () => {
      value.value = !value.value
    },
    setTrue: () => {
      value.value = true
    },
    setFalse: () => {
      value.value = false
    },
  }
}

/**
 * Create a shared `useToggle` instance that any caller can reach.
 * Mirrors the original "global sidebar collapse" pattern from the source projects.
 *
 * @example
 * export const useSidebar = createSharedToggle(false)
 * // anywhere in the app
 * const { value: collapsed, toggle } = useSidebar()
 */
export function createSharedToggle(initial = false) {
  const value = ref(initial)
  return () => ({
    value,
    toggle: () => {
      value.value = !value.value
    },
    setTrue: () => {
      value.value = true
    },
    setFalse: () => {
      value.value = false
    },
  })
}
