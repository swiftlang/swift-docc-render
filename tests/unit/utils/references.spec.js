/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import AppStore from 'docc-render/stores/AppStore';
import { filterInactiveReferences } from 'docc-render/utils/references';

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
const c = {
  identifier: 'https://abc.dev',
  url: 'https://abc.dev',
  title: 'C',
  type: 'link',
};

const references = {
  [aa.identifier]: aa,
  [ab.identifier]: ab,
  [bb.identifier]: bb,
  [bbb.identifier]: bbb,
  [c.identifier]: c,
};

describe('filterInactiveReferences', () => {
  it('does not filter any refs when `includedArchiveIdentifiers` is empty', () => {
    AppStore.setIncludedArchiveIdentifiers([]);
    expect(filterInactiveReferences(references)).toEqual(references);
  });

  it('does not filter any refs when `includedArchiveIdentifiers` includes all ref archives', () => {
    AppStore.setIncludedArchiveIdentifiers(['A', 'B', 'BB']);
    expect(filterInactiveReferences(references)).toEqual(references);
  });

  it('removes `url` from non-external refs that aren\'t part of included archive', () => {
    AppStore.setIncludedArchiveIdentifiers(['B']);
    const filteredRefs = filterInactiveReferences(references);

    expect(Object.keys(filteredRefs)).toEqual(Object.keys(references));

    expect(filteredRefs[aa.identifier].url).toBeFalsy();
    expect(filteredRefs[ab.identifier].url).toBeFalsy();
    expect(filteredRefs[bb.identifier].url).toBe(bb.url);
    expect(filteredRefs[bbb.identifier].url).toBeFalsy();
    expect(filteredRefs[c.identifier].url).toBe(c.url);
  });
});
