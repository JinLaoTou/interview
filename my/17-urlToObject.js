/**
 * 1、解析地址栏url中的参数位对象格式
 * @param {string} url 
 * @returns 
 */
function urlQueryString(url) {
    var queryString = url.split('?')[1]; //将url用 "?" 分割,取问号后面的值（下标为1）
    var entries = queryString.split('&'); //将 "?" 后的值用 "&" 符号再分割；
    var obj = {}; //声明一个空对象
    for (let i = 0; i < entries.length; i++) { //循环遍历"?" 后的值
        var kv = entries[i].split('=') //用 "=" 继续分割
        obj[kv[0]] = kv[1] //对象的键和值
    }
    return obj;
}
console.log(urlQueryString('http://www.baidu.com?a=1&b=2'))



/**
 * 2、解析地址
 */
const protocol = '(?<protocol>https?:)';
const host = '(?<host>(?<hostname>[^/#?:]+)(?::(?<port>\\d+))?)';
const path = '(?<pathname>(?:\\/[^/#?]+)*\\/?)';
const search = '(?<search>(?:\\?[^#]*)?)';
const hash = '(?<hash>(?:#.*)?)';
const reg = new RegExp(`^${protocol}\/\/${host}${path}${search}${hash}$`);
function execURL(url){
    const result = reg.exec(url);
    if(result){
        result.groups.port = result.groups.port || '';
        return result.groups;
    }
    return {
        protocol:'',host:'',hostname:'',port:'',
        pathname:'',search:'',hash:'',
    };
}

console.log(execURL('https://localhost:8080/?a=b#xxxx'));
/**
 * 将search和hash进行解析
 * @param {*} str 
 * @returns 
 */
function execUrlParams(str){
    str = str.replace(/^[#?&]/,'');
    const result = {};
    if(!str){ //如果正则可能配到空字符串，极有可能造成死循环，判断很重要
        return result; 
    }
    const reg = /(?:^|&)([^&=]*)=?([^&]*?)(?=&|$)/y
    let exec = reg.exec(str);
    while(exec){
        result[exec[1]] = exec[2];
        exec = reg.exec(str);
    }
    return result;
}
console.log(execUrlParams('#'));// {}
console.log(execUrlParams('##'));//{'#':''}
console.log(execUrlParams('?q=3606&src=srp')); //{q: "3606", src: "srp"}
console.log(execUrlParams('test=a=b=c&&==&a='));//{test: "a=b=c", "": "=", a: ""}