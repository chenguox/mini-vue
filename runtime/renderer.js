/**
 * h函数
 * @param {*} tag 标签名
 * @param {*} props 属性
 * @param {*} children
 * @returns
 */
const h = (tag, props, children) => {
  return {
    tag,
    props,
    children,
  }
}
