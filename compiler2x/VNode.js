/*
 * @Author: your name
 * @Date: 2022-01-06 15:00:48
 * @LastEditTime: 2022-01-07 17:36:40
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \vue3.0-cli-ts\面试\vue2响应式\compiler2x\VNode.js
 */

/**
 *
 *
 * @export
 * @param {*} tag  标签名
 * @param {*} attrs 属性对象
 * @param {*} children 子节点数组
 * @param {*} [context=null] vue实例
 * @param {*} [text=null] 文本节点的ast对象
 */
export default function VNode(tag, attr, children, context = null, text = null) {
  return {
    // 标签
    tag,
    // 属性 Map 对象
    attr,
    // 父节点
    parent: null,
    // 子节点组成的 Vnode 数组
    children,
    // 文本节点的 Ast 对象
    text,
    // Vnode 的真实节点
    elm: null,
    // Vue 实例
    context,
    //唯一标识
    key: attr?.key ? attr.key : undefined,
  };
}
