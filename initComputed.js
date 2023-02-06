/*
 * @Author: your name
 * @Date: 2022-01-10 09:16:43
 * @LastEditTime: 2022-01-10 10:52:19
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \vue3.0-cli-ts\面试\vue2响应式\initComputed.js
 */
/**
 *
 * 初始化 computed 配置项
 * 为每一项computed实例化一个 Watcher，并将其 computed 属性代理到 Vue 实例上
 * 结合 watcher.dirty 和 watcher.evalute 实现 computed 缓存
 * @export
 * @param {*} vm Vue实例
 */

import Watcher from './observer/Watcher.js';

export default function initComputed(vm) {
  const computed = vm.$options.computed;

  const watcherObj = (vm._watcher = Object.create(null));
  for (let key in computed) {
    if (computed.hasProperty(key)) return;
    // computed属性的值
    const userDef = computed[key];
    // computed watcher 的回调函数
    const getter = typeof userDef === 'function' ? userDef : userDef.get;
    // 为每一个computed实例化watcher（会执行getter，从而生成Vnode 会执行下面的 watcher.evalute();）
    watcherObj[key] = new Watcher(vm, getter, { lazy: true });

    defineComputed(vm, key, userDef);
  }
}

/**
 *
 * 将计算属性代理到 Vue 实例上
 * @param {*} vm Vue 实例
 * @param {*} key computed 的计算属性key
 * @param {*} def computed 的计算属性的值
 */
function defineComputed(vm, key, def) {
  // 属性描述符
  const description = {
    //后续访问会走代理
    get: function () {
      // 找到当前computed的watcher实例
      const watcher = vm_watch[key];
      // 说明当前 computed 回调函数在本次渲染周期内没有被执行过（首次渲染会执行一次）
      if (watcher.dirty) {
        // 执行 evalute，通知 watcher 执行 computed 回调函数，得到回调函数返回值
        //
        watcher.evalute();
      }
      return watcher.value;
    },
    set: function (newValue) {
      console.log(newValue);
    },
  };
  // 将计算属性代理到 Vue 实例上
  Object.defineProperty(vm, key, description);
}
