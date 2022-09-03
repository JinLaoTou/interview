/**
 * 输出规定参数之间的不重复的随机数，给定长度
 * 20：长度，3-40之间的随机数
 * @param {*} arr 
 * @param {*} n 
 * @param {*} min 
 * @param {*} max 
 * @returns 
 */
function testArr(arr, n, min, max){
    let num = Math.floor(Math.random() * (max-min+1))+min
    if(!arr.includes(num)){
        arr.push(num)
    }

    return arr.length === n ? arr : testArr(arr, n, min, max)
}

let result = testArr([], 20, 3, 40)
console.log(result);