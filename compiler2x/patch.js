/*
 * @Author: your name
 * @Date: 2022-01-06 15:27:02
 * @LastEditTime: 2022-01-07 17:58:36
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \vue3.0-cli-ts\面试\vue2响应式\compiler2x\patch.js
 */

/**
 *负责初次渲染模板和后续模板的更新
 *
 * @export
 * @param {*} oldvnode
 * @param {*} vnode
 */
export default function patch(oldvnode, vnode) {
  // 老节点存在，新节点不存在，则销毁组件
  if (oldvnode && !vnode) {
    return;
  }
  //子组件首次渲染时，通过的template生产的渲染函数,不是通过el，此时this.&el为undefined，说明是子组件首次渲染
  if (!oldvnode) {
    // oldVnode 不存在，说明是子组件首次渲染
    createElm(vnode);
  } else {
    if (oldvnode.nodeType) {
      //说明是真实节点，表示首次渲染根组件 app
      const parent = oldvnode.parentNode; //父节点
      const referNode = oldvnode.nextSibling; //参考节点是第一个script nextSibling 属性返回指定节点之后紧跟的节点，在相同的树层级中。
      //创建元素，将vnode变成真实节点，并添加到父节点中
      createElm(vnode, parent, referNode);
      //移除老的节点
      parent.removeChild(oldvnode);
    } else {
      //后续更新操作

      patchVnode(oldvnode, vnode);
    }
  }
  //返回vnode的真实节点
  return vnode.elm;
}

/**
 *
 *
 * @param {*} vnode 虚拟dom
 * @param {*} parent 真实父节点
 * @param {*} referNode 挂载的参考节点
 */
function createElm(vnode, parent, referNode) {
  //记录Vnode的父节点 在子组件中会用到
  vnode.parent = parent;

  // 创建自定义组件，如果是非组件，则会继续后面的流程
  if (createComponent(vnode)) return;

  // 走到这里说明是原生标签,不是自定义组件
  const { tag, attr, children, text } = vnode;
  //有文本节点
  if (text) {
    // 创建文本节点，并插入到父节点内
    vnode.elm = createTextNode(vnode);
  } else {
    //根据vnode元素名创建真实节点
    vnode.elm = document.createElement(tag);
    //给元素设置属性
    setAttribute(attr, vnode);
    // 递归循环创建子节点
    for (let i = 0, len = children.length; i < len; i++) {
      createElm(children[i], vnode.elm);
    }
  }
  // 节点创建完毕,将其插入到父节点中（创建子组件Vnode没传parent选项）
  if (parent) {
    const elm = vnode.elm;
    if (referNode) {
      // 插入到referNode（script）标签之前
      parent.insertBefore(elm, referNode);
    } else {
      // 插入到父节点后面（一般情况都是body）
      parent.appendChild(elm);
    }
  }
}

/**
 *创建自定义组件
 *
 * @param {*} vnode <cmp></cmp> 一个标签就可以是一个vnode
 */
function createComponent(vnode) {
  //判断标签名是否为原生保留标签
  if (vnode.tag && !isRseverTag(vnode.tag)) {
    //获取组件基本配置信息 Vue源码中通过Vue.extend实现
    const {
      tag,
      context: { $options },
    } = vnode;
    // 组件项
    const { components } = $options;
    // 获取子组件配置项
    const componentOptions = components[tag];
    // 实例化子组件
    const compVm = new Vue(componentOptions);
    //把父组件的vnode放到子组件的实例上
    // compVm._parentVnode = vnode
    //手动执行挂载
    compVm.$mount();
    // 将父组件的vnode放到子组件的实例中（因为插槽信息记录在父组件vnode中）
    compVm._vnodeParent = vnode;
    //_vnode.是子组件的内部div的vnode  vnode是当前整个子组件cmp的vnode

    //将子组件挂载到父组件上
    vnode.parent.appendChild(compVm._vnode.elm);
    //删除不是原生的标签 cmp
    vnode.parent.removeChild(tag);
    // 表示是子组件
    return true;
  }
}
/**
 *判断标签名是否为原生保留标签
 *
 * @param {*} tagName
 */
