/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import OnThisPageSectionsStoreBase from '@/stores/OnThisPageSectionsStoreBase';

const section = { title: 'Foo', level: 2, anchor: 'foo' };
const section2 = { title: 'Bar', level: 3, anchor: 'bar' };

describe('OnThisPageSectionsStoreBase', () => {
  beforeEach(() => {
    jest.resetModules();
  });
  it('adds sections to the state with i18n true by default', () => {
    OnThisPageSectionsStoreBase.addOnThisPageSection(section);
    OnThisPageSectionsStoreBase.addOnThisPageSection(section2, { i18n: false });
    expect(OnThisPageSectionsStoreBase.state.onThisPageSections).toEqual([
      { ...section, i18n: true }, { ...section2, i18n: false },
    ]);
  });

  it('does not set anything, if no anchor matches', () => {
    OnThisPageSectionsStoreBase.addOnThisPageSection(section);
    OnThisPageSectionsStoreBase.setCurrentPageSection('none-matching');
    expect(OnThisPageSectionsStoreBase.state.currentPageAnchor).toBe(null);
  });

  it('sets a section as current by the anchor', () => {
    OnThisPageSectionsStoreBase.addOnThisPageSection(section);
    OnThisPageSectionsStoreBase.addOnThisPageSection(section2);
    OnThisPageSectionsStoreBase.setCurrentPageSection(section2.anchor);
    expect(OnThisPageSectionsStoreBase.state.currentPageAnchor).toBe(section2.anchor);
  });

  it('resets the state', () => {
    OnThisPageSectionsStoreBase.addOnThisPageSection(section);
    OnThisPageSectionsStoreBase.addOnThisPageSection(section2);
    OnThisPageSectionsStoreBase.setCurrentPageSection(section2.anchor);
    OnThisPageSectionsStoreBase.resetPageSections();
    expect(OnThisPageSectionsStoreBase.state.currentPageAnchor).toBeNull();
    expect(OnThisPageSectionsStoreBase.state.onThisPageSections).toEqual([]);
  });
});
