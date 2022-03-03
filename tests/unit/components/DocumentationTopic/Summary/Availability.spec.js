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

  it('renders a deprecated badge', () => {
    const badge = wrapper.findAll(Badge);
    expect(badge.exists()).toBe(true);
    expect(badge.length).toBe(7);
    expect(badge.at(2).props('variant')).toBe('deprecated');
    expect(badge.at(4).props('variant')).toBe('deprecated');
    expect(badge.at(6).props('variant')).toBe('deprecated');
  });

  it('renders a beta badge', () => {
    wrapper.setProps({
      platforms: [
        {
          introducedAt: '1.0',
          beta: true,
          name: 'fooOS',
        },
      ],
    });
    const badge = wrapper.findAll(Badge);
    expect(badge.exists()).toBe(true);
    expect(badge.at(1).props('variant')).toBe('beta');
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
    const badges = wrapper.findAll(Badge);
    expect(badges.length).toBe(2);
    expect(badges.at(1).props('variant')).toBe('deprecated');
  });

  it('renders no badge if no deprecated or beta', () => {
    wrapper.setProps({
      platforms: [
        {
          introducedAt: '1.0',
          name: 'fooOS',
        },
      ],
    });
    const badge = wrapper.findAll(Badge);
    expect(badge.length).toBe(1);
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
