/**
 * 手写instanceof
 * 1、获取类型的原型
 * 2、获取对象的原型
 * 3、一直循环判断对象的原型是否等于类型的原型，直到对象的原型为null，因为原型链最重为null
 * @param {*} left  对象的原型
 * @param {*} right 类型的原型
 * @returns 
 */
function myInstanceof(left, right) {
    while (true) {
      if (left === null || left === undefined) {
        return false;
      }
      if (left.__proto__ === right.prototype) {
        return true;
      }
      left = left.__proto__;
    }
}
let fn = () => {
    console.log('aaa')
}
console.log(myInstanceof(fn,Function), 'function');
console.log(myInstanceof('aaa',String), '--->string');
console.log(myInstanceof(1111,String), '--->number');
