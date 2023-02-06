/*
 * @Author: your name
 * @Date: 2022-01-05 17:51:04
 * @LastEditTime: 2022-01-12 19:36:16
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \vue3.0-cli-ts\面试\vue2响应式\compiler2x\compileToFunction.js
 */

import generate from './generate.js';
import parse from './parse.js';
/**
 * 解析模版字符串，得到 AST 语法树
 * 将 AST 语法树生成渲染函数
 * @param { String } template 模版字符串
 * @returns 渲染函数
 */
export default function compileToFunction(template) {
  // 解析模版，生成 ast
  const ast = parse(template);
  // 将 ast 生成渲染函数
  const render = generate(ast);
  return render;
}
