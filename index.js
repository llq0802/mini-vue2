/*
 * @Author: your name
 * @Date: 2022-01-05 10:51:50
 * @LastEditTime: 2022-01-07 21:14:38
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \vue3.0-cli-ts\面试\vue2响应式\index.js
 */
import renderHelper from './compiler2x/renderHelper.js';
import initData from './initData.js';
import mount from './compiler2x/index.js';
import patch from './compiler2x/patch.js';
import initComputed from './initComputed.js';

export default function Vue(options) {
  this._init(options);
}

Vue.prototype._init = function (options) {
  // this 是vue实例
  this.$options = options;
  //初始化Data数据
  initData(this);
  // 初始化 computed 选项，并将计算属性代理到 Vue 实例上
  // 结合 watcher 实现缓存
  initComputed(this);
  //在Vue实例上挂载运行render函数生成的VNode的工具函数
  renderHelper(this);
  //在Vue实例上挂载函数patch方法
  this._patch_ = patch;
  //首次根组件挂载渲染，子组件没有el需要手动执行$mount
  if (options.el) {
    this.$mount(options.el);
  }
};

Vue.prototype.$mount = function (el) {
  if (el === document.body || el === document.documentElement) {
    throw new Error('挂载元素不能是body或者html');
  }
  mount(el, this);
};
