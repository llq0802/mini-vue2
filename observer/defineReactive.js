import observer from './observe.js';
import Dep from './Dep.js';

export default function defineReactive(targetObj, key, val = targetObj[key]) {
  const dep = new Dep();
  let childOb = observer(val);

  Object.defineProperty(targetObj, key, {
    configurable: true,
    enumerable: true,
    get() {
      // 初始化访问数据时，收集依赖（watcher）
      if (Dep.target) {
        dep.depend();

        //如果值还是对象
        if (childOb) {
          // 收集此数据的依赖（watcher）
          childOb.dep.depend();
          //如果是数组 遍历数组 收集每一项数据的依赖（watcher）
          if (Array.isArray(val)) {
            dependArray(val);
          }
        }
      }
      return val;
    },
    set(newValue) {
      if (newValue === val) return;
      childOb = observer(val);
      val = newValue;
      dep.notify();
    },
  });
}

function dependArray(array) {
  for (let value, i = 0, l = array.length; i < l; i++) {
    value = array[i];
    // 当数组中是对象或者数组的元素才触发
    value && value.__ob__ && value.__ob__.dep.depend();
    if (Array.isArray(value)) {
      dependArray(value);
    }
  }
}
