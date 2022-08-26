# mini-vue

**这里我们实现一个简洁版的 Mini-Vue 框架，该 Vue 包含三个模块：**

* **渲染系统模块**
* **可响应式系统模块**
* **应用程序入口模块**

## **真实 DOM 和 虚拟 DOM 的理解**

**说到 vue，就不得不说我们经常挂在口头上的虚拟 DOM，它和真实的 DOM 有什么区别? 为什么要有虚拟 DOM?**

### **真实 DOM 的理解**

**真实的 DOM 非常好理解，在没有 Vue 之前，我们使用原生开发，所有对 DOM 的操作，都是对真实的 DOM 在进行操作。我们称 DOM 为 **`文档对象模型` ，是浏览器将我们编写在 HTML 中的每一个元素都抽象成一个个对象，让我们开发者能够通过 JavaScript 来对其进行操作。

**所以传统的前端开发的流程可概括为：**

**html 页面代码 -> 真实的 DOM -> 页面效果**

### **虚拟 dom 的理解**

**Vue 引入虚拟 DOM 来对真实 DOM 进行抽象。**

**这里得先理解** **虚拟节点（VNode）** **的概念**

**简单来说：**

**就是将下面的代码(一个元素)，变成一个 JavaScript 对象来描述：**

```
<div>哈哈哈</div>
```

** 抽象成如下的代码，我们称之为 **`虚拟节点` 。所以，它就是一个对象而已。

```
const vnode = {
  tag: 'div',
  children: '哈哈哈'
}
```

**而虚拟 DOM 就是多个虚拟节点组合而成。**

**为什么我们要大费周章的抽象一个虚拟 DOM 出来，直接使用真实 DOM 不好吗？**

**虚拟 DOM 的有如下好处：**

1、直接操作虚拟 DOM 比 操作真实 DOM 更加灵活，也就是有些操作不好在真实 DOM 上操作，现在可以直接操作虚拟 DOM 来实现，比如 diff、clone 等等。

2、虚拟 DOM 可以实现跨平台，因为虚拟 DOM 就只是一个对象，那么就可以编写对应的渲染器（renderer）将虚拟 dom 渲染生成我们想要的代码。

**所以现代的开发方式：**

**template  -> 虚拟 DOM -> 真实 DOM -> 页面效果**

## **Vue 的三大核心系统**

**事实上，Vue 的源码包含三大核心：**

* Compiler 模块
* Runtime 模块
* Reactivity 模块

