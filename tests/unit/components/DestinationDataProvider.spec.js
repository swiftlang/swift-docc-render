/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import DestinationDataProvider
  from 'docc-render/components/DestinationDataProvider.vue';
import { shallowMount } from '@vue/test-utils';

const Destinations = {
  link: {
    type: 'link',
    title: 'LinkTitle',
    destination: '/link',
  },
  reference: {
    type: 'reference',
    title: 'ReferenceTitle',
    identifier: 'foobar',
  },
  referenceLink: {
    type: 'reference',
    title: 'ReferenceTitle',
    identifier: 'referenceLink',
  },
  text: {
    type: 'text',
    text: '/foo',
  },
};

const scopedSlotAssertions = {};

const references = {
  foobar: {
    abstract: [],
    title: 'Technologies',
    kind: 'article',
    type: 'topic',
    identifier: 'foo',
    url: '/documentation/technologies',
  },
  referenceLink: {
    title: 'External Reference',
    kind: 'reference',
    type: 'link',
    identifier: 'referenceLink',
    url: 'http://extenral-url.com',
  },
};

const createWrapper = (overrides) => {
  const config = {
    propsData: {
      destination: Destinations.link,
    },
    provide: {
      references,
    },
    scopedSlots: {
      default(params) {
        Object.assign(scopedSlotAssertions, params);
        return this.$createElement('div');
      },
    },
    ...overrides,
  };
  const wrapper = shallowMount(DestinationDataProvider, config);
  return {
    config,
    wrapper,
  };
};

describe('DestinationDataProvider', () => {
  it('provides proper attributes for `type:link`', () => {
    createWrapper();
    expect(scopedSlotAssertions.url).toBe('/link');
    expect(scopedSlotAssertions.title).toBe('LinkTitle');
    expect(scopedSlotAssertions.isExternal).toBe(true);
  });

  it('provides title and url for `type: reference`', () => {
    createWrapper({
      propsData: {
        destination: Destinations.reference,
      },
    });
    expect(scopedSlotAssertions.url).toEqual('/documentation/technologies');
    expect(scopedSlotAssertions.title).toEqual('Technologies');
    expect(scopedSlotAssertions.isExternal).toBe(false);
  });

  it('sets a `reference` destination with type `link` as external', () => {
    createWrapper({
      propsData: {
        destination: Destinations.referenceLink,
      },
    });
    expect(scopedSlotAssertions.url).toEqual(references.referenceLink.url);
    expect(scopedSlotAssertions.title).toEqual(references.referenceLink.title);
    expect(scopedSlotAssertions.isExternal).toBe(true);
  });

  it('provides title and url for `type: text`', () => {
    createWrapper({
      propsData: {
        destination: Destinations.text,
      },
    });
    expect(scopedSlotAssertions.url).toEqual(Destinations.text.text);
    expect(scopedSlotAssertions.title).toEqual('');
  });

  describe('aria-label formatter related', () => {
    it('provides proper aria-label if not `external`', () => {
      createWrapper({
        propsData: {
          destination: Destinations.reference,
        },
      });
      expect(scopedSlotAssertions.formatAriaLabel('foo')).toBe('foo');
    });

    it('provides proper aria-label formatting if `external` but not `IDE`', () => {
      createWrapper({
        propsData: {
          destination: Destinations.referenceLink,
        },
        provide: {
          references,
          isTargetIDE: false,
        },
      });
      expect(scopedSlotAssertions.formatAriaLabel('foo')).toBe('foo');
    });

    it('provides proper aria-label formatting if Reference is `link` and in `IDE`', () => {
      createWrapper({
        propsData: {
          destination: Destinations.referenceLink,
        },
        provide: {
          references,
          isTargetIDE: true,
        },
      });
      expect(scopedSlotAssertions.formatAriaLabel('foo')).toBe('foo (opens in browser)');
    });

    it('provides proper aria-label formatting if Destination `link` and in `IDE`', () => {
      createWrapper({
        propsData: {
          destination: Destinations.link,
        },
        provide: {
          references,
          isTargetIDE: true,
        },
      });
      expect(scopedSlotAssertions.formatAriaLabel('foo')).toBe('foo (opens in browser)');
    });
  });

  it('does not error if no reference is found', () => {
    createWrapper({
      propsData: {
        destination: Destinations.reference,
      },
      provide: {
        references: {},
      },
    });
    expect(scopedSlotAssertions.url).toEqual('');
    expect(scopedSlotAssertions.title).toEqual('');
  });

  it('does not error out if no destination is provided at all', () => {
    createWrapper({
      propsData: {
        destination: undefined,
      },
    });
    expect(scopedSlotAssertions.url).toEqual('');
    expect(scopedSlotAssertions.title).toEqual('');
  });

  it('uses the overridingTitle if available', () => {
    createWrapper({
      propsData: {
        destination: { ...Destinations.reference, overridingTitle: 'OverridingTitle' },
      },
    });

    expect(scopedSlotAssertions.title).toEqual('OverridingTitle');
  });
});
