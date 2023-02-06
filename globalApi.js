/*
 * @Author: your name
 * @Date: 2022-01-10 11:24:13
 * @LastEditTime: 2022-01-10 16:02:34
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \vue3.0-cli-ts\面试\vue2响应式\observer\globel.js
 */

import Vue from './index.js';
import { nextTick } from './compiler2x/asyncUpdateQueue.js';

Vue.set = function(target, key, val) {
  // 处理数组
  if (Array.isArray(target)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val;
  }
};

Vue.delete = function(target, key) {
  // 对于数组用splice方法删除元素
  if (Array.isArray(target)) {
    target.splice(key, 1);
    return;
  }
  const ob = target.__ob__;
  // 如果对象没有该属性，直接返回
  if (!target.hasOwnProperty(key)) return;
  delete target[key];
  // 如果不是响应式对象，则不需要派发更新
  if (!ob) return;
  // 对于响应式对象，删除属性后要派发更新
  ob.dep.notify();
};

Vue.nextTick = function(cb, ctx) {
  nextTick.call(cb, ctx);
};
