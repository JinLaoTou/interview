/**
 * 数组扁平化
 * @param {*} arr 
 */
 let arr = [1, [2, [3, 4],[5]]];
 function flatten(arr) {
     return arr.reduce(function(pre, cur){
         return pre.concat(Array.isArray(cur) ? flatten(cur) : cur)
     }, [])
 }
 console.log(flatten(arr));//  [1, 2, 3, 4，5]