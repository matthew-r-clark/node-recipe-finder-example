const Heap = require('./heap');

class MaxHeap extends Heap {
  constructor(compareFunction) {
    super(true, compareFunction);
  }
}

module.exports = MaxHeap;