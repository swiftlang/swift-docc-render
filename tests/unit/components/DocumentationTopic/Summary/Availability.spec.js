/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
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
    expect(wrapper.is('.availability')).toBe(true);

    const section = wrapper.find(Section);
    expect(section.exists()).toBe(true);
    expect(section.classes('availability')).toBe(true);
    expect(section.attributes('aria-label')).toBe('Availability');
    expect(section.attributes('role')).toBe('complementary');
  });

  it('renders a `Badge` for technologies, a `Badge` and `AvailabilityRange` for each platform', () => {
    const { platforms, technologies } = propsData;
    const badges = wrapper.findAll(Badge);
    expect(badges.length).toBe(technologies.length + platforms.length);

    for (let i = 0; i < technologies.length; i += 1) {
      const badge = badges.at(i);
      expect(badge.exists()).toBe(true);
    }

    for (let i = technologies.length; i < platforms.length; i += 1) {
      const badge = badges.at(i);
      const range = badge.find(AvailabilityRange);
      expect(range.exists()).toBe(true);
      expect(range.props()).toEqual({
        deprecatedAt: platforms[i - technologies.length].deprecatedAt,
        introducedAt: platforms[i - technologies.length].introducedAt,
        platformName: platforms[i - technologies.length].name,
      });
    }
  });

  it('renders deprecated text', () => {
    const badges = wrapper.findAll(Badge);
    expect(badges.at(2).contains('.deprecated')).toBe(false);
    expect(badges.at(3).contains('.deprecated')).toBe(true);
    expect(badges.at(4).contains('.deprecated')).toBe(true);
    expect(badges.at(5).contains('.deprecated')).toBe(true);

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

      const badges = wrapper.findAll(Badge);

      expect(badges.at(2).classes()).toEqual(['platform', 'changed', 'changed-deprecated']);
      expect(badges.at(3).classes()).toEqual(['platform', 'changed', 'changed-added']);
      expect(badges.at(4).classes()).toEqual(['platform', 'changed', 'changed-modified']);
      expect(badges.at(5).classes()).toEqual(['platform']);
    });
  });
});
