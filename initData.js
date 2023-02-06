import proxy from './proxy.js';

export default function initData(vm) {
  const _data = vm.$options.data;
  if (!_data) vm._data = {};
  if (typeof _data === 'function') {
    vm._data = _data.call(vm);
  } else {
    vm._data = _data;
  }

  for (let key in vm._data) {
    if (vm._data.hasOwnProperty(key)) {
      proxy(vm, '_data', key);
    }
  }
}
