class Heap {
  #data = [];
  #max;

  constructor(max, compareFunction) {
    this.compare = compareFunction || this.defaultCompare;
    this.#max = max;
  }

  defaultCompare(a, b) {
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    } else {
      return 0;
    }
  }

  firstGreaterThanSecond(a, b) {
    return this.compare(a, b) > 0;
  }

  firstLessThanSecond(a, b) {
    return this.compare(a, b) < 0;
  }

  // equal(a, b) {
  //   return this.compare(a, b) === 0;
  // }

  rootNodeValue() {
    return this.#data[0];
  }

  leftChildIndex(index) {
    return (index * 2) + 1;
  }

  rightChildIndex(index) {
    return (index * 2) + 2;
  }

  parentIndex(index) {
    return Math.floor((index - 1) / 2);
  }

  valueAtIndexGreaterThanParent(index) {
    let value = this.#data[index];
    let parent = this.#data[this.parentIndex(index)];
    return this.firstGreaterThanSecond(value, parent);
  }

  valueAtIndexLessThanParent(index) {
    let value = this.#data[index];
    let parent = this.#data[this.parentIndex(index)];
    return this.firstLessThanSecond(value, parent);
  }

  swapDataAtIndices(first, second) {
    let temp = this.#data[first];
    this.#data[first] = this.#data[second];
    this.#data[second] = temp;
  }

  peek() {
    return this.rootNodeValue();
  }

  insert(value) {
    if (Array.isArray(value)) {
      value.forEach(element => this.insert(element));
    } else {
      this.#data.push(value);
      this.trickleNewNodeUp();
    }
  }

  trickleNewNodeUp() {
    let newNodeIndex = this.#data.length - 1;

    if (this.#max) {
      while (newNodeIndex > 0 && this.valueAtIndexGreaterThanParent(newNodeIndex)) {
        this.swapDataAtIndices(newNodeIndex, this.parentIndex(newNodeIndex));
        newNodeIndex = this.parentIndex(newNodeIndex);
      };
    } else {
      while (newNodeIndex > 0 && this.valueAtIndexLessThanParent(newNodeIndex)) {
        this.swapDataAtIndices(newNodeIndex, this.parentIndex(newNodeIndex));
        newNodeIndex = this.parentIndex(newNodeIndex);
      };
    }
  }

  delete(n=1) {
    if (n > 1) {
      let deleted = [];
      while (n > 0) {
        deleted.push(this.delete());
        n -= 1;
      }
      return deleted;
    } else {
      let rootNode = this.rootNodeValue();
      this.#data[0] = this.#data.pop();
      this.trickleRootNodeDown();
      return rootNode;
    }
  }

  trickleRootNodeDown() {
    let index = 0;

    if (this.#max) {
      while (this.nodeAtIndexHasGreaterChild(index)) {
        let greaterChildIndex = this.calculateGreaterChildIndex(index);
        this.swapDataAtIndices(index, greaterChildIndex);
        index = greaterChildIndex;
      }
    } else {
      while (this.nodeAtIndexHasLesserChild(index)) {
        let lesserChildIndex = this.calculateLesserChildIndex(index);
        this.swapDataAtIndices(index, lesserChildIndex);
        index = lesserChildIndex;
      }
    }
  }

  nodeAtIndexHasGreaterChild(index) {
    let nodeValue = this.#data[index];
    let leftChildValue = this.#data[this.leftChildIndex(index)];
    let rightChildValue = this.#data[this.rightChildIndex(index)];
    return (leftChildValue !== undefined && leftChildValue > nodeValue) ||
           (rightChildValue !== undefined && rightChildValue > nodeValue);
  }

  nodeAtIndexHasLesserChild(index) {
    let nodeValue = this.#data[index];
    let leftChildValue = this.#data[this.leftChildIndex(index)];
    let rightChildValue = this.#data[this.rightChildIndex(index)];
    return (leftChildValue !== undefined && leftChildValue < nodeValue) ||
           (rightChildValue !== undefined && rightChildValue < nodeValue);
  }

  calculateGreaterChildIndex(index) {
    let leftChildValue = this.#data[this.leftChildIndex(index)];
    let rightChildValue = this.#data[this.rightChildIndex(index)];

    if (rightChildValue > leftChildValue && rightChildValue !== undefined) {
      return this.rightChildIndex(index);
    } else {
      return this.leftChildIndex(index);
    }
  }

  calculateLesserChildIndex(index) {
    let leftChildValue = this.#data[this.leftChildIndex(index)];
    let rightChildValue = this.#data[this.rightChildIndex(index)];

    if (rightChildValue < leftChildValue && rightChildValue !== undefined) {
      return this.rightChildIndex(index);
    } else {
      return this.leftChildIndex(index);
    }
  }
}

module.exports = Heap;