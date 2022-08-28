(function () {
  'use strict';

  // 每个对象的属性应该有自己的depend对象
  let reactiveFn = null;
  class Depend {
    constructor() {
      this.reactiveFns = new Set();
    }

    depend() {
      if (reactiveFn) {
        this.reactiveFns.add(reactiveFn);
      }
    }

    notify() {
      this.reactiveFns.forEach(fn => {
        fn();
      });
    }
  }

  const targetMap = new WeakMap();
  function getDepend(obj, key) {
    let map = targetMap.get(obj);
    if (!map) {
      map = new Map();
      targetMap.set(obj, map);
    }

    let dep = map.get(key);
    if (!dep) {
      dep = new Depend();
      map.set(key, dep);
    }

    return dep
  }

  function watchEffect(fn) {
    reactiveFn = fn;
    fn();
    reactiveFn = null;
  }

  function reactive(obj) {
    return new Proxy(obj, {
      get: function (target, key, receiver) {
        const dep = getDepend(target, key);
        dep.depend();
        return Reflect.get(target, key, receiver)
      },
      set: function (target, key, value, receiver) {
        Reflect.set(target, key, value, receiver);
        const dep = getDepend(target, key);
        dep.notify();
      }
    })
  }

  /**
   * mount 函数，创建真实的原生并挂载
   * @param {*} vnode 虚拟节点(对象)
   * @param {*} container 要挂载元素对象
   */
  const mount = (vnode, container) => {
    // 1、创建出真实的原生，并且在 vnode 上保留 el
    const el = vnode.el = document.createElement(vnode.tag);

    // 2、处理 props
    if (vnode.props) {
      for (const key in vnode.props) {
        const value = vnode.props[key];

        if (key.startsWith("on")) { // 对事件监听的判断
          el.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
          el.setAttribute(key, value);
        }
      }
    }

    // 3、处理children
    if (vnode.children) {
      if (typeof vnode.children === 'string') {
        el.textContent = vnode.children;
      } else {
        vnode.children.forEach(item => {
          mount(item, el);
        });
      }
    }

    // 4、将 el 挂载到 container 上
    container.appendChild(el);
  };

  /**
   * 
   * @param {*} n1 旧的虚拟节点对象
   * @param {*} n2 新的虚拟节点对象
   */
  const patch = (n1, n2) => {
    if (n1.tag !== n2.tag) {
      const n1ElParent = n1.el.parentElement;
      n1ElParent.removeChild(n1.el);
      mount(n2, n1ElParent);
    } else {
      // 1、取出 element 对象，并且在 n2 中进行保存
      const el = n2.el = n1.el;

      // 2、处理 props 的情况
      const oldProps = n1.props || {};
      const newProps = n2.props || {};

      // 2.1 给元素添加新增的属性
      for (const key in newProps) {
        const oldValue = oldProps[key];
        const newValue = newProps[key];
        if (oldValue !== newValue) {
          if (key.startsWith("on")) { // 对象的比较是不同的
            el.addEventListener(key.slice(2).toLowerCase(), newValue);
          } else {
            el.setAttribute(key, newValue);
          }
        }
      }

      // 2.2 移除旧的属性
      for (const key in oldProps) {
        if (key.startsWith('on')) {
          const value = oldProps[key];
          el.removeEventListener(key.slice(2).toLowerCase(), value);
        }
        if (!(key in newProps)) {
          el.removeAttribute(key);
        }
      }

      // 3、处理 children
      const oldChildren = n1.children || [];
      const newChildren = n2.children || [];

      // 3.1：newChildren 本身是一个字符串
      if (typeof newChildren === 'string') {
        // 边界情况，有可能 oldChildren 也是一个字符串
        if (typeof oldChildren === 'string') {
          if (newChildren !== oldChildren) {
            // console.log(el)
            el.textContent = newChildren;
          }
        } else {
          el.innerHTML = newChildren;
        }
      } else {
        // 3.2 newChildren 不是一个字符串, 是一个数组
        // 3.2.1 旧节点是一个字符串
        if (typeof oldChildren === 'string') {
          // 清空内容
          el.innerHTML = '';
          // 遍历，挂载
          newChildren.forEach(item => {
            mount(item, el);
          });
        } else {
          // 3.2.1 旧节点是一个数组，此时，来到这里，新旧节点都是一个数组
          // oldChildren: [v1, v2, v3, v8, v9]
          // newChildren: [v1, v5, v6]
          // (1) 获取两者中的最小长度
          const oLen = oldChildren.length;
          const nLen = newChildren.length;
          const minLength = Math.min(oLen, nLen);

          // (2) 新节点和旧节点进行 patch 操作
          for (let i = 0; i < minLength; i++) {
            patch(oldChildren[i], newChildren[i]);
          }

          // (3) 新节点的长度大于旧节点的长度，新增并挂载
          if (nLen > oLen) {
            // 相同长度的部分已经 patch 过，只需要遍历后面的内容进行挂载操作
            newChildren.slice(minLength).forEach(item => {
              mount(item, el);
            });
          }

          // (4) 旧节点的长度大于新节点的长度，需要移除对应的元素
          if (oLen > nLen) {
            oldChildren.slice(minLength).forEach(item => {
              el.removeChild(item.el);
            });
          }
        }
      }
    }
  };

  /**
   * 创建一个 app 对象，对象封装了一个 mount 方法
   * @param {*} rootComponent 根组件
   * @returns 
   */
  function createApp(rootComponent) {
    return {
      mount(selector) {
        // 1、获取要挂载的元素
        const container = document.querySelector(selector);
        let isMounted = false;
        let oldVNode = null;

        // 2、依赖收集
        watchEffect(function () {
          // 2.1 首次执行，直接挂载到元素
          if (!isMounted) {
            oldVNode = rootComponent.render();
            mount(oldVNode, container);
            isMounted = true;
          } else {
            const newVNode = rootComponent.render();
            patch(oldVNode, newVNode);
            oldVNode = newVNode;
          }
        });
      }
    }
  }

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

  /**
   * h函数，生成虚拟节点对象
   * @param {*} tag 标签名(字符串)
   * @param {*} props 属性(对象 | null)
   * @param {*} children 子节点(字符串 | 数组)
   * @returns
   */
  const h = (tag, props, children) => {
    return {
      tag,
      props,
      children,
    }
  };

  // 1、创建根组件
  const App = {
    data: reactive({
      counter: 0,
    }),
    render() {
      return h("div", null, [
        h("h2", null, `当前计数：${this.data.counter}`),
        h(
          "button",
          {
            onClick: () => {
              console.log(this.data);
              this.data.counter++;
              // console.log(this.data.counter)
            },
          },
          "+1"
        ),
      ]);
    },
  };

  // 2、挂载根组件
  const app = createApp(App);
  app.mount("#app");

})();
