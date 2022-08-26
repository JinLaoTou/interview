new Promise(() => {
  throw new Error('err1');
})
  .then(() => {console.log(1);})
  .then(() => {console.log(2);})
  .catch((err) => {
      console.log(err); //Err: err1
      throw  new Error('err2');
  })
  .catch((err) => {console.log(err);})//Err: err2
