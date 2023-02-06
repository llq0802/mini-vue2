/*
 * @Author: your name
 * @Date: 2022-01-05 11:20:13
 * @LastEditTime: 2022-01-05 11:33:11
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \vue3.0-cli-ts\面试\vue2响应式\compiler\compileNode.js
 */

import Watcher from '../observer/Watcher.js';

export default function compileText(node, vm) {
  const reg = /\{\{(.*)\}\}/;
  const key = node.textContent.match(reg)[1];
  function cb() {
    let value = vm[key];
    node.textContent = typeof value === 'object' ? JSON.stringify(value) : String(value);
  }
  new Watcher(vm, cb);
}
