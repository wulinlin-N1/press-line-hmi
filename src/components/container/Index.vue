<template>
    <div id="main-container" ref="mainContainer">
      <template v-if="ready">
        <slot></slot>
      </template>
    </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { debounce } from '../../utils/common'

export default {
    name: 'MainContainer',
    props: {
      options: Object
    },
    setup(props) {
      const mainContainer = ref(null)
      const width = ref(0)
      const height = ref(0)
      const originalWidth = ref(0)
      const originalHeight = ref(0)
      const ready = ref(false)
      let observer

      const initSize = () => {
        return new Promise((resolve) => {
          nextTick(() => {
              const dom = mainContainer.value
              if (!dom) {
                resolve()
                return
              }
              // 获取大屏的真实尺寸
              if (props.options && props.options.width && props.options.height) {
                width.value = props.options.width
                height.value = props.options.height
              } else {
                width.value = dom.clientWidth
                height.value = dom.clientHeight
              }
              // 获取画布尺寸
              if (!originalWidth.value || !originalHeight.value) {
                originalWidth.value = window.screen.width
                originalHeight.value = window.screen.height
              }
              resolve()
          })
          })
    }

    const updateSize = () => {
        const dom = mainContainer.value
        if (!dom) return
        if (width.value && height.value) {
        dom.style.width = `${width.value}px`
        dom.style.height = `${height.value}px`
        } else {
        dom.style.width = `${originalWidth.value}px`
        dom.style.height = `${originalHeight.value}px`
        }
    }

    const updateScale = () => {
        const dom = mainContainer.value
        if (!dom) return
        // 获取真实的视口尺寸
        const currentWidth = document.body.clientWidth
        const currentHeight = document.body.clientHeight
        // 获取大屏最终的宽高
        const realWidth = width.value || originalWidth.value
        const realHeight = height.value || originalHeight.value
        const widthScale = currentWidth / realWidth
        const heightScale = currentHeight / realHeight
        dom.style.transform = `scale(${widthScale}, ${heightScale})`
    }

    const onResize = async () => {
        await initSize()
        updateScale()
    }

    const onResizeDebounced = debounce(100, onResize)

    const initMutationObserver = () => {
      const MutationObserver = window.MutationObserver
      const dom = mainContainer.value
      if (!dom) return
      observer = new MutationObserver(onResize)
      observer.observe(dom, {
        attributes: true,
        attributeFilter: ['style'],
        attributeOldValue: true
      })
    }

    const removeMutationObserver = () => {
      if (observer) {
        observer.disconnect()
        observer.takeRecords()
        observer = null
      }
    }

    onMounted(async () => {
      ready.value = false
      await initSize()
      updateSize()
      updateScale()
      window.addEventListener('resize', onResizeDebounced)
      initMutationObserver()
      ready.value = true
    })

    onUnmounted(() => {
        onResizeDebounced.cancel()
        window.removeEventListener('resize', onResizeDebounced)
        removeMutationObserver()
    })

    return {
        mainContainer,
        ready
      }
    }
}
</script>

<style scoped>
#main-container {
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
    transform-origin: left top;
    z-index: 999;
}
</style>
  