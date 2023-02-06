/*
 * @Author: your name
 * @Date: 2022-01-11 19:37:47
 * @LastEditTime: 2022-01-11 19:38:58
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \projkect\面试\vue2响应式\compiler2x\mountComponent.js
 */
import Watcher from '../observer/Watcher.js';
import Vue from '../index.js';

/**
 *
 *
 * @export
 * @param {*} vm Vue实例
 */
export default function mountComponent(vm) {
  // 更新组件的的函数,
  const updateComponent = () => {
    vm._update(vm._render());
  };

  // 实例化一个渲染 Watcher，当响应式数据更新时，这个更新函数会被执行
  new Watcher(vm, updateComponent);
}

/**
 * 生成vnode
 * @returns
 */
Vue.prototype._render = function () {
  // 给 render 函数绑定 this 上下文为 Vue 实例
  //回去执行renderHelper中vm的_c函数与_v函数
  return this.$options.render.apply(this); //_c()
};

/**
 * 组件初次渲染以及更新
 * @param {*} vnode
 */
Vue.prototype._update = function (vnode) {
  //渲染前，获取旧的VNode,绑定到vm中
  const oldVnode = this._vnode;
  //设置新的VNode
  this._vnode = vnode;
  //老的VNode不存在说明是首次渲染根组件
  if (!oldVnode) {
    this.$el = this._patch_(this.$el, vnode);
  } else {
    // 后续更新组件或者首次渲染子组件，都会走这里
    this.$el = this._patch_(oldVnode, vnode);
  }
};
