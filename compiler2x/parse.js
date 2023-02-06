/*
 * @Author: your name
 * @Date: 2022-01-05 17:51:58
 * @LastEditTime: 2022-01-12 17:25:45
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \vue3.0-cli-ts\面试\vue2响应式\compiler2x\parse.js
 */

/**
 *将template转化成ast对象
 *
 * @export
 * @param {*} template
 * @return {*} ast
 */
export default function parse(template) {
  let root = null; //最终返回的ast
  let html = template;
  /// 存放所有的未配对的开始标签的 AST 对象，当遇到闭合标签就从栈顶元素弹出来 里面的内容就是这对标签的children
  let stack = [];
  while (html.trim()) {
    // 过滤注释标签  <!--xxx-->
    if (html.indexOf('<!--') === 0) {
      // 说明开始位置是一个注释标签，截取忽略掉
      html = html.slice(html.indexOf('-->') + 3);
      continue;
    }
    // const startIdx = html.match(/</).index
    const startIdx = html.indexOf('<');
    //匹配到开始标签
    if (startIdx === 0) {
      if (html.indexOf('</') === 0) {
        // 说明是闭合标签 </ hr>
        parseEnd();
      } else {
        // 处理开始标签中的属性
        parseStartTag();
      }
    } else if (startIdx > 0) {
      //处理文本节点 <div class="app" index=0>xxxxxx</div>
      // 说明在开始标签之间有一段文本内容，在 html 中找到下一个标签的开始位置
      const nextStartIdx = html.indexOf('<');
      // 如果栈为空，则说明这段文本不属于任何一个元素，直接丢掉，不做处理
      if (stack.length) {
        // 走到这里说说明栈不为空，这段文本为栈顶元素的内容，并将其放到栈顶元素的肚子里
        let text = html.slice(0, nextStartIdx);
        processText(text);
      }
      //不管stack为不为空都要截断html
      html = html.slice(nextStartIdx);
    } else {
      // 说明没有匹配到开始标签，整个 html 就是一段文本
      throw new Error('整个 html 不能是一段文本');
    }
  }
  return root;

  /**
   * 解析开始标签
   * 比如： <div id="app">...</div>
   */
  function parseStartTag() {
    // 先找到开始标签的结束位置 >  <div class="app" index=0>xxxxxx</div>
    const endIdx = html.indexOf('>');
    // 解析开始标签里的内容 <内容>，标签名 + 属性，比如: div id="app"
    const content = html.slice(1, endIdx);
    // 截断 html，将上面解析的内容从 html 字符串中删除
    html = html.slice(endIdx + 1);
    // 找到 第一个空格位置
    const firstSpaceIdx = content.indexOf(' ');
    // 标签名和属性字符串
    let tagName = '',
      attrsStr = '';
    if (firstSpaceIdx === -1) {
      // 没有空格，则认为 content 就是标签名，比如 <h3></h3> 这种情况，content = h3
      tagName = content;
      // 没有属性
      attrsStr = '';
    } else {
      tagName = content.slice(0, firstSpaceIdx);
      // content 的剩下的内容就都是属性了，比如 id="app" xx=xx
      attrsStr = content.slice(firstSpaceIdx + 1);
    }
    // 得到属性数组，[id="app", xx='xx']
    const attrs = attrsStr ? attrsStr.split(' ') : [];
    // 进一步解析属性数组，得到一个 Map 对象
    const attrMap = parseAttrs(attrs);
    // 生成 AST 对象
    const elementAst = generateAST(tagName, attrMap);
    // 如果根节点不存在，说明当前节点为整个模版的第一个节点
    if (!root) {
      root = elementAst;
    }
    // 将 ast 对象 push 到栈中，当遇到结束标签的时候就将栈顶的 ast 对象 pop 出来，它两就是一对标签
    stack.push(elementAst);
    // 自闭合标签，则直接调用 end 方法，进入闭合标签的处理截断，就不入栈了
    if (isUnaryTag(tagName)) {
      processElement();
    }
  }

  /**
   * 处理元素的闭合标签时会调用该方法
   * 进一步处理元素上的各个属性，将处理结果放到 attr 属性上
   *
   */
  function processElement() {
    // 弹出栈顶元素，进一步处理该元素
    const curEle = stack.pop();
    //  {
    //   // 元素节点
    //   type: 1,
    //   // 标签
    //   tag: tagName,
    //   // 原始属性 map 对象，后续还需要进一步处理
    //   rawAttr: attrMap,
    //   // 子节点
    //   children: [],
    // };

    // 进一步处理 AST 对象中的 rawAttr 对象 { attrName: attrValue, ... }
    const { tag, rawAttr } = curEle;
    // 处理结果都放到 attr 对象上，并删掉 rawAttr 对象中相应的属性
    curEle.attr = {};
    // 属性对象的 key 组成的数组
    const propertyArr = Object.keys(rawAttr);
    if (propertyArr.includes('v-model')) {
      // 处理 v-model 指令
      processVModel(curEle);
    } else if (propertyArr.find((item) => item.match(/^v-bind:(.*)/))) {
      // 处理 v-bind 指令，比如 <span v-bind:test="xx" />
      processVBind(curEle, RegExp.$1, rawAttr[`v-bind:${RegExp.$1}`]);
    } else if (propertyArr.find((item) => item.match(/^v-on:(.*)/))) {
      // 处理 v-on 指令，比如 <button v-on:click="add"> add </button>
      processVOn(curEle, RegExp.$1, rawAttr[`v-on:${RegExp.$1}`]);
    }
    //处理插槽内容
    processSlotContent(curEle);

    // 节点处理完以后让其和父节点产生关系
    if (stack.length) {
      stack[stack.length - 1].children.push(curEle);
      // 当前节点的父节点 就是栈顶的元素
      curEle.parent = stack[stack.length - 1];

      // 如果节点存在 slotName，则说明该节点是组件传递给插槽的内容
      // 将插槽信息放到组件节点的 rawAttr.scopedSlots 对象上
      // 而这些信息在生成组件插槽的 VNode 时（renderSlot）会用到
      if (curEle.slotName) {
        //此时curEle指的是template
        const { parent, slotName, slotValue, children } = curEle;
        // 这里关于 children 的操作，只是单纯为了避开 JSON.stringify 的循环引用问题
        // 因为生成渲染函数时需要对 attr 执行 JSON.stringify 方法
        const slotInfo = {
          slotName,
          slotValue,
          //template的children
          children: children.map((item) => {
            //template的children
            delete item.parent;
            return item;
          }),
        };
        // 在template父节点的属性中保存插槽信息
        //  <cmp>
        //    <template v-slot:top="topValue">
        //       span
        //    </template>
        //  </cmp>
        if (parent.rawAttr.scopedSlots) {
          parent.rawAttr.slotInfo[curEle.slotName] = slotInfo;
        } else {
          parent.rawAttr.slotInfo = { [curEle.slotName]: slotInfo };
        }
      }
    }
  }

  /**
   * 处理结束标签，比如: <div id="app">...</div>
   */
  function parseEnd() {
    // 将结束标签从 html 字符串中截掉
    html = html.slice(html.indexOf('>') + 1);
    // 处理栈顶元素
    processElement();
  }

  /**
   *处理文本节点
   * @param {*} text
   */
  function processText(text) {
    if (text.trim()) {
      // 构造文本节点的 AST 对象
      const textAst = {
        type: 3,
        text,
      };
      if (text.match(/{{(.*)}}/)) {
        // 说明是表达式{{name}} 响应式数据
        textAst.expression = RegExp.$1.trim();
      }
      // 将 ast 放到栈顶元素的肚子里
      stack[stack.length - 1].children.push(textAst);
    }
  }
}

