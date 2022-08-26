function test(person){
    person.age = 26
    person = {
        name: 'yyyy',
        age: 30
    }
    return person
}

const p1={
    name:'oooo',
    age:20
}

const p2= test(p1)
// console.log(p1,'---p1');
// console.log(p2, '---->p2');