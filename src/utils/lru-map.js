// Similar to the builtin `Map` object but with a limit to the maximum number
// of items that can be added at a given time.
//
// If the object already contains `maxSize` items, adding a new item will also
// remove the item that was "least recently used" (LRU). Otherwise, this should
// behave similar to a normal map (only functionality needed for the app is
// implemented for now).
export default class LRUMap {
  constructor(maxSize) {
    this.map = new Map();
    this.maxSize = maxSize;
  }

  get size() {
    return this.map.size;
  }

  get(key) {
    if (!this.map.has(key)) {
      return undefined;
    }

    // if the map already contains a value for this key, delete it and add it
    // again so that the order of the map correlates to how recently the value
    // for this key was accessed
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);

    return value;
  }

  has(key) {
    return this.map.has(key);
  }

  set(key, val) {
    // if the map already contains a value for this key, delete it and add it
    // again so that the order of the map correlates to how recently the value
    // for this key was accessed
    if (this.map.has(key)) {
      this.map.delete(key);
    }
    this.map.set(key, val);

    // to ensure that this map never contains more than `maxSize` items, delete
    // the least recently accessed item, which will be the first item in the
    // backing map since its order correlates to how recently the item was last
    // accessed
    if (this.map.size > this.maxSize) {
      const firstKey = this.map.keys().next().value;
      this.map.delete(firstKey);
    }
  }

  * [Symbol.iterator]() {
    yield* this.map;
  }
}
