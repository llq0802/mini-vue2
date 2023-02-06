/*
 * @Author: your name
 * @Date: 2022-01-05 10:15:28
 * @LastEditTime: 2022-01-05 10:17:29
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \vue3.0-cli-ts\面试\vue2响应式\proxy.js
 */

/**
 * 代理对象
 *
 * @export
 * @param {*} obj vm
 * @param {*} sourcesKey data
 * @param {*} key msg
 * @return {*}
 */
export default function proxy(obj, sourcesKey, key) {
  Object.defineProperty(obj, key, {
    get() {
      return obj[sourcesKey][key];
    },
    set(newvalue) {
      obj[sourcesKey][key] = newvalue;
    },
  });
}
