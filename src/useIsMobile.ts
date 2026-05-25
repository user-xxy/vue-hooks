import { onMounted, onUnmounted, ref, type Ref } from 'vue'
import { isMobileViewport } from '@user-xxy/utils'

/**
 * Reactive flag that toggles when the viewport crosses `maxWidth`.
 *
 * @example
 * const isMobile = useIsMobile()
 * watch(isMobile, (m) => console.log(m ? 'mobile' : 'desktop'))
 */
export function useIsMobile(maxWidth = 768): Ref<boolean> {
  const isMobile = ref(isMobileViewport(maxWidth))
  const onResize = () => {
    isMobile.value = isMobileViewport(maxWidth)
  }
  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))
  return isMobile
}