![](https://uploader.shimo.im/f/rz5M8AxI4hSmveOy.png!thumbnail?accessToken=eyJhbGciOiJIUzI1NiIsImtpZCI6ImRlZmF1bHQiLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE2NjE1MDM2MjMsImZpbGVHVUlEIjoibTVrdjkwSnplemY1Vk1xWCIsImlhdCI6MTY2MTUwMzMyMywiaXNzIjoidXBsb2FkZXJfYWNjZXNzX3Jlc291cmNlIiwidXNlcklkIjoxNTA5OTg5N30.Ry7EinHjifbu3NL7uOMNykSfPg571PO5ed9oHfnJ0Dg)

### **Compiler 模块**

这是 Vue 的编译模块系统，它负责将我们的 template 代码编译成 render 函数，这里编写的 Mini-Vue 将不涉及这一块，将会直接采用编写好渲染函数来执行后续处理操作。

### **Runtime 模块**

也称为 Renderer 模块，真正的渲染的模块。这里的 Mini-Vue 将实现一个 h 函数，用于将 render 函数转成虚拟节点，实现一个 mount 函数将虚拟节点生成真实的原生并挂载到容器上，实现一个 patch 函数来进行新旧节点的比较和处理。

### **Reactivity 模块**

Vue 的响应式系统，Vue2 中使用 Object.defineProperty 劫持对象中的每个属性实现监听，Vue3 中使用 Proxy 实现一个代理对象来进行监听。

## **渲染系统的实现**

**渲染系统，该模块主要包含三个功能：**

* **功能一：**

h 函数，用于返回一个 VNode 对象

* **功能二：**

mount 函数，用于将 VNode 挂载到 DOM 上

* **功能三：**

patch 函数， 用于对两个 VNode 进行比较，决定如何处理新的 VNode

### **实现 h 函数**

h 函数的实现非常简单，接收三个参数 `标签名` ，  `属性值` ， `子节点` ，并直接组装成一个虚拟节点对象返回即可

```
const h = (tag, props, children) => {
  return {
    tag,
    props,
    children,
  }
}
```

### **实现 mount 函数**

第一步：根据 tag ，创建对应的 HTML 元素，并存储到虚拟节点的 el 属性中

```
const el = vnode.el = document.createElement(vnode.tag)
```

第二步：处理 props 属性，如果是普通属性，就使用 setAttribute 添加即可，如果以 on 开头，那么使用 addEventListener 添加对应的监听事件。

```
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
```

第三步：处理子节点，如果是字符串节点，那么直接将内容设置给元素对象的 textContent。如果是数组节点，那么需要遍历调用 mount 函数。 

```
if (vnode.children) {
  if (typeof vnode.children === 'string') {
    el.textContent = vnode.children
  } else {
    vnode.children.forEach(item => {
      mount(item, el)
    })
  }
}
```

### **实现 patch 函数**

**patch 函数的实现，分为两种情况：**

**第一种情况：新旧节点是不同类型的节点**

* 需要找到就旧节点的元素的父节点，删除原来的旧节点的元素
* 挂载新节点到旧节点的元素的父节点上

```
// n1 代表旧节点  n2 代表新节点
const patch = (n1, n2) => {
  if (n1.tag !== n2.tag) {
    const n1ElParent = n1.el.parentElement;
    n1ElParent.removeChild(n1.el);
    mount(n2, n1ElParent)
  } else {
    // ....
  }
}
```

**第二种情况：新旧节点是相同的节点**

**第一步，处理元素对象**

* 获取旧节点的元素对象
* 将旧节点的元素对象挂载到新节点的元素对象上

```
// 1.取出element对象, 并且在n2中进行保存
const el = n2.el = n1.el;
// 等价于 
// const el = n1.el => el 代表旧节点的元素对象 
// n2.el = n1.el   => 将旧节点的元素对象赋值给新节点的元素对象
```

**第二步，处理 props 的情况，添加新的属性，删除不需要的属性**

```
// 2.处理props
const oldProps = n1.props || {};
const newProps = n2.props || {};
```

* 遍历新节点的属性对象，通过属性名获取新旧节点的属性值进行比较，将缺少的新属性添加到旧节点的元素对象上

```
// 2.1.获取所有的newProps添加到el
for (const key in newProps) {
  const oldValue = oldProps[key];
  const newValue = newProps[key];
  if (newValue !== oldValue) {
    if (key.startsWith("on")) { 
      el.addEventListener(key.slice(2).toLowerCase(), newValue)
    } else {
      el.setAttribute(key, newValue);
    }
  }
}
```

* 遍历旧节点的属性对象，移除事件监听，并将 key 不存在与新节点的属性对象的中的移除

```
// 2.2.删除旧的props
for (const key in oldProps) {
  if (key.startsWith("on")) { 
    const value = oldProps[key];
    el.removeEventListener(key.slice(2).toLowerCase(), value)
  } 
  if (!(key in newProps)) {
    el.removeAttribute(key);
  }
}
```

**第三步，在处理 children 的情况**

* 如果新节点是一个字符串类型，那么直接将内容赋值给元素的 textContent
* 如果新节点不是一个字符串类型
  * 旧节点是一个字符串类型
    * 将 el 的 textContent 设置为空字符串
    * 遍历新节点，挂载到 el 上
  * 旧节点是一个数组类型
  * 取出数组的最小长度
  * 遍历所有的节点，新节点和旧节点进行 patch 操作
  * 如果新节点的长度更长，那么剩余的新节点进行挂载操作
  * 如果旧节点的长度更长，那么剩余的旧节点进行卸载操作

```
相关代码可查看项目里的 patch.js 文件
```

## **响应式系统的实现**

### **响应式的理解**

当一个对象的属性发生改变时，自动执行对应的函数，我们称之为响应式。

### **依赖收集数据结构**

在 vue3 的响应式原理中就用了 WeakMap 来 收集依赖 。

* 比如：我们有这样一个对象

```
const obj = {
  name: '小明',
  age: '18'
}
```

* 当 obj.name 改变时，执行这两个函数

```
function objNameFn1() {
  console.log('objName1被执行')
}
function objNameFn2() {
  console.log('objName2被执行')
}
```

* 当 obj.age 改变时，执行这两个函数

```
function objAgeFn1() {
  console.log('objName1被执行')
}
function objAgeFn1() {
  console.log('objName2被执行')
}
```

* 实现收集依赖结构

```
// 创建 weakMap 和 map 组合成收集依赖的数据结构
const weakMap = new WeakMap()
const objMap = new Map() // obj对象
// 实际不止一个obj对象，可能有obj2,obj3,我们将处理后的对象存在weakMap中
weakMap.set(obj, objMap)
// 将 objNameFn1 和 objNameFn2 收集与 obj.name 绑定
objMap.set('name', [ objNameFn1, objNameFn2 ])
// 将 objAgeFn1 和 objAgeFn2 收集与 obj.age 绑定
objMap.set('age', [ objAgeFn1, objAgeFn1 ])
```

**如图所示：**

![](https://uploader.shimo.im/f/Nh61bpT0H40PcQmV.png!thumbnail?accessToken=eyJhbGciOiJIUzI1NiIsImtpZCI6ImRlZmF1bHQiLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE2NjE1MDM2MjMsImZpbGVHVUlEIjoibTVrdjkwSnplemY1Vk1xWCIsImlhdCI6MTY2MTUwMzMyMywiaXNzIjoidXBsb2FkZXJfYWNjZXNzX3Jlc291cmNlIiwidXNlcklkIjoxNTA5OTg5N30.Ry7EinHjifbu3NL7uOMNykSfPg571PO5ed9oHfnJ0Dg)

* **监听执行**

```
// 当 obj.name 发送改变时候，取出来执行
obj.name = '小红'
// 取出对应obj的Map
const targeMap = weakMap.get(obj)
// 取出属性名对应的数组
const fns = targeMap.get('name')
// 遍历执行
fns.forEach((item) => item())
// 打印结果：
// objName1被执行
// objName2被执行
```

### **依赖收集系统**

```
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


function watchFn(fn) {
  reactiveFn = fn
  fn()
  reactiveFn = null
}
```

### **Vue3的响应式实现**

**Vue3 中使用 Proxy 类来创建一个代理对象，操作的是代理对象，具体实现如下：**

```
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
```

### **Vue2的响应式实现**

**Vue2 中实现响应式是使用 Object.defineProperty 对一个对象里的属性进行劫持，操作的是原对象。**

```
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
```

## **应用程序入口**

**在使用 vue 开发中，我们会引入一个 createApp 方法，并进行挂载，如下：**

```
import { createApp } from 'vue'
const app = createApp(App)
app.mount('#app')
```

**所以，从框架的层面来说，我们需要两部分内容：**

* 使用 createApp 创建一个 app 对象。
* 该 app 对象有一个 mount 方法，可以将根组件挂载到某一个 dom 元素上。

**实现代码如下：**

```
function createApp(rootComponent) {
  return {
    mount(selector) {
      const container = document.querySelector(selector)
      let isMounted = false;
      let oldVNode = null;


      watchEffect(function () {
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
```
