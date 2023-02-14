import LRUMap from 'docc-render/utils/lru-map';

describe('LRUMap', () => {
  it('only stores a maximum number of items', () => {
    let map = new LRUMap(0);
    map.set('a', 1);
    expect(map.size).toBe(0);
    map.set('b', 2);
    expect(map.size).toBe(0);

    map = new LRUMap(1);
    map.set('a', 1);
    expect(map.size).toBe(1);
    map.set('b', 2);
    expect(map.size).toBe(1);

    map = new LRUMap(2);
    map.set('a', 1);
    expect(map.size).toBe(1);
    map.set('b', 2);
    expect(map.size).toBe(2);
  });

  it('sets values associated with keys', () => {
    const map = new LRUMap(2);
    map.set('a', 1);
    map.set('b', 2);
    expect(map.size).toBe(2);
    expect(map.get('a')).toBe(1);
    expect(map.get('b')).toBe(2);
    expect(map.get('z')).toBe(undefined);
  });

  it('discards the least recently used items when necessary to add new items', () => {
    const map = new LRUMap(4);
    map.set('a', 'A');
    map.set('b', 'B');
    map.set('c', 'C');
    map.set('d', 'D');
    map.set('e', 'E');
    map.set('d', 'D');
    map.set('f', 'F');

    expect(map.size).toBe(4);
    expect(map.has('a')).toBe(false); // least recently used
    expect(map.has('b')).toBe(false); // next least recently used
    expect(map.has('c')).toBe(true);
    expect(map.has('d')).toBe(true);
    expect(map.has('e')).toBe(true);
    expect(map.has('f')).toBe(true);

    map.set('g', 'G');
    map.set('h', 'H');

    expect(map.size).toBe(4);
    expect(map.has('a')).toBe(false);
    expect(map.has('b')).toBe(false);
    expect(map.has('c')).toBe(false);
    expect(map.has('d')).toBe(true);
    expect(map.has('e')).toBe(false); // next least recently used
    expect(map.has('f')).toBe(true);
    expect(map.has('g')).toBe(true);
    expect(map.has('h')).toBe(true);

    expect(map.get('d')).toBe('D'); // use d/D so f/F will get dropped as LRU next
    map.set('i', 'I');

    expect(map.size).toBe(4);
    expect(map.has('a')).toBe(false);
    expect(map.has('b')).toBe(false);
    expect(map.has('c')).toBe(false);
    expect(map.has('d')).toBe(true);
    expect(map.has('e')).toBe(false); // next least recently used
    expect(map.has('f')).toBe(false);
    expect(map.has('g')).toBe(true);
    expect(map.has('h')).toBe(true);
    expect(map.has('i')).toBe(true);
  });

  it('is iterable similar to a normal map', () => {
    const map = new LRUMap(2);
    map.set('z', 'Z');
    map.set('a', 'A');
    map.set('b', 'B');

    expect([...map]).toEqual([
      ['a', 'A'],
      ['b', 'B'],
    ]);
  });
});
