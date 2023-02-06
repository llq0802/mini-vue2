/*
 * @Author: your name
 * @Date: 2022-01-05 11:20:13
 * @LastEditTime: 2022-01-05 11:34:06
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \vue3.0-cli-ts\面试\vue2响应式\compiler\compileNode.js
 */
import compileAttrs from './compileAttrs.js';
import compileText from './compileText.js';

/**
 *
 *
 * @export
 * @param {*} NodeArr
 * @param {*} vm
 */
export default function compileNode(NodeArr, vm) {
  for (let node of [...NodeArr]) {
    if (node.nodeType === 1) {
      compileAttrs(node, vm);
      compileNode(node.childNodes, vm);
    } else if (node.nodeType === 3) {
      compileText(node, vm);
    }
  }
}
