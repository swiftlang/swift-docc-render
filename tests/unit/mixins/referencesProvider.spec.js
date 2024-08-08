/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/
import { shallowMount } from '@vue/test-utils';
import referencesProvider from 'docc-render/mixins/referencesProvider';

const FakeComponentInner = {
  name: 'FakeComponentInner',
  props: ['references'],
  render() {
    return null;
  },
};

const FakeComponentOuter = {
  name: 'FakeComponentOuter',
  mixins: [referencesProvider],
  render(createElement) {
    return createElement(FakeComponentInner, {
      props: {
        references: this.references,
      },
    });
  },
};

const aa = {
  identifier: 'doc://A/documentation/A/a',
  url: '/documentation/A/a',
  title: 'A.A',
  type: 'topic',
};
const ab = {
  identifier: 'doc://A/documentation/A/b',
  url: '/documentation/A/b',
  title: 'A.B',
  type: 'topic',
};
const bb = {
  identifier: 'doc://B/documentation/B/b',
  url: '/documentation/B/b',
  title: 'B.B',
  type: 'topic',
};
const bbb = {
  identifier: 'doc://BB/documentation/BB/b',
  url: '/documentation/BB/b#b',
  title: 'BB.B',
  type: 'section',
};

const references = {
  [aa.identifier]: aa,
  [ab.identifier]: ab,
  [bb.identifier]: bb,
  [bbb.identifier]: bbb,
};

const provide = {
  store: {
    state: { references },
  },
};

const createOuter = (opts = { provide }) => shallowMount(FakeComponentOuter, opts);

describe('referencesProvider', () => {
  it('provides a store with a default state', () => {
    const outer = createOuter({});
    const inner = outer.find(FakeComponentInner);
    expect(inner.exists()).toBe(true);
    expect(inner.props('references')).toEqual({});
  });

  it('provides references from a store', () => {
    const outer = createOuter();
    const inner = outer.find(FakeComponentInner);
    expect(inner.exists()).toBe(true);
    expect(inner.props('references')).toEqual(references);
  });

  it('removes `url` data for refs with non-empty `includedArchiveIdentifiers` app state', () => {
    // empty `includedArchiveIdentifiers` — no changes to refs
    const outer = createOuter();
    let inner = outer.find(FakeComponentInner);
    expect(inner.exists()).toBe(true);
    expect(inner.props('references')).toEqual(references);

    // `includedArchiveIdentifiers` contains all refs - no changes to refs
    outer.setData({
      appState: {
        includedArchiveIdentifiers: ['A', 'B', 'BB'],
      },
    });
    inner = outer.find(FakeComponentInner);
    expect(inner.exists()).toBe(true);
    expect(inner.props('references')).toEqual(references);

    // `includedArchiveIdentifiers` only contains archive B — remove `url` field
    // from all non-B refs
    outer.setData({
      appState: {
        includedArchiveIdentifiers: ['B'],
      },
    });
    inner = outer.find(FakeComponentInner);
    expect(inner.exists()).toBe(true);
    const refs3 = inner.props('references');
    expect(refs3).not.toEqual(references);
    expect(refs3[aa.identifier].title).toBe(aa.title);
    expect(refs3[aa.identifier].url).toBeFalsy(); // aa `url` is gone now
    expect(refs3[ab.identifier].title).toBe(ab.title);
    expect(refs3[ab.identifier].url).toBeFalsy(); // ab `url` is gone now
    expect(refs3[bb.identifier].title).toBe(bb.title);
    expect(refs3[bb.identifier].url).toBe(bb.url); // bb still has `url`
    expect(refs3[bbb.identifier].title).toBe(bbb.title);
    expect(refs3[bbb.identifier].url).toBeFalsy(); // bbb `url` is gone now
  });
});
