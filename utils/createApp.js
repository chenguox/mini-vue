import { watchEffect } from '../reactive/vue3.js'
// import h from '../renderer/h.js'
import mount from '../renderer/mount.js'
import patch from '../renderer/patch.js'

/**
 * 创建一个 app 对象，对象封装了一个 mount 方法
 * @param {*} rootComponent 根组件
 * @returns 
 */
function createApp(rootComponent) {
  return {
    mount(selector) {
      // 1、获取要挂载的元素
      const container = document.querySelector(selector)
      let isMounted = false;
      let oldVNode = null;

      // 2、依赖收集
      watchEffect(function () {
        // 2.1 首次执行，直接挂载到元素
        if (!isMounted) {
          oldVNode = rootComponent.render();
          mount(oldVNode, container)
          isMounted = true;
        } else {
          const newVNode = rootComponent.render();
          patch(oldVNode, newVNode);
          oldVNode = newVNode;
        }
      })
    }
  }
}

export default createApp

// const vDom = {
//   tag : 'div',
//   props : null,
//   children: [
//     {
//       tag: 'h2',
//       props: null,
//       children: `当前计数：${this.data.counter}`
//     },
//     {
//       tag: 'button',
//       props: {
//         onClick: fn
//       },
//       children: '+1'
//     }
//   ]
// }