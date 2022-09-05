function Test(name) {
    this.name = name
    return {name:'0000'}
  }
  const t = new Test('xxx')
  console.log(t.name) // 'xxx'