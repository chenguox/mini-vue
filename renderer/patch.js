import mount from "./mount";

/**
 * 
 * @param {*} n1 旧的虚拟节点对象
 * @param {*} n2 新的虚拟节点对象
 */
const patch = (n1, n2) => {
  if (n1.tag !== n2.tag) {
    const n1ElParent = n1.el.parentElement;
    n1ElParent.removeChild(n1.el);
    mount(n2, n1ElParent)
  } else {
    // 1、取出 element 对象，并且在 n2 中进行保存
    const el = n2.el = n1.el

    // 2、处理 props 的情况
    const oldProps = n1.props || {}
    const newProps = n2.props || {}

    // 2.1 给元素添加新增的属性
    for (const key in newProps) {
      const oldValue = oldProps[key]
      const newValue = newProps[key]
      if (oldValue !== newValue) {
        if (key.startsWith("on")) { // 对象的比较是不同的
          el.addEventListener(key.slice(2).toLowerCase(), newValue)
        } else {
          el.setAttribute(key, newValue)
        }
      }
    }

    // 2.2 移除旧的属性
    for (const key in oldProps) {
      if (key.startsWith('on')) {
        const value = oldProps[key]
        el.removeEventListener(key.slice(2).toLowerCase(), value)
      }
      if (!(key in newProps)) {
        el.removeAttribute(key)
      }
    }

    // 3、处理 children
    const oldChildren = n1.children || []
    const newChildren = n2.children || []

    // 3.1：newChildren 本身是一个字符串
    if (typeof newChildren === 'string') {
      // 边界情况，有可能 oldChildren 也是一个字符串
      if (typeof oldChildren === 'string') {
        if (newChildren !== oldChildren) {
          el.textContent = newChildren
        }
      } else {
        el.innerHTML = newChildren
      }
    } else {
      // 3.2 newChildren 不是一个字符串, 是一个数组
      // 3.2.1 旧节点是一个字符串
      if (typeof oldChildren === 'string') {
        // 清空内容
        el.innerHTML = ''
        // 遍历，挂载
        newChildren.forEach(item => {
          mount(item, el)
        })
      } else {
        // 3.2.1 旧节点是一个数组，此时，来到这里，新旧节点都是一个数组
        // oldChildren: [v1, v2, v3, v8, v9]
        // newChildren: [v1, v5, v6]
        // (1) 获取两者中的最小长度
        const oLen = oldChildren.length
        const nLen = newChildren.length
        const minLength = Math.min(oLen, nLen)

        // (2) 新节点和旧节点进行 patch 操作
        for (let i = 0; i < minLength; i++) {
          patch(oldChildren[i], newChildren[i])
        }

        // (3) 新节点的长度大于旧节点的长度，新增并挂载
        if (nLen > oLen) {
          // 相同长度的部分已经 patch 过，只需要遍历后面的内容进行挂载操作
          newChildren.slice(minLength).forEach(item => {
            mount(item, el)
          })
        }

        // (4) 旧节点的长度大于新节点的长度，需要移除对应的元素
        if (oLen > nLen) {
          oldChildren.slice(minLength).forEach(item => {
            el.removeChild(item.el)
          })
        }
      }
    }
  }
}

export default patch