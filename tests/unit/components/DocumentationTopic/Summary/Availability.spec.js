/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import Availability from 'docc-render/components/DocumentationTopic/Summary/Availability.vue';

const {
  AvailabilityRange,
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
        beta: true,
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
    technologies: ['fooTechnolog', 'booTechnology'],
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
    expect(wrapper.element.matches('.availability')).toBe(true);

    const section = wrapper.findComponent(Section);
    expect(section.exists()).toBe(true);
    expect(section.classes('availability')).toBe(true);
    expect(section.attributes('aria-label')).toBe('sections.availability');
    expect(section.attributes('role')).toBe('complementary');
  });

  it('renders a `span` for technologies, a `span`, `AvailabilityRange` and a `Badge` if applicable for each platform', () => {
    const { platforms, technologies } = propsData;
    const pills = wrapper.findAll('.technology, .platform');
    expect(pills.length).toBe(technologies.length + platforms.length);

    for (let i = 0; i < technologies.length; i += 1) {
      const pill = pills.at(i);
      expect(pill.exists()).toBe(true);
    }

    for (let i = technologies.length; i < platforms.length; i += 1) {
      const {
        deprecatedAt, introducedAt, name, beta,
      } = platforms[i - technologies.length];
      const pill = pills.at(i);

      const badge = pill.find(Badge);
      if (deprecatedAt || beta) {
        expect(badge.exists()).toBe(true);
      } else {
        expect(badge.exists()).toBe(false);
      }

      const range = pill.find(AvailabilityRange);
      expect(range.exists()).toBe(true);
      expect(range.props()).toEqual({
        deprecatedAt,
        introducedAt,
        platformName: name,
      });
    }
  });

  it('renders correct beta and deprecated badge', () => {
    const badges = wrapper.findAll(Badge);
    expect(badges.at(0).props('variant')).toBe('beta');
    expect(badges.at(1).props('variant')).toBe('deprecated');
    expect(badges.at(2).props('variant')).toBe('deprecated');
    expect(badges.at(3).props('variant')).toBe('deprecated');
  });

  it('renders deprecated over beta badges', async () => {
    await wrapper.setProps({
      platforms: [
        {
          introducedAt: '1.0',
          deprecatedAt: '2.0',
          beta: true,
          name: 'fooOS',
        },
      ],
    });
    const badge = wrapper.findAll(Badge);
    expect(badge.exists()).toBe(true);
    expect(badge.length).toBe(1);
    expect(badge.at(0).props('variant')).toBe('deprecated');
  });

  it('renders no beta/deprecated text if not relevant', async () => {
    await wrapper.setProps({
      platforms: [
        {
          introducedAt: '1.0',
          name: 'fooOS',
        },
      ],
    });
    const beta = wrapper.findComponent('.beta');
    const deprecated = wrapper.findComponent('.deprecated');
    expect(beta.exists()).toBe(false);
    expect(deprecated.exists()).toBe(false);
  });

  describe('with API Changes', () => {
    it('sets changes classes for platforms that have changed', async () => {
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

      await wrapper.vm.$nextTick();
      const pills = wrapper.findAll('.technology, .platform');

      expect(pills.at(2).classes()).toEqual(['platform', 'changed', 'changed-deprecated']);
      expect(pills.at(3).classes()).toEqual(['platform', 'changed', 'changed-added']);
      expect(pills.at(4).classes()).toEqual(['platform', 'changed', 'changed-modified']);
      expect(pills.at(5).classes()).toEqual(['platform']);
    });
  });
});
