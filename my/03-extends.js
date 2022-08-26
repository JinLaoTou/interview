/**
 * 原型链继承
 */
function Parent(){
    this.sex = '女';
    this.age = '24'
}

Parent.prototype.getSix = function(){
    console.log(this.sex, '---->sex');
}

function Child(){
}

// Child.prototype = new Parent()
// let child = new Child()
// child.getSix()
// console.log(child.age, '----->getSix');

/**
 * 构造函数继承
 */
function ParentConstructor(age, name){
    this.age = age
    this.name = name
    this.sayName = function(){
        console.log(this.name,'-----<name');
    }
}
ParentConstructor.prototype.getName = function(){
    console.log(this.name);
}
function ChildConstructor(age, name){
    ParentConstructor.call(this, age, name)
}
let child1 = new ChildConstructor(30, 'ssss')
// console.log(child1.age, '----->aaa');
// child1.sayName()
// child1.getName() //throw error

/**
 * 组合继承
 */

function CombinationParent(age, name){
    this.age = age
    this.name = name;
    this.getName = function(){
        console.log(this.name, '---->get Name');
    }
    this.arr = ['aaa']
}

CombinationParent.prototype.sayName = function(){
    console.log(this.name, '---->prototype name');
}
function CombinationChild(age, name){
    CombinationParent.call(this, age, name)
}

CombinationChild.prototype = new CombinationParent()
let child2 = new CombinationChild(40, '000')
// child2.getName()
// child2.sayName()

let aaa = new CombinationChild()
let bbb = new CombinationChild()
aaa.arr.push('bbbb')
// console.log(aaa.arr, bbb.arr, '---->b arr');

/**
 * 原型式继承
 */
let object = {
    list: ['aaaa'],
    names: 'test',
    sayName: function(data){
        console.log(data, '---->data');
    }
}
function prototypeFn(params){
    function Fn(){}
    Fn.prototype = params
    return new Fn()
}
/* 
寄生式继承
function createObject(obj) {
    var o = prototypeFn(obj);
    o.getNames = function() {
        console.log(this.names);
        return this.names;
    }
    return o;
} */
// 寄生式继承
// let child3 = createObject(object)
// let child3 = prototypeFn(object)
// child3.sayName('8888')
// child3.getNames()
// console.log(child3.list, '---->list');

/**
 * 寄生组合继承
 */

function LastParent(age, name){
    this.age = age;
    this.name = name;
    this.sayName = function(){
        console.log(this.name);
    }
}

function LastChild(age, name){
    LastParent.call(this, age, name)
}

// copy父元素
function copy(params){
    function Fn(){
    }
    Fn.prototype = params
    return new Fn()
}

function dellWidth(child, parent){
    let p = copy(parent.prototype)
    p.constructor = child
    child.constructor = p
}
 dellWidth(LastChild,LastParent)
 let child4 = new LastChild('aaaa', 10)
//  console.log(child4.name);
//  child4.sayName()