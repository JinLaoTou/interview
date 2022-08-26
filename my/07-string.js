/**
 * 获取字符串中无重复字符的最大长度
 * @param {*} s 
 * @returns 
 */
var lengthOfLongestSubstring = function(s) {
    var res = 0; // 用于存放当前最长无重复子串的长度
    var str = ""; // 用于存放无重复子串
    var len = s.length;
    for(var i = 0; i < len; i++) {
      var char = s.charAt(i);
      var index = str.indexOf(char);
      if(index === -1) {
        str += char;
        res = res < str.length ? str.length : res;
      } else {
        str = str.substr(index + 1) + char;
      }
    }
    return res;
};
// console.log(lengthOfLongestSubstring('dsahdsakdjhfasOSDFSU9AIOIUUEWER3O4EKHTROUR'));


/**
 * 裁剪字符串空格
 */
let str = ' a b c ';
let arr = Array.from(new Set(str.split(''))).filter(val => val && val.trim());
str = arr.join('');
console.log(str,'----str');
// console.log('83 377 37 7 25 dhh '.replace(/\s*/g, ''));