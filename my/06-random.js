function testArr(arr, n, min, max){
    let num = Math.floor(Math.random() * (max-min+1))+min
    if(!arr.includes(num)){
        arr.push(num)
    }

    return arr.length === n ? arr : testArr(arr, n, min, max)
}

let result = testArr([], 20, 3, 40)
console.log(result);