/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
 var twoSum = function(nums, target) {
    map = new Map()
    for(let i = 0; i < nums.length; i++) {
        x = target - nums[i]
        if(map.has(x)) {
            return [map.get(x),i]
        }
        map.set(nums[i],i)
    }
};

let nums = [2,7,11,15], target = 9
console.log(twoSum(nums,9));