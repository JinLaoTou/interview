function isObject(val) {
    return typeof val === "object" && val !== null;
  }
  
  /**
   * 深复制: 考虑到复制 Symbol 类型
   * @param {*} obj 
   * @param {*} hash 
   * @returns 
   */
  function deepClone(obj, hash = new WeakMap()) {
    if (!isObject(obj)) return obj;
    // 如果obj在缓存器中
    if (hash.has(obj)) {
      return hash.get(obj);
    }
    console.log(hash.has(obj), '---->hash.has(obj)');
    let target = Array.isArray(obj) ? [] : {};
    // 缓存数据
    hash.set(obj, target);
    // Reflect.ownKeys方法用于返回对象的所有属性，基本等同于Object.getOwnPropertyNames与Object.getOwnPropertySymbols之和。
    Reflect.ownKeys(obj).forEach((item) => {
      if (isObject(obj[item])) {
        target[item] = deepClone(obj[item], hash);
      } else {
        target[item] = obj[item];
      }
    });
  
    return target;
  }
  
  var obj1 = {
  a:1,
  b:{a:2},
  ff:[10,20,30,4,[30,40]],
  fn: function(){
    console.log('aaa');
  }
  };
  var obj2 = deepClone(obj1);
  obj2.b.a = 100
  obj2.ff=[11]
  obj2.fn = function(){
    console.log('------');
  }
  console.log(obj1,obj2);
  obj1.fn()
  obj2.fn()