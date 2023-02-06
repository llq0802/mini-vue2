/*
 * @Author: your name
 * @Date: 2021-12-29 10:56:18
 * @LastEditTime: 2022-01-04 17:17:45
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \vue3.0-cli-ts\面试\vue2响应式\index.js
 */

import Observer from './Observer.js';

/**
 *响应式原理总结：
 *  observer方法->Observer实例对象->defineReactive方法 ->dep.depend()->watcher.addSup()双向收集依赖(watcher添加到dep，dep添加到watcher)->dep.notify()
 *
 *  1.调用observe(obj)，将obj设置为响应式对象，observe函数，Observe, defineReactive函数三者互相调用，从而递归地将obj设置为响应式对象
 *  2.渲染页面时实例化watcher，这个过程会读取依赖数据的值，从而完成在getter中获取依赖
 *  3.依赖变化时触发setter，从而派发更新，执行回调，完成在setter中派发更新
 *
 *
 */
export default function observer(value) {
  let ob; //为当前对象添加响应式
  if (Object.prototype.toString.call(value).slice(8, -1) !== 'Object') {
    return;
  }
  if (value.__ob__) {
    ob = value.__ob__;
  } else {
    ob = new Observer(value);
  }
  return ob;
}

// let data = {
//   name: 'llq',
//   id: 15,
//   desc: '甩哥',
//   age: 20,
//   arr: [1, 2, 3],
// };

// observer(data);
