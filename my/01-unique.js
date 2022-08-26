/**
 * instanceof
 */

class Person {
  
}

let p1 = new Person()

function my_instanceOf(leftVal, rightVal){
    let rightProto = rightVal.prototype;
    leftVal = leftVal.__proto__;
    while(true){
        if(leftVal === null){
            return false
        }
        if(leftVal === rightProto){
            return true
        }
        leftVal = leftVal.__proto__;
    }
}
// console.log(my_instanceOf(p1, Person));
// console.log(my_instanceOf('111', Number));

/**
 * 数组去重
 */

function unique(arr){
    if(!Array.isArray(arr)){
        throw Error('arr 必须是个数组')
    }
    let data = []
    for(let i=0; i< arr.length; i++){
        if(data.indexOf(arr[i]) === -1){
            data.push(arr[i])
        }
    }
    return data
}
let arr = [1,2,3,1,2,5,6]
function unique1(arr) {
    if (!Array.isArray(arr)) {
        console.log('type error!')
        return;
    }
    arr = arr.sort()
    var arrry= [arr[0]];
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] !== arr[i-1]) {
            arrry.push(arr[i]);
        }
    }
    return arrry;
}
// console.log(unique(arr), '---->indexOf');
// console.log(Array.from(new Set(arr)), '-----> new Set');
// console.log(unique1(arr), '---->sort');

let al1 = {
    length: 4,
    0: 0,
    1: 1,
    3: 3,
    4: 4,
    5: 5,
};
console.log(Array.from(al1)) // [0, 1, undefined, 3]