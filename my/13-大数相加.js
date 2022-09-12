/**
 * 大数相加
 * @param {string} a 
 * @param {string} b 
 * @returns 
 */
function add(a ,b){
    //取两个数字的最大长度
    let maxLength = Math.max(a.length, b.length);
    //用0去补齐长度
    a = a.padStart(maxLength , 0);//"0009007199254740991"
    b = b.padStart(maxLength , 0);//"1234567899999999999"
    //定义加法过程中需要用到的变量
    let t = 0;
    let f = 0;   //"进位"
    let sum = "";
    for(let i=maxLength-1 ; i>=0 ; i--){
       t = parseInt(a[i]) + parseInt(b[i]) + f;
       f = Math.floor(t/10);
       console.log(t%10 + sum, t%10,sum,'-----');
       sum = t%10 + sum;
       console.log(t,f,'---->tf');
    }
    if(f!==0){
       sum = '' + f + sum;
    }
    console.log(sum,'-----sum');
    return sum;
 }

let a = "9007199254740991";
let b = "1234567899999999999";
console.log(add(a,b));
console.log(11%10,12%10);