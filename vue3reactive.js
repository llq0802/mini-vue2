/*
 * @Author: your name
 * @Date: 2021-08-13 16:28:06
 * @LastEditTime: 2022-01-06 16:22:05
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \vue3.0-cli-ts\study-every-day\vue3reactive.js
 */


let toProxy = new WeakMap();  
let toRaw = new WeakMap();

function isObject(targetObj){
 return Object.prototype.toString.call(targetObj).slice(8, -1) !== "Object"
}

function isOwn(targetObj,key){
 return targetObj.hasOwnProperty(key)

}

function reactive(targetObj) {
  return createReavtiveObj(targetObj);
}

function createReavtiveObj(targetObj) {
  if (!isObject(targetObj)) {
    return targetObj;
  }

  let p = toProxy.get(targetObj)
  if(p){
    return p
  }
  if(toRaw.has(targetObj)){
    return targetObj
  }

  let baseHandler = {
    get(targetObj, key) {
      console.log("获取");
      let reslut=  Reflect.get(targetObj, key);
      return isObject(reslut) ?  reactive(reslut):reslut //递归
    },
    set(targetObj, key, value) {

      //判断是新增还是修改
      let isAdd =  isOwn(targetObj,key)
       let oldValue =  Reflect.get(targetObj, key);
      if(isAdd){
        console.log("新设置");

      } else if(oldValue!==value){
        console.log("修改设置");

      }
      return Reflect.set(targetObj, key,value);
    },
    deleteProperty(targetObj, key) {
      console.log("delete");

      return Reflect.delete(targetObj, key);
    },
  },
  
  let proxy= Proxy(targetObj, baseHandler);
  toProxy.get(targetObj,proxy)
  toRaw.get(proxy,targetObj)
  return proxy;
}

let data = reactive({
  name: "llq",
  age: 20,
  id: 1,
});

// data.name = "aa";
delete data.name;
//你好@
//vue3