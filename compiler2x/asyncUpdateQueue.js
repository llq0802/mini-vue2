/*
 * @Author: your name
 * @Date: 2022-01-10 12:10:45
 * @LastEditTime: 2022-01-11 17:18:17
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \vue3.0-cli-ts\面试\vue2响应式\compiler2x\asyncUpdataQueue.js
 */

// 存储本次更新的所有 watcher
const queueWatcherArr = [];

// 标识现在是否正在执行watcher 队列
let flushing = false;

// 存放执行 watcher 队列的函数，或者用户调用 Vue.nextTick 方法传递的回调函数
const callbacks = [];

// 标识callbacks队列中是否存在执行 watcher 队列的函数
//保证 callbacks 数组中只会有一个刷新 watcher 队列的函数
let waiting = false;

// 标识浏览器当前任务队列中是否存在刷新 callbacks 数组的函数flushQueueWatcher
//保证浏览器当前任务队列中只会有一个刷新 callbacks 队列的函数
let pending = false;

/**
 * 将 watcher 放入队列
 * @param {*} watcher 待会儿需要被执行的 watcher，包括渲染 watcher、用户 watcher、computed watcher
 */
export default function queueWatcher(watcher) {
  // 防止重复入队
  if (!queueWatcherArr.includes(watcher)) {
    // 现在没有在执行 watcher 队列
    if (flushing) {
      queueWatcherArr.push(watcher);
    } else {
      // 正在执行 watcher 队列，比如用户 watcher 的回调函数中更改了某个响应式数据
      // 标记当前 watcher 在 for 循环中是否已经完成入队操作
      let flag = false;
      for (let index = 0; index < queueWatcherArr.length; index++) {
        // 找到了刚好比当前 watcher.id 小的那个 watcher 的位置
        if (queueWatcherArr[index].id < watcher.id) {
          // 将当前 watcher 插入到该位置的后面
          queueWatcherArr.splice(index + 1, 0, watcher);
          flag = true;
          break;
        }
      }

      // 说明上面的 for 循环在队列中没找到比当前 watcher.id 小的 watcher
      if (!flag) {
        // 将当前 watcher 插入到队首
        queueWatcherArr.unshift(watcher);
      }
    }

    // 表示当前 callbacks 数组中还没有刷新 watcher 队列的函数
    // 保证 callbacks 数组中只会有一个刷新 watcher 队列的函数
    // 因为如果有多个，没有任何意义，第二个执行的时候 watcher 队列已经为空了
    if (!waiting) {
      waiting = true;
      nextTick(flushQueueWatcher(queueWatcherArr));
    }
  }
}

/**
 *
 *
 * @param {*} arr
 */
function flushQueueWatcher() {
  // 表示正在刷新 watcher 队列
  waiting = true;
  // 给 watcher 队列排序，根据 id 由小到大排序
  queueWatcherArr.sort((a, b) => a.id - b.id);
  // 遍历队列，依次执行其中每个 watcher 的 run 方法
  while (queueWatcherArr.length) {
    // 取出队首的 watcher
    const watcher = queueWatcherArr.shift();
    // 执行 run 方法
    watcher.run();
  }
  // 到这里 watcher 队列刷新完毕
  flushing = waiting = false;
}

/**
 *
 *
 * @export
 * @param {*} cb
 */
export function nextTick(cb, ctx) {
  // 包装一层函数，绑定this
  callbacks.push(() => {
    cb.call(ctx);
  });

  // 表明浏览器当前任务队列中没有刷新 callbacks 数组的函数
  // 将 flushCallbacks 函数放入浏览器的微任务队列（浏览器的异步任务队列只能有一个函数执行callbacks）
  if (!pending) {
    // 标识浏览器的微任务队列中已经存在 执行 callbacks 数组的函数了
    pending = true;

    // 异步队列，首先判断优先级Promise > MutationObserver > setImmediate > setTimeout
    if (window.Promise) {
      Promise.resolve().then(flushCallbacks);
    } else if (typeof setImmediate !== 'undefined') {
      setImmediate(flushCallbacks);
    } else {
      setTimeout(flushCallbacks);
    }
  }
}

/**
 *
 *
 * @param {*} callbacks
 */
function flushCallbacks() {
  // 表示浏览器任务队列中的 flushCallbacks 函数已经被拿到执行栈执行了
  // 新的 flushCallbacks 函数可以进入浏览器的异步任务队列了
  pending = false;

  for (let index = 0; index < callbacks.length; index++) {
    // 执行回调函数
    callbacks[index]();
  }
}
