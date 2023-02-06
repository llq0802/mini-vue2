/*
 * @Author: your name
 * @Date: 2022-01-06 14:53:16
 * @LastEditTime: 2022-01-07 21:45:52
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \vue3.0-cli-ts\面试\vue2响应式\compiler2x\renderHelper.js
 */

import Vnode from './Vnode.js';
/**
 *
 *负责运行时生产VNode的工具方法
 * @export
 * @param {*} vm Vue实例
 */
export default function renderHelper(vm) {
  vm._c = createElement;
  vm._v = createTextNode;
  vm._t = renderSlot;
}

/**
 *为指定标签创建对应的虚拟VNode
 *
 * @param {*} tag
 * @param {*} attrs
 * @param {*} children
 * @return {*}
 */
function createElement(tag, attrs, children) {
  //这里的this是指向Vue实例vm 因为是vm._c调用
  return Vnode(tag, attrs, children, this);
}
/**
 *
 *为文本创建对应的虚拟VNode
 * @param {*} textAst
 * @return {*}
 */
function createTextNode(textAst) {
  //这里的this是指向Vue实例vm 因为是vm._c调用
  return Vnode(null, null, null, this, textAst);
}

/** 父
 * <cmp v-bind:='slotKey'>
 *    <template v-slot:default='value'>
 *        <div>xxx</div>
 *    </template>
 * </cmp>
 *生成插槽slot的vnode
 *                子
 *                <slot>
 *                   <div>xxx</div>
 *                <slot/>
 * 其原理就是生成 VNode，难点在于生成 VNode 之前的各种解析，也就是数据准备阶段
 * @param {*} attr
 * @param {*} children slot标签的children
 */
function renderSlot(attr, slotChildren) {
  //这里的this是指向子组件Vue实例vm 因为是vm._t调用
  let vnode = [];
  // 父组件 VNode 的 attr 信息
  const parentAttr = this._parentVnode.attr;
  //如果slot父节点的的ast中有slotInfo标识说 当前组件插槽传递了内容
  if (parentAttr.slotInfo) {
    // 通过slot标签上的name属性找到插槽信息
    const slotName = attr.name;
    //获取组件插槽中的内容信息
    const slotInfo = parentAttr.slotInfo[slotName];
    //作用域插槽值
    this[slotInfo.slotValue] = this[Object.keys(attr.vBind)[0]];
    //将template标签的children传入得到vnode数组
    vnode = genVNode(slotInfo.children, this);
  } else {
    //当前组件插槽没有内容（默认） 将 slot标签的children 变成 vnode 数组
    vnode = genVNode(slotChildren, this);
  }
  // 如果 slotChildren 长度为 1，则说明插槽只有一个子节点
  if (slotChildren.length === 1) return vnode[0];

  return createElement.call(this, 'div', {}, vnode);
}

/**
 *
 *处理插槽中template的children节点ast数组转成vnode数组
 * @param {*} children template标签的children ast
 * @param {*} vm Vue实例
 */
function genVNode(tempChildren, vm) {
  const vnode = [];
  for (let i = 0; i < tempChildren.length; i++) {
    const { tag, attr, children, text } = tempChildren[i];
    if (text) {
      // 文本节点
      if (typeof text === 'string') {
        // text 为字符串
        // 构造文本节点的 AST 对象
        const textAst = {
          type: 3,
          text,
        };
        if (text.match(/{{(.*)}}/)) {
          // 说明是表达式
          textAst.expression = RegExp.$1.trim();
        }
        vnode.push(createTextNode.call(vm, textAst));
      } else {
        // text 为文本节点的 ast 对象
        vnode.push(createTextNode.call(vm, text));
      }
    } else {
      // 元素节点
      vnode.push(createElement.call(vm, tag, attr, genVNode(children, vm)));
    }
  }
  return vnode;
}
