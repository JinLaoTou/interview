const getJSON = function (url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, false);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        if (xhr.status === 200 || xhr.status === 304) {
          resolve(xhr.responseText);
        } else {
          reject(new Error(xhr.responseText));
        }
      };
      xhr.send();
    });
};
/**
 * 1、readyState: 
 * 0:open()方法还未调用  1:send()方法还未调用  4：整个请求过程已经完毕
 */


/**
 * 封装ajax
 * @param {*} options 
 */
//封装一个ajax请求
function ajax(options) {
    //创建XMLHttpRequest对象
    const xhr = new XMLHttpRequest()


    //初始化参数的内容
    options = options || {}
    options.type = (options.type || 'GET').toUpperCase()
    options.dataType = options.dataType || 'json'
    const params = options.data

    //发送请求
    if (options.type === 'GET') {
        xhr.open('GET', options.url + '?' + params, true)
        xhr.send(null)
    } else if (options.type === 'POST') {
        xhr.open('POST', options.url, true)
        xhr.send(params)

        //接收请求
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                let status = xhr.status
                if (status >= 200 && status < 300) {
                    options.success && options.success(xhr.responseText, xhr.responseXML)
                } else {
                    options.fail && options.fail(status)
                }
            }
        }
    }
}

// 使用如下：
ajax({
    type: 'post',
    dataType: 'json',
    data: {},
    url: 'https://xxxx',
    success: function(text,xml){//请求成功后的回调函数
        console.log(text)
    },
    fail: function(status){////请求失败后的回调函数
        console.log(status)
    }
})