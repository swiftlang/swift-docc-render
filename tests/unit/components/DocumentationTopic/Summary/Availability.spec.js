/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import Availability from 'docc-render/components/DocumentationTopic/Summary/Availability.vue';

const {
  AvailabilityRange,
  Item,
  List,
  Section,
  Badge,
} = Availability.components;

describe('Availability', () => {
  /** @type {import('@vue/test-utils').Wrapper} */
  let wrapper;

  const propsData = {
    platforms: [
      {
        introducedAt: '1.0',
        name: 'fooOS',
      },
      {
        deprecatedAt: '2.0',
        introducedAt: '1.0',
        name: 'barOS',
      },
      {
        deprecatedAt: '2.0',
        introducedAt: '1.0',
        name: 'bazOS',
      },
      {
        deprecatedAt: '2.0',
        introducedAt: '1.0',
        name: 'myOS',
      },
    ],
  };

  const store = {
    reset: jest.fn(),
    setAPIChanges: jest.fn(),
    state: {
      onThisPageSections: [],
      apiChanges: null,
    },
  };

  const provide = {
    identifier: 'doc://mytopic',
    store,
  };

  beforeEach(() => {
    wrapper = shallowMount(Availability, { propsData, provide });
  });

  it('renders a `Section`', () => {
    expect(wrapper.is('.availability')).toBe(true);

    const section = wrapper.find(Section);
    expect(section.exists()).toBe(true);
    expect(section.classes('availability')).toBe(true);
    expect(section.attributes('aria-label')).toBe('Availability');
    expect(section.attributes('role')).toBe('complementary');
  });

  it('renders deprecated text', () => {
    const items = wrapper.findAll(Item);
    expect(items.at(0).contains('.deprecated')).toBe(false);
    expect(items.at(1).contains('.deprecated')).toBe(true);
    expect(items.at(2).contains('.deprecated')).toBe(true);
    expect(items.at(3).contains('.deprecated')).toBe(true);

    const deprecated = wrapper.find('.deprecated');
    expect(deprecated.text()).toBe('Deprecated');
  });

  it('renders beta text', () => {
    wrapper.setProps({
      platforms: [
        {
          introducedAt: '1.0',
          beta: true,
          name: 'fooOS',
        },
      ],
    });
    const beta = wrapper.find('.beta');
    expect(beta.exists()).toBe(true);
    expect(beta.text()).toBe('Beta');
  });

  it('renders deprecated over beta badges', () => {
    wrapper.setProps({
      platforms: [
        {
          introducedAt: '1.0',
          deprecatedAt: '2.0',
          beta: true,
          name: 'fooOS',
        },
      ],
    });
    const beta = wrapper.find('.beta');
    const deprecated = wrapper.find('.deprecated');
    expect(beta.exists()).toBe(false);
    expect(deprecated.exists()).toBe(true);
  });

  it('renders no beta/deprecated text if not relevant', () => {
    wrapper.setProps({
      platforms: [
        {
          introducedAt: '1.0',
          name: 'fooOS',
        },
      ],
    });
    const beta = wrapper.find('.beta');
    const deprecated = wrapper.find('.deprecated');
    expect(beta.exists()).toBe(false);
    expect(deprecated.exists()).toBe(false);
  });

  it('renders a `List` with an `Item/AvailabilityRange` for each platform', () => {
    const list = wrapper.find(List);
    expect(list.exists()).toBe(true);

    const items = list.findAll(Item);
    expect(items.length).toBe(propsData.platforms.length);

    propsData.platforms.forEach((platform, i) => {
      const item = items.at(i);
      expect(item.exists()).toBe(true);

      const range = item.find(AvailabilityRange);
      expect(range.exists()).toBe(true);
      expect(range.props()).toEqual({
        deprecatedAt: platform.deprecatedAt,
        introducedAt: platform.introducedAt,
        platformName: platform.name,
      });
    });
  });

  describe('with API Changes', () => {
    it('sets changes classes for platforms that have changed', () => {
      store.state.apiChanges = {
        [provide.identifier]: {
          availability: {
            fooOS: {
              deprecated: {
                new: '13.4',
                previous: null,
              },
            },
            barOS: {
              introduced: {
                new: '13.4',
                previous: null,
              },
            },
            bazOS: {
              introduced: {
                new: '12.6',
                previous: '13.0',
              },
            },
          },
        },
      };

      const items = wrapper.findAll(Item);

      expect(items.at(0).classes()).toEqual(['platform', 'changed', 'changed-deprecated']);
      expect(items.at(1).classes()).toEqual(['platform', 'changed', 'changed-added']);
      expect(items.at(2).classes()).toEqual(['platform', 'changed', 'changed-modified']);
      expect(items.at(3).classes()).toEqual(['platform']);
    });
  });
});
