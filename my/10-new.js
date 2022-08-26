/**
 * 手写new
 * 1、新生成一个对象
 * 2、连接到原型
 * 3、绑定this
 * 4、返回新对象
 * @param {*} fn 
 * @param  {...any} args 
 */
function myNew(fn, ...args){
    // 先创建一个对象，并且把函数的原型赋值给这个对象
    let obj = Object.create(fn.prototype)
    // 改变this指向
    let res = fn.call(obj, ...args)
    // 判断res的类型
    if(res && (typeof res === 'object' || typeof res === 'function')){
        return res
    }
    return obj
}

function Person(age, sex){
    this.age = age
    this.sex = sex
}

Person.prototype.getSex = function(){
    console.log(this.age);
}

let p1 = myNew(Person, 25, '女')
console.log(p1, p1.age);
p1.getSex()