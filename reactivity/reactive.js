let activeFn = null
class Depend {
  constructor() {
    const fns = []
  }

  depend(fn) {
    this.fns.push(fn)
  }

  notify() {
    this.fns.forEach((fn) => {
      fn()
    })
  }
}

const obj = {
  name: 'cgx',
  age: 18,
}

function print1() {
  console.log('----')
}

function print2() {
  console.log(['22222'])
}

const depend = new Depend()
const depend2 = new Depend()

// 数据存储结构
// weakMap  -> obj map
// map -> key depend

const targetMap = new WeakMap()
function getDepend(obj, key) {
  const map = targetMap.get(obj)
  if (!map) {
    map = new Map(obj)
    targetMap.set(obj, map)
  }

  const depend = map.get(key)
  if (!depend) {
    depend = new Depend()
    map.set(key, depend)
  }

  return depend
}



function watchFn(fn) {
  depend.depend(fn)
}

watchFn(print1)
watchFn(print2)

obj.name = 'abc'


const objProxy = new Proxy(obj,{
  get: function(target,key,receiver){
    const depend = getDepend(obj, key)

    retrun Reflect.get(target,key)
  },
  set: function(target,key,newValue,receiver){
    Reflect.set(target,key,newValue)
    const depend = getDepend(obj, key)
    depend.notify()
  }
})