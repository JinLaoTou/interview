/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
 var twoSum = function(nums, target) {
    map = new Map()
    for(let i = 0; i < nums.length; i++) {
        x = target - nums[i]//找出差值
        if(map.has(x)) {//寻找map里面是否有差值
            return [map.get(x),i]//
        }
        map.set(nums[i],i)//map里面没有差值，设置当前元素
    }
};

let nums = [2,7,11,15], target = 9
console.log(twoSum(nums,9));