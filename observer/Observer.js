import defineReactive from './defineReactive.js';
import observer from './observe.js';
import Dep from './Dep.js';
import { arrProto } from './arrary.js';
//设置对象的特殊值
export function def(obj, key, value) {
  Object.defineProperty(obj, key, {
    value,
    enumerable: false,
    configurable: true,
    writable: true,
  });
}

// Observer 类的作用：将遍历对象每个属性都是响应式
export default class Observer {
  constructor(value) {
    this.dep = new Dep();

    def(value, '__ob__', this);

    if (Array.isArray(value)) {
      Object.setPrototypeOf(value, arrProto);
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }
  //遍历处理对象每个属性
  walk(value) {
    let keys = Object.keys(value);
    for (let key of keys) {
      defineReactive(value, key);
    }
  }
  // 处理数组项中是对象的响应式
  observeArray(array) {
    for (let i = 0, len = array.length; i < len; i++) {
      observer(array[i]);
    }
  }
}
