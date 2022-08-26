/**
 * mount 函数，创建真实的原生并挂载
 * @param {*} vnode 虚拟节点(对象)
 * @param {*} container 要挂载元素对象
 */
 const mount = (vnode, container) => {
  // 1、创建出真实的原生，并且在 vnode 上保留 el
  const el = vnode.le = document.createElement(vnode.tag)

  // 2、处理 props
  if (vnode.props) {
    for (const key in vnode.props) {
      const value = vnode.props[key];

      if (key.startsWith("on")) { // 对事件监听的判断
        el.addEventListener(key.slice(2).toLowerCase(), value)
      } else {
        el.setAttribute(key, value)
      }
    }
  }

  // 3、处理children
  if (vnode.children) {
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children
    } else {
      vnode.children.forEach(item => {
        mount(item, el)
      })
    }
  }

  // 4、将 el 挂载到 container 上
  container.appendChild(el)
}

export default mount