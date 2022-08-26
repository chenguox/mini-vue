// 每个对象的属性应该有自己的depend对象
class Depend {
  constructor() {
    this.reactiveFns = new Set()
  }

  depend() {
    if (reactiveFn) {
      this.reactiveFns.add(reactiveFn);
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

let reactiveFn = null
function watchFn(fn) {
  reactiveFn = fn
  fn()
  reactiveFn = null
}

function reactive2(obj) {
  Object.keys(obj).forEach(key => {
    const dep = getDepend(obj, key)
    let value = obj[key]

    Object.defineProperty(obj, key, {
      get() {
        dep.depend()
        return obj[key]
      },
      set(newValue) {
        if (value !== newValue) {
          value = newValue
          dep.notify()
        }
      }
    })
  })

  return obj
}

// // 测试代码
// const obj = {
//   name: 'aaa',
//   age: 18
// }

// function print() {
//   console.log('obj对象的name发生改变执行该函数', proxyObj.name);
// }

// const proxyObj = reactive2(obj)
// watchFn(print)
// console.log('----');
// proxyObj.name = 'bbb'
// proxyObj.name = 'ccc'
// proxyObj.name = 'ddd'
// proxyObj.name = 'fff'

// 测试代码
const info = reactive2({ counter: 100, name: "why" });
const foo = reactive2({ height: 1.88 });

// watchEffect1
watchFn(function () {
  console.log("effect1:", info.counter * 2, info.name);
})

// watchEffect2
watchFn(function () {
  console.log("effect2:", info.counter * info.counter);
})

// watchEffect3
watchFn(function () {
  console.log("effect3:", info.counter + 10, info.name);
})

watchFn(function () {
  console.log("effect4:", foo.height);
})

// info.counter++;
// info.name = "why";

foo.height = 2;