/*
 * @Author: your name
 * @Date: 2022-01-05 11:54:00
 * @LastEditTime: 2022-01-05 14:26:48
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \vue3.0-cli-ts\面试\vue2响应式\compiler\compileAttrs.js
 */
import Watcher from '../observer/Watcher.js';

export default function compileAttrs(node, vm) {
  const attrs = [...node.attributes];
  for (let attr of attrs) {
    const { name, value } = attr;
    if (name.match(/v\-bind\:/)) {
      compileOnClick(node, value, vm);
    }
    if (name.match(/v-on:click/)) {
      compileBind(node, name, value, vm);
    }
    if (name.match(/v-model/)) {
      compileModel(node, value, vm);
    }
  }
}

function compileOnClick(node, value, vm) {
  node.addEventListener('click', function (...args) {
    vm.$options.methods[value].apply(vm, args);
  });
}

function compileBind(node, name, value, vm) {
  node.removeAttribute(name);
  const attrName = name.replace(/v\-bind\:/, '');
  function cb() {
    node.setAttribute(attrName, vm[value]);
  }
  new Watcher(vm, cb);
}

function compileModel(node, value, vm) {
  let { tagName, type } = node;
  tagName = tagName.toLowerCase();

  if ((tagName == 'input' && type === 'text') || tagName == 'select') {
    node.value = vm[value];
    node.addEventListener('input', function (...args) {
      vm[value] = node.value;
    });
  } else if (tagName == 'input' && type === 'checkbox') {
    node.checked = vm[value];
    node.addEventListener('input', function (...args) {
      vm[value] = node.checked;
    });
  }
}
