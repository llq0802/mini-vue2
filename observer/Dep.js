//订阅发布模式
let uid = 0;
export default class Dep {
  static target = null; //在同一时间只能有全局唯一的watcher（当实例化watcher时会将target赋值为当前watcher）
  constructor() {
    this.id = uid++;
    this.subs = []; //收集的依赖就是Watcher实例， 里面存放的是对象属性的绑定一个Watcher实例
  }
  // 收集依赖
  depend() {
    // Dep.target就是watcher 保存在Dep类中
    if (Dep.target) {
      // watcher添加dep
      Dep.target.addDep(this);
    }
  }
  // 添加watcher实例
  addSub(sub) {
    //防止重复收集watcher
    if (this.subs.includes(Dep.target)) return;
    this.subs.push(sub);
  }
  // 清空依赖的原因：
  /**当我们满足某种条件的时候渲染 a 的时候，会访问到 a 中的数据，
   * 这时候我们对 a 使用的数据添加了 getter，做了依赖收集，那么当我们去修改 a 的数据的时候，理应通知到这些订阅者。
   *如果我们一旦改变了条件渲染了 b 模板，又会对 b 使用的数据添加了 getter，
     如果我们没有依赖移除的过程，那么这时候我去修改 a 模板的数据，
    会通知 a 数据的订阅的回调，这显然是有浪费的。
   *
   */
  removeSub(watcher) {
    let index = this.subs.find(sub.id === watcher.id);
    index && this.subs.splice(index, 1);
  }

  //通知watcher实例更新
  notify() {
    const subs = [...this.subs];
    for (let i = 0, len = subs.length; i < len; i++) {
      subs[i].update();
    }
  }
}

//同一时间只会有一个 watcher 在执行，处理保证全局唯一的watcher，防止重复收集
//因为如果computed在data之前，computed中收集依赖后会导致watcher=null 进而后面data收集不到watcher
const targetStack = [];
export function pushStack(watcher) {
  targetStack.push(watcher);
  Dep.target = watcher;
}
export function popStack() {
  Dep.target = targetStack[targetStack.length - 1];
}
