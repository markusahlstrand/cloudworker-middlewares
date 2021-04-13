class Node {
  constructor(key, value, next = null, prev = null) {
    this.key = key;
    this.value = value;
    this.next = next;
    this.prev = prev;
    this.updated = Date.now();
  }
}

/**
 * Lru Cache with Ttl based on https://gist.github.com/udayvunnam/a58c2a1c3044853c9d9efdc3c74e559e#file-lru-js
 */
module.exports = class LruCache {
  constructor(limit = 100, ttl = 120) {
    this.size = 0;
    this.limit = limit;
    this.head = null;
    this.tail = null;
    this.cache = {};
    this.ttl = ttl;
  }

  set(key, value) {
    this.ensureLimit();

    if (!this.head) {
      this.head = this.tail = new Node(key, value);
    } else {
      const node = new Node(key, value, this.head);
      this.head.prev = node;
      this.head = node;
    }

    this.cache[key] = this.head;
    this.size += 1;
  }

  get(key) {
    if (this.cache[key]) {
      const value = this.cache[key].value;

      this.delete(key);
      this.set(key, value);

      return value;
    }

    return undefined;
  }

  has(key) {
    return !!this.cache[key];
  }

  ensureLimit() {
    if (this.size === this.limit) {
      this.delete(this.tail.key);
    }

    // Check if the tail is exipred
    while (this.tail && this.tail.updated + this.ttl * 1000 < Date.now()) {
      this.delete(this.tail.key);
    }
  }

  delete(key) {
    const node = this.cache[key];

    if (node.prev !== null) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next !== null) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    delete this.cache[key];
    this.size--;
  }

  clear() {
    this.head = null;
    this.tail = null;
    this.size = 0;
    this.cache = {};
  }

  // Invokes the callback function with every node of the chain and the index of the node.
  forEach(fn) {
    let node = this.head;
    let counter = 0;
    while (node) {
      fn(node, counter);
      node = node.next;
      counter++;
    }
  }

  // To iterate over LRU with a 'for...of' loop
  *[Symbol.iterator]() {
    let node = this.head;
    while (node) {
      yield node;
      node = node.next;
    }
  }
};
