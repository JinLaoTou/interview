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
//  console.log(flatten(arr));//  [1, 2, 3, 4，5]

/**
 * 手写filter
 * @param {*} fn 
 * @returns 
 * ① 传入一个function作为回调
 * ② 返回一个新数组
 * ③ 回调的参数分别为原数组元素、索引值、原数组，需要有返回值作为判断条件
 * ④ 为tru时会将当前元素放入新数组中
 */
 Array.prototype.filter = function (fn) {
    const length = this.length
    const arr = []
    for (let i = 0; i < length; i++) {
      if (fn(this[i], i, this)) {
        arr.push(this[i])
      }
    }
    return arr
  } 
  // filter // 方法
function filter(arr,callback) {
  let flag = !Array.isArray(arr) || !arr.length || typeof callback !=='function'
if(flag){
  return []
}else{
  let newArr = []
  for (let index = 0; index < arr.length; index++) {
       if(callback(arr[index],index,arr)){
         newArr.push(arr[index])
       }
    
  }
  return newArr
}
  
}
console.log(filter(allArr,(item)=>item>2))
//   const newArr = [1, 2, 3].filter((item, i, arr) => {
//     return item > 1
//   })
//   console.log(newArr,'---->newArr');
// [2, 3] 

/**
 * 手写map
 * @param {*} fn 
 * @returns 
 * ① 大致上与filter一样，传入回调，回调的参数均是元素、索引值、原数组
 * ② 不同之处在于map中会将回调的返回值放入到新数组中
 */
Array.prototype.map = function (fn) {
    const length = this.length
    const arr = []
    for (let i = 0; i < length; i++) {
        arr.push(fn(this[i], i, this))
    }
    return arr
} 
  const newArr = [1, 2, 3].map((e, i, arr) => e+1)
  console.log(newArr);
// [1, 2, 3] 

/**
 * 手写reduce
 * @param {*} reducer 
 * @param {*} initVal 
 * @returns 
 */
Array.prototype.reduce = function (reducer,initVal) {
  for(let i=0;i<this.length;i++){
      initVal =reducer(initVal,this[i],i,this);
  }
  return initVal
};
