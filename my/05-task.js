/* 　　setTimeout(() => { //立即放入宏队列
    console.log('timeout callback1（）')//3
    Promise.resolve(3).then(
      value => { //立即放入微队列
        console.log('Promise onResolved3()', value)//4 3
      }
    )
  }, 0)

  setTimeout(() => { //立即放入宏队列
    console.log('timeout callback2（）')//5
  }, 0)

  Promise.resolve(1).then(
    value => { //立即放入微队列
      console.log('Promise onResolved1()', value)//1 1
      setTimeout(() => {
        console.log('timeout callback3（）', value)//6 1
      }, 0)
    }
  )

  Promise.resolve(2).then(
    value => { //立即放入微队列
      console.log('Promise onResolved2()', value) //2 2
    }
  )
 */
  // Promise onResolved1() 1
  // Promise onResolved2() 2
  // timeout callback1（）
  // Promise onResolved3() 3
  // timeout callback2（）
  // timeout callback3（） 1


  /* console.log('script start');

  async function async1(){
    await async2()
    console.log('async1 end');
  }
  async function async2(){
    console.log('async2 end');
  }
  async1()

  setTimeout(function(){
    console.log('setTimeout');
  },0)

  new Promise(resolve => {
    console.log('Promise');
    resolve()
  })
  .then(function(){
    console.log('Promise1');
  })
  .then(function(){
    console.log('Promise2');
  })
  console.log('script end'); */
  // script start-> async2 end -> Promise -> script end -> async1 end -> Promise1 -> Promise2 -> setTimeout


  // setImmediate(() => {
  //   console.log('---->setImmediate');
  // })
  // setTimeout(() => {
  //   console.log('setTimeout>------');
  // },0)


  /**
   * process.nextTick是独立于Event Loop之外的，他有自己的队列，如果存在nextTick队列，就会清空队列中所有回调函数，并且优先于其他微任务执行
   */
   /* Promise.resolve().then(function(){
    console.log('promise');
  })
  setTimeout(() => {
    console.log('timer1');
    Promise.resolve().then(function(){
      console.log('promise1');
    })
  },0)
  process.nextTick(() => {
    console.log('nextTick');
    process.nextTick(() => {
      console.log('nextTick1');
      process.nextTick(() => {
        console.log('nextTick2');
      })
    })
  }) */
