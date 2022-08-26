　　setTimeout(() => { //立即放入宏队列
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

  // Promise onResolved1() 1
  // Promise onResolved2() 2
  // timeout callback1（）
  // Promise onResolved3() 3
  // timeout callback2（）
  // timeout callback3（） 1