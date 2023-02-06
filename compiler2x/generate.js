/*
 * @Author: your name
 * @Date: 2022-01-05 17:52:46
 * @LastEditTime: 2022-01-07 11:50:44
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \vue3.0-cli-ts\面试\vue2响应式\compiler2x\generate.js
 */

/**
 *
 *
 * @export
 * @param {*} ast
 * @return {*}
 */
export default function generate(ast) {
  //渲染函数字符串
  const renderStr = genElement(ast);
  // 通过 new Function 将字符串形式的函数变成可执行函数，并用 with 为渲染函数扩展作用域链
  return new Function(`with(this) { return ${renderStr} }`);
}

/**
 *_c(tag,attrs,children)
 *
 * @param {*} ast
 * @return {*}
 */
function genElement(ast) {
  const { tag, attr, rawAttr } = ast;
  const children = genChildren(ast);
  const attrs = { ...attr, ...rawAttr };
  //处理插槽  slot标签
  if (tag === 'slot') {
    return `_t(${JSON.stringify(attrs)},[${children}])`;
  }
  return `_c('${tag}',${JSON.stringify(attrs)},[${children}])`;
}
/**
 *
 * [_v(child)]渲染文本节电
 *
 * @param {*} ast
 */
function genChildren(ast) {
  const res = [],
    { children } = ast;

  for (let i = 0, len = children.length; i < len; i++) {
    const child = children[i];
    //文本节点
    if (child.type === 3) {
      //child此时为文本节点对象
      res.push(`_v(${JSON.stringify(child)})`);
    } else if (child.type === 1) {
      //元素节点 用递归的方式
      res.push(genElement(child));
    }
  }
  return res;
}
