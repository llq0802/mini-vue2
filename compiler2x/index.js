/*
 * @Author: your name
 * @Date: 2022-01-05 17:41:46
 * @LastEditTime: 2022-01-07 21:13:33
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \vue3.0-cli-ts\面试\vue2响应式\compiler2x\index.js
 */

import compileToFunction from './compileToFunction.js';
import mountComponent from './mountComponent.js';

/**
 *
 *
 * @export
 * @param {*} vm
 */

export default function mount(el, vm) {
  // render>template>el
  if (!vm.$options.render) {
    //优先级： render>template>el
    // 没有提供 render 选项，则编译生成 render 函数
    // 获取模版
    let template = '';

    if (vm.$options.template) {
      // 模版存在（子组件会走这里）
      template = vm.$options.template;
    } else if (vm.$options.el) {
      // 存在挂载点（根组件会走这里）
      template = document.querySelector(vm.$options.el).outerHTML;
      // 在实例上记录真实挂载点，this._update 中会用到
      vm.$el = document.querySelector(vm.$options.el);
    }

    // 生成渲染函数
    const render = compileToFunction(template);
    // 将渲染函数挂载到 $options 上
    vm.$options.render = render;
  }
  //挂载阶段
  mountComponent(vm);
}