/**
 *
 *解析属性数组，得到一个属性 和 值组成的 Map 对象
 * @param {*} attrsArr
 * @return {*}
 */
function parseAttrs(attrsArr) {
  let obj = {};
  for (let attr of attrsArr) {
    //[id="app", xx=xx]
    let [attrName, attrValue] = attr.split('=');
    obj[attrName] = attrValue.replace(/\"|\'/g, '');
  }
  return obj;
}

/**
 *
 *生成 AST 对象
 * @return {*}
 */
function generateAST(tagName, attrMap) {
  return {
    // 元素节点
    type: 1,
    // 标签
    tag: tagName,
    // 原始属性 map 对象，后续还需要进一步处理
    rawAttr: attrMap,
    //父节点
    parent: null,
    // 子节点
    children: [],
  };
}
/**
 *判断标签是不是自闭和标签['input','textarea','hr','br']
 *
 * @param {*} tagName
 * @return {*}
 */
function isUnaryTag(tagName) {
  return ['input', 'textarea', 'hr', 'br', 'img'].includes(tagName);
}

/**
 *
 *处理v-model
 */
function processVModel(curEle) {
  const { tag, rawAttr, attr } = curEle;
  const { type, 'v-model': vModelVal } = rawAttr;

  if (tag === 'input') {
    if (/text/.test(type)) {
      // <input type="text" v-model="inputVal" />
      attr.vModel = { tag, type: 'text', value: vModelVal };
    } else if (/checkbox/.test(type)) {
      // <input type="checkbox" v-model="isChecked" />
      attr.vModel = { tag, type: 'checkbox', value: vModelVal };
    }
  } else if (tag === 'textarea') {
    // <textarea v-model="test" />
    attr.vModel = { tag, value: vModelVal };
  } else if (tag === 'select') {
    // <select v-model="selectedValue">...</select>
    attr.vModel = { tag, value: vModelVal };
  }
}
/**
 *
 *处理v-bind
 */
function processVBind(curEle, bindKey, bindVal) {
  const { attr } = curEle;
  attr.vBind = { [bindKey]: bindVal };
}
/**
 *
 *处理v-on
 */
function processVOn(curEle, vOnKey, vOnVal) {
  const { attr } = curEle;
  attr.vOn = { [vOnKey]: vOnVal };
}

/**
 * 处理插槽
 * <scope-slot>
 *   <template v-slot:default="scopeSlot">
 *     <div>{{ scopeSlot }}</div>
 *   </template>
 * </scope-slot>
 * @param {*} curEle 节点对象
 */
function processSlotContent(curEle) {
  // 注意，具有 v-slot:xx 属性的 template 只能是组件的根元素，这里不做判断
  if (curEle.tag === 'template') {
    // 获取插槽信息
    const rawAttr = curEle.rawAttr; // 属性 map 对象
    for (const key in rawAttr) {
      //遍历属性 map 对象，找出其中的 v-slot 指令信息
      if (!rawAttr.hasOwnProperty(key)) return;
      if (key.match(/v-slot:(.*)/)) {
        // 获取指令后的插槽名称和值，比如: v-slot:default=xx
        // default
        const slotName = (curEle.slotName = RegExp.$1);
        //获取插槽作用域的值
        curEle.slotValue = rawAttr[`v-slot:${slotName}`];
        // 直接 return，因为该标签上只可能有一个 v-slot 指令
        return;
      }
    }
  }
}
