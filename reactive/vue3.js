// 每个对象的属性应该有自己的depend对象
let reactiveFn = null
class Depend {
  constructor() {
    this.reactiveFns = new Set()
  }

  depend() {
    if (reactiveFn) {
      this.reactiveFns.add(reactiveFn)
    }
  }

  notify() {
    this.reactiveFns.forEach(fn => {
      fn()
    })
  }
}

const targetMap = new WeakMap()
function getDepend(obj, key) {
  let map = targetMap.get(obj)
  if (!map) {
    map = new Map()
    targetMap.set(obj, map)
  }

  let dep = map.get(key)
  if (!dep) {
    dep = new Depend()
    map.set(key, dep)
  }

  return dep
}

function watchEffect(fn) {
  reactiveFn = fn
  fn()
  reactiveFn = null
}

function reactive(obj) {
  return new Proxy(obj, {
    get: function (target, key, receiver) {
      const dep = getDepend(target, key)
      dep.depend()
      return Reflect.get(target, key, receiver)
    },
    set: function (target, key, value, receiver) {
      Reflect.set(target, key, value, receiver)
      const dep = getDepend(target, key)
      dep.notify()
    }
  })
}

// // 测试代码
// const obj = {
//   name: 'aaa',
//   age: 18
// }

// function print() {
//   console.log('obj对象的name发生改变执行该函数', proxyObj.name);
// }

// const proxyObj = reactive(obj)
// watchEffect(print)
// console.log('----');
// proxyObj.name = 'bbb'
// proxyObj.name = 'ccc'
// proxyObj.name = 'ddd'
// proxyObj.name = 'fff'

export {
  watchEffect,
  reactive
} 