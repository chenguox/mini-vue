import createApp from '../runtime/createApp.js'
import h from '../renderer/h.js'
import { reactive } from '../reactive/vue3.js'

// 1、创建根组件
const App = {
  data: reactive({
    counter: 0,
  }),
  render() {
    return h('div', null, [
      h('h2', null, `当前计数：${this.data.counter}`),
      h(
        'button',
        {
          onClick: () => {
            console.log(this.data)
            this.data.counter++
            // console.log(this.data.counter)
          },
        },
        '+1'
      ),
    ])
  },
}

// 2、挂载根组件
const app = createApp(App)
app.mount('#app')