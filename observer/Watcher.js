import Dep, { pushStack, popStack } from './Dep.js';
let id = 0;

/**
 *
 *
 * @export
 * @constructor
 * @class Watcher
 */
export default class Watcher {
  constructor(vm = null, expOrFn, options = {}, userCb) {
    // 上次dep数组
    this.deps = [];
    // 这次dep数组
    this.newDeps = [];
    // Vue 实例
    this.vm = vm;
    // watcher的id
    this.id = id++;
    // 当为渲染watcher时，用户watcher的回调函数为空函数
    this.userCb = userCb ? userCb : () => {};
    if (options) {
      this.deep = !!options.deep;
      //当时computed Watcher时 lazy，dirty为true
      this.lazy = !!options.lazy;
      // computed 计算属性实现缓存的原理，标记当前回调函数在本次渲染周期内是否已经被执行过
      this.dirty = this.lazy; // for lazy watchers
    } else {
      this.deep = this.lazy = this.dirty = this.user = false;
    }

    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath(expOrFn);
    }
    // 组件渲染时初始化的回调函数
    // 非懒执行时，直接执行 cb 函数，cb 函数中会发生 vm.xx 的属性读取，从而进行依赖收集
    this.value = options.lazy ? undefined : this.get();
  }

  /**
   *负责执行Watcher的回调函数
   *执行时会读取数据，进行依赖收集
   *
   * @return {*}
   * @memberof Watcher
   */
  get() {
    // 存储所有的 Dep.target
    // 为什么会有多个 Dep.target?
    // 组件会产生一个渲染 Watcher，在渲染的过程中如果处理到用户 Watcher，computed watcher，
    // 比如 computed 计算属性，这时候会执行 evalute -> get
    // 假如直接赋值 Dep.target，那 Dep.target 的上一个值 —— 渲染 Watcher 就会丢失
    // 造成在 computed 计算属性之后渲染的响应式数据无法完成依赖收集
    pushStack(this);
    // Dep.target = this;

    // 执行回调函数，比如渲染watcher的回调函数updateComponent，进入 patch 阶段
    let value = this.getter.call(this.vm, this.vm);
    //把之前的computed watcher弹出 剩下栈顶的就是渲染watcher
    popStack();
    // Dep.target = null;

    if (this.deep) {
      //递归遍历
      traverse(value);
    }
    // 清除依赖
    this.cleanupDeps();

    return value;
  }

  /**
   * 负责执行computed watcher的回调函数
   * @memberof Watcher
   */
  evalute() {
    // 执行get 触发计算属性的函数
    this.value = this.get();
    // 将 dirty 置为 false，实现一次刷新周期内 computed 实现缓存
    this.dirty = false;
  }

  /**
   * 响应式数据更新时，dep 通知 watcher 执行 update 方法，
   * 让 update 方法执行 this.get函数更新 DOM
   * @memberof Watcher
   */
  update() {
    // 通过 Promise，将 this._cb 的执行放到 this.dirty = true 的后面
    // 否则，在点击按钮时，computed 属性的第一次计算会无法执行，
    // 因为 this._cb 执行的时候，会更新组件，获取计算属性的值的时候 this.dirty 依然是
    // 上一次的 false，导致无法得到最新的的计算属性的值
    // 不过这个在有了异步更新队列之后就不需要了，当然，毕竟异步更新对象的本质也是 Promise

    if (this.lazy) {
      // 执行完 _cb 函数，DOM 更新完毕，进入下一个渲染周期，所以将 dirty 置为 false
      // 当再次获取 计算属性 时就可以重新执行 evalute 方法获取最新的值了
      this.dirty = true;
    } else {
      // 更新时一般都这里(渲染watcher)，将 watcher 放入 watcher 队列
      queueWatcher(this); //将当前watcher放入异步更新队列
    }
  }

  /**
   *负责执行渲染watcher（和用户warcher）的回调函数（data）
   * 由 刷新队列函数 flushSchedulerQueue 调用，完成如下几件事：
   *   1、执行实例化 watcher 传递的第二个参数，updateComponent 或者 获取 this.xx 的一个函数(parsePath 返回的函数)
   *   2、更新旧值为新值
   *   3、执行实例化 watcher 时传递的第三个参数，比如用户 watcher 的回调函数
   */
  run() {
    //由刷新 watcher 队列的函数（渲染 watcher ）调用，负责执行 watcher.get 方法
    //那么对于渲染 watcher 而言，它在执行 this.get() 方法求值的时候，会执行 getter 方法
    const value = this.get();

    // 如果满足新旧值不等、新值是对象类型、deep 模式任何一个条件，则执行 watcher 的回调
    if (value !== this.value || this.deep || typeof value === 'object') {
      // set new value
      const oldValue = this.value;
      this.value = value;
      // 如果是用户 watcher，则执行用户传递的第三个参数 —— 回调函数，参数为 val 和 oldVal
      if (this.user) {
        this.userCb.call(this.vm, value, oldValue);
      } else {
        // 渲染 watcher，this.userCb = noop，一个空函数
        this.userCb.call(this.vm, value, oldValue);
      }
    }
  }

  addDep(dep) {
    // dep添加到watcher
    this.deps.push(dep);
    // watcher添加到dep
    dep.addSub(this);
  }

  // 删除无用的依赖
  cleanupDeps() {
    let i = this.deps.length;
    while (i--) {
      const dep = this.deps[i];
      // 发现有些dep在上次求值时收集了自己，但是这次求值时没有收集自己，说明该数据已经不需要自己了，将自己从dep中删除即可
      if (!this.newDeps.includes(dep.id)) {
        dep.removeSub(this);
      }
    }
  }
}

/**
 *
 *解析深层次的对象的值 a.b.c的值
 * @export
 * @param {*} path
 * @return {*}
 */
export function parsePath(path) {
  const segments = path.split('.');

  return function (vm) {
    for (let i = 0; i < segments.length; i++) {
      if (!vm) return;
      vm = vm[segments[i]];
    }
    return vm;
  };
}