function isRseverTag(tagName) {
  const rseverTagArr = [
    'template',
    'div',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'span',
    'input',
    'select',
    'textarea',
    'option',
    'i',
    'img',
    'ul',
    'ol',
    'li',
  ];
  return rseverTagArr.includes(tagName);
}

/**
 *创建文本节点
 *
 */
function createTextNode(textVnode) {
  // text为文本节点ast对象
  let { text } = textVnode,
    textNode = null;
  //说明当前文本节点有表达式 即响应式数据
  if (text.expression) {
    // textVnode.context表示当前vue实例
    let value = textVnode.context[text.expression];
    textNode = document.createTextNode(typeof value === 'object' ? JSON.stringify(value) : value);
  } else {
    //纯文本节点
    textNode = document.createTextNode(text.text);
  }
  return textNode;
}

/**
 *给元素设置属性
 *
 */
function setAttribute(attr, vnode) {
  for (let name in attr) {
    if (attr.hasOwnProperty(name)) {
      if (name === 'vModel') {
        //处理v-model指令
        setVmodel(vnode.tag, attr.vModel.value, vnode, vnode.elm.type);
      } else if (name === 'vBind') {
        //处理v-bind指令
        setVbind(vnode);
      } else if (name === 'vOn') {
        //处理v-on指令
        setVon(vnode);
      } else {
        ////处理其他普通元素属性，直接设置
        // vnode.elm是创建的真实元素
        vnode.elm.setAttribute(name, attr[name]);
      }
    }
  }
}

/**
 *
 *v-model 的原理
 * @param {*} tag 节点的标签名
 * @param {*} value 属性值
 * @param {*} node 节点
 * @param {*} type input类型
 */
function setVmodel(tag, value, vnode, type) {
  // elm：真实dom vm：Vue实例
  const { elm, context: vm } = vnode;
  //下拉框
  if (tag === 'select') {
    Promise.resolve().then(() => {
      // 利用 promise 延迟设置，直接设置不行，
      // 因为这会儿 option 元素还没创建
      elm.value = vm[value];
    });
    elm.addEventListener('change', function () {
      vm[value] = elm.value;
    });
  } else if (tag === 'input' && (type === 'text' || type === 'number')) {
    //input标签
    elm.value = vm[value];
    elm.addEventListener('input', function () {
      vm[value] = elm.value;
    });
  } else if (tag === 'input' && type === 'checkbox') {
    //复选框标签
    elm.checked = vm[value];
    elm.addEventListener('change', function () {
      vm[value] = elm.checked;
    });
  }
}

/**
 * v-bind 原理
 * @param {*} vnode
 * @return viod
 */
function setVbind(vnode) {
  const {
    attr: { vBind },
    elm,
    context: vm,
  } = vnode;
  for (let name in vBind) {
    if (!vBind.hasOwnProperty(name)) return;
    //设置标准属性
    elm.setAttribute(name, vm[vBind[name]]);
    //删除<div v-bind:title="title">
    elm.removeAttribute(`v-bind:${name}`);
  }
}

/**
 * v-on 原理
 * @param {*} vnode
 */
function setVon(vnode) {
  const {
    attr: { vOn },
    elm,
    context: vm,
  } = vnode;

  for (let name in vOn) {
    if (!vOn.hasOwnProperty(name)) return;
    elm.addEventListener(name, function (...args) {
      vm.$options.methods[vOn[name]].apply(vm, args);
    });
  }
}

/**
 * 对比新老节点，找出其中的不同，然后更新老节点
 * @param {*} oldVnode 老节点的 vnode
 * @param {*} vnode 新节点的 vnode
 */
