import { def } from './Observer.js';
let methodsArray = ['push', 'shift', 'pop', 'unshift', 'splice', 'sort', 'reverse'];
export const arrProto = Object.create(Array.prototype);

methodsArray.forEach((method) => {
  const fn = arrProto[method];
  def(arrProto, method, function (...args) {
    let result = fn.call(this, ...args); //这里的this 指向的是调用方法的数组
    //this中肯定有__ob__ 因为数组不可能是第一次遍历，当递归遍历的时候为对象每个属性都添加__ob__ 值 及为Observe实例
    const ob = this.__ob__;
    let inserted; //当数组插入是用这几个方法 同时遍历响应新插入的数据的响应式获取到插入的值，然后把新添加的值变成一个响应式对象
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }
    if (inserted) ob.observeArray(inserted); //此时新插入的值被是数组，则开启数组的响应式监听
    //派发通知
    ob.dep.notify();
    return result;
  });
});
