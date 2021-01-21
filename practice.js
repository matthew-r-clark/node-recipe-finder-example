let util = require('util');

const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('one');
  }, 5000);
});

const promise2 = new Promise((resolve, reject) => {
  // setTimeout(() => {
    resolve({name: 'Matt', age: 33});
  // }, 100);
});

const promise3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('three');
  }, 1000);
});

const promise4 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('four');
  }, 200);
});

const promise5 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('five');
  }, 2000);
});

let promises = [promise1, promise2, promise3, promise4, promise5];

async function test() {
  let current;
  let index;
  
  do {
    current = await Promise.race(promises);
    index = indexOfPromise(promises, current);
    promises.splice(index, 1);
    console.log(await current);
  } while (current);
}

function promiseIncludes(promise, value) {
  return inspect(promise).includes(inspect(value));
}

function inspect(object) {
  return util.inspect(object);
}

function indexOfPromise(array, target) {
  for (let i = 0; i < array.length; i +=1 ) {
    let current = array[i];
    if (promiseIncludes(current, target)) {
      return i;
    }
  }
  return -1;
}

test();