function patchVnode(oldVnode, vnode) {
  // 如果新老节点相同，则直接结束
  if (oldVnode === vnode) return;
  // 将老 vnode 上的真实节点同步到新的 vnode 上，否则，后续更新的时候会出现 vnode.elm 为空的现象
  vnode.elm = oldVnode.elm;
  // 走到这里说明新老节点不一样，则获取它们的孩子节点，比较孩子节点
  const ch = vnode.children;
  const oldCh = oldVnode.children;

  // 新节点不存在文本节点就是说存在children（children跟文本只能存在一种）
  if (!vnode.text) {
    if (ch && oldCh) {
      // 说明新老节点都有孩子   diff算法
      updateChildren(ch, oldCh);
    } else if (ch) {
      // 老节点没孩子，新节点有孩子
    } else if (oldCh) {
      // 新节点没孩子，老节点有孩子
    }
  } else {
    // 新节点存在文本节点
    if (vnode.text.expression) {
      // 说明存在表达式
      // 获取表达式的新值
      const value = JSON.stringify(vnode.context[vnode.text.expression]);
      // 旧值
      try {
        const oldValue = oldVnode.elm.textContent;
        if (value !== oldValue) {
          // 新老值不一样，则更新
          oldVnode.elm.textContent = value;
        }
      } catch {
        // 防止更新时遇到插槽，导致报错
        // 目前不处理插槽数据的响应式更新
      }
    }
  }
}

/**
 * diff，比对孩子节点，找出不同点，然后将不同点更新到老节点上
 * @param {*} ch 新 vnode 的所有孩子节点
 * @param {*} oldCh 老 vnode 的所有孩子节点
 */
function updateChildren(ch, oldCh) {
  // 四个游标位置
  // 新孩子节点的开始索引，
  let newStartIdx = 0;
  // 新结束节点的借宿索引，
  let newEndIdx = ch.length - 1;
  // 老孩子节点的开始索引，
  let oldStartIdx = 0;
  // 老孩子节点的结束索引，
  let oldEndIdx = oldCh.length - 1;
  // 循环遍历新老节点，找出节点中不一样的地方，然后更新
  // 根为 web 中的 DOM 操作特点，做了四种假设，降低时间复杂度
  while (newStartIdx <= newEndIdx || oldStartIdx <= oldEndIdx) {
    //oldCh => a b c d
    //ch =>    a b c d e
    // 新开始节点
    const newStartNode = ch[newStartIdx];
    // 新结束节点
    const newEndNode = ch[newEndIdx];
    // 老开始节点
    const oldStartNode = oldCh[oldStartIdx];
    // 老结束节点
    const oldEndNode = oldCh[oldEndIdx];

    /**
     * 假设web中常见的4中情况
     */
    if (sameVnode(newStartNode, oldStartNode)) {
      // 假设新开始和老开始是同一个节点
      // 对比这两个节点，找出不同然后更新
      patchVnode(oldStartNode, newStartNode);
      // 移动游标
      oldStartIdx++;
      newStartIdx++;
    } else if (sameVnode(newStartNode, oldEndNode)) {
      // 假设新开始和老结束是同一个节点
      patchVnode(oldEndNode, newStartNode);
      // 将老结束移动到新开始的位置
      oldEndNode.elm.parentNode.insertBefore(oldEndNode.elm, oldCh[newStartIdx].elm);
      // 移动游标
      newStartIdx++;
      oldEndIdx--;
    } else if (sameVnode(newEndNode, oldStartNode)) {
      // 假设新结束和老开始是同一个节点
      patchVnode(oldStartNode, newEndNode);
      // 将老开始移动到新结束的位置
      oldStartNode.elm.parentNode.insertBefore(oldStartNode.elm, oldCh[newEndIdx].elm.nextSibling);
      // 移动游标
      newEndIdx--;
      oldStartIdx++;
    } else if (sameVnode(newEndNode, oldEndNode)) {
      // 假设新结束和老结束是同一个节点
      patchVnode(oldEndNode, newEndNode);
      // 移动游标
      newEndIdx--;
      oldEndIdx--;
    } else {
      // 上面几种假设都没命中，则老老实的遍历，找到那个相同元素
      //比如从老节点中找出新节点对应的那个节点，然后更新
    }
  }

  // 跳出循环，说明有一个节点首先遍历结束了
  if (newStartIdx < newEndIdx) {
    // 说明老节点先遍历结束，则将剩余的新节点添加到 DOM 中
  }
  if (oldStartIdx < oldEndIdx) {
    // 说明新节点先遍历结束，则将剩余的这些老节点从 DOM 中删掉
  }
}

/**
 *
 *
 * @param {*} a
 * @param {*} b
 */
function sameVnode(a, b) {
  //假如不提供key 则是undefined===undefined为true
  return a.key === b.key && a.tag === b.tag;
}

function setVshow(vnode) {}
