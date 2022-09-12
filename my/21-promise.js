(function() {
  // 工具类方法
  var isPromise = function isPromise(obj) {
          if((obj !== null && typeof obj === 'object') || (typeof obj === 'function')) {
                  if(typeof obj.then === 'function') {
                          return true
                  }
          }
          return false
  }

  var resolvePromise = function resolvePromise(promiseNew, x, resolve, reject) {
          if(x === promiseNew) throw new TypeError('Chaining cycle detected for promise #<Promise>')
          if(isPromise(x)) {
                  try {
                          x.then(resolve, reject)
                  } catch (err) {
                          reject(err)
                  }
                  return
          }
          resolve(x)
  }

  // new Promise 传递的 executor 必须是一个函数才可以
  function Promise(executor) {
          if(typeof executor !== 'function') throw new TypeError('Promise resolver ' + executor + ' is not a function')

          // slef -> promise实例 初始化状态和值
      var self = this
      self.state = 'pending'
      self.value = undefined
      // 存储状态未响应成功的 .then 函数内容
      self.onFulfilledCallbacks = []
      self.onRejectedCallbacks = []

      var change = function change(state, value) {
          // 状态只能修改一次，第二次更改无效(什么都不作处理即可)
          if(self.state !== 'pending') return
          self.state = state
          self.value = value

          // 通知集合中的方法执行，判断状态是成功的还是失败的执行对应的 .then 函数
          // 因为 .then 是异步微任务，我们无法模拟微任务，只能用定时器(宏任务来模拟)
          setTimeout(function() {
                  var callbacks = self.state === 'fulfilled' ? self.onFulfilledCallbacks : self.onRejectedCallbacks
                  for(var i = 0; i < callbacks.length; i++) {
                          var item = callbacks[i]
                          if(typeof item === 'function') {
                                  item(self.value)
                          }
                  }
          })
      }

      try {
          executor(function resolve(result) {
                  change('fulfilled', result)
          }, function reject(reason) {
                  console.log('执行了')
                  change('rejected', reason)
          })
      } catch (err) {
          change('rejected', err)
      }
  }

  /*原型*/
  Promise.prototype = {
          constructor: Promise,
          customize: true,
          then: function then(onfulfilled, onrejected) {
                  var self = this
                  var promiseNew = null
      if (typeof onfulfilled !== "function") {
          onfulfilled = function onfulfilled(value) {
              return value
          }
      }
      if (typeof onrejected !== "function") {
          onrejected = function onrejected(value) {
              throw value
          }
      }
      promiseNew = new Promise(function (resolve, reject) {
              switch(self.state) {
                  case 'fulfilled':
                       // .then 是异步的微任务，我们模拟不了异步微任务，只能用宏任务代替
                       setTimeout(function() {
                          try {
                                  var x = onfulfilled(self.value)
                                  resolvePromise(promiseNew, x, resolve, reject)
                          } catch (err) {
                                  reject(err)
                          }
                       })
                       break
                  case 'rejected':
                       // .then 是异步的微任务，我们模拟不了异步异步微任务，只能用宏任务代替
                       setTimeout(function() {
                          try {
                              var x = onrejected(self.value)
                              resolvePromise(promiseNew, x, resolve, reject)
                          } catch (err) {
                                  reject(err)
                          }
                       })
                       break
                  default:
                       // 状态还是 pending 说明 new Promise 里面还没有执行完，这里还不能够执行。把它存储到集合中，但是我们以后还要监听方法执行的结果，从而做其它事情
                       self.onFulfilledCallbacks.push(function(value) {
                          try {
                                  var x = onfulfilled(value)
                                  resolvePromise(promiseNew, x, resolve, reject)
                          } catch (err) {
                                  reject(err)
                          }
                       })
                       self.onRejectedCallbacks.push(function(value) {
                          try {
                                  var x = onrejected(value)
                                  resolvePromise(promiseNew, x, resolve, reject)
                          } catch (err) {
                                  reject(err)
                          }
                       })
                       break
                  }
              })
              return promiseNew
      },
      catch: function(onrejected) {
              var self = this
              return self.then(null, onrejected)
      }
  }

  Promise.resolve = function resolve(value) {
          return new Promise(function(resolve) {
                  resolve(value)
          })
  }

Promise.reject = function reject(value) {
  return new Promise(function (_, reject) {
      reject(value)
  })
}

Promise.all = function all(promises) {
  return new Promise(function(resolve, reject) {
          try {
                  var index = 0,
                      len = promises.length,
                      results = []
                  for(var i = 0; i < len; i++) {
                          (function(i) {
                                  var item = promises[i]
                                  if(!isPromise(item)) {
                                          index++
                                          results[i] = item
                                          index === len ? resolve(results) : null
                                          return
                                  }
                                  item.then(function(result) {
                                          index++
                                          results[i] = result
                                          index === len ? resolve(results) : null
                                  }, function(reason) {
                                          reject(reason)
                                  })
                          })(i)
                  }
          } catch (err) {
                  reject(err)
          }
  })
}

/* 暴露API */
if(typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = Promise
}
if(typeof window !== 'undefined') {
  window.Promise = Promise
}
})()

// 第一种情况
// const p1 = new Promise((resolve, reject) => {
// 	resolve(1)
// 	// reject('失败')
// })
// console.log(p1)

// 第二种情况
// const p2 = new Promise((resolve, reject) => {
// 	console.log(1)
// 	setTimeout(function() {
// 		console.log(2)
// 		resolve(1)
// 		console.log(3)
// 	})
// })

// p2.then(result => {
// 	console.log('成功', result)
// }, reject => {
// 	console.log('失败', reject)
// })

// 第三种情况
// const p3 = new Promise((resolve, reject) => {
// 	resolve(1)
// })

// // 不允许返回自己实例对象，会报错
// // 能够链式操作，实例状态能够顺延
// const p4 = p3.then(result => {
// 	return 1
// }, reject => {})

// // 链式操作
// p4.then(null, reject => {}).then(result => {
// 	console.log(result, '结果')
// }, reject => {})
// console.log(p4)

// const p5 = Promise.resolve('成功').then(result => {
// 	console.log(result)
// })

// const p6 = Promise.reject('失败').then(res => {}, rej => {
// 	console.log(rej)
// })
// console.log(p6)

// Promise.all
let p1 = Promise.resolve(10)
let p2 = new Promise(resolve => {
setTimeout(function() {
  resolve(20)
}, 1000)
})
let p3 = 40
// Promise.all([p1, p2, p3]).then(results => {
// console.log('成功', results)
// }).catch(err => {
// console.log(err, 'errrr')
// })
new Promise(resolve => {
  resolve(20)
}).then(res => {
  console.log(res, '---->sucess');
})
