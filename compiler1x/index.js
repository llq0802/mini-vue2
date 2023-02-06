/*
 * @Author: your name
 * @Date: 2022-01-05 11:01:28
 * @LastEditTime: 2022-01-08 10:33:39
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \vue3.0-cli-ts\面试\vue2响应式\compiler\index.js
 */
import compileNode from './compileNode.js';
export default function mount(el, vm) {
  const div = document.querySelector(el);

  compileNode([...div.childNodes], vm);
}

/**
 *
 * createDocumentFragment
 * @param {*} node
 * @return {*}
 */
function node2Fragment(node) {
  let fragment = document.createDocumentFragment();
  let firstChild = node.firstChild;
  while (firstChild) {
    fragment.appendChild(firstChild);
    firstChild = node.firstChild;
  }
  return fragment;
}
