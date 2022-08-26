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

      // 2、
      watchEffect(function () {
        // 2.1 首次渲染，直接挂载到元素
        if (!isMounted) {
          oldVnode = rootComponent.render();
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