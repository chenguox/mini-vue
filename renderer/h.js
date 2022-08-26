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
}

export default h