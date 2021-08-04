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
import TutorialsNavigation from 'docc-render/components/TutorialsOverview/TutorialsNavigation.vue';
import TutorialsNavigationLink from 'docc-render/components/TutorialsOverview/TutorialsNavigationLink.vue';

describe('TutorialsNavigation', () => {
  let wrapper;

  const propsData = {
    sections: [
      {
        chapters: [
          { name: 'Getting Started' },
          { name: 'Advanced' },
        ],
        kind: 'volume',
        name: 'Volume A',
      },
      {
        chapters: [
          { name: 'Really Advanced' },
          { name: 'Extremely Advanced' },
        ],
        kind: 'volume',
      },
      {
        kind: 'resources',
      },
    ],
  };

  const provide = {
    store: {
      state: { activeVolume: 'Volume A' },
      setActiveVolume: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(TutorialsNavigation, {
      propsData,
      provide,
    });
  });

  it('renders a TutorialsNavigationList', () => {
    expect(wrapper.find({ name: 'TutorialsNavigation' }).exists()).toBe(true);
  });

  it('renders a list item for each section, appending appropriate classes', () => {
    expect(wrapper.findAll('li.volume')).toHaveLength(2);
    expect(wrapper.findAll('li.resource')).toHaveLength(1);
  });

  it('renders TutorialsNavigationMenu if the volume has a name', () => {
    expect(wrapper.find('.volume').classes()).toContain('volume--named');
    // for one Volume section
    const menus = wrapper.findAll({ name: 'TutorialsNavigationMenu' });
    expect(menus).toHaveLength(1);
    expect(menus.at(0).props()).toEqual({ collapsed: false, title: 'Volume A' });
    const links = menus.at(0).findAll(TutorialsNavigationLink);
    expect(links).toHaveLength(2);
  });

  it('renders a TutorialsNavigationList if the volume has no name', () => {
    // find the volume without name, its the second item
    const menu = wrapper.findAll('.volume').at(1);
    expect(menu.classes()).not.toContain('volume--named');
    const menuItem = menu.findAll({ name: 'TutorialsNavigationList' });
    expect(menuItem).toHaveLength(1);
    expect(menuItem.at(0).text()).toContain('Really Advanced');
    expect(menuItem.at(0).attributes('aria-label')).toBe('Chapters');
  });

  it('activates the first named volume on created', () => {
    expect(provide.store.setActiveVolume).toHaveBeenCalledWith('Volume A');
  });

  it('sets the proper active volume on @select-menu', () => {
    wrapper.find({ name: 'TutorialsNavigationMenu' }).vm.$emit('select-menu', 'foobar');
    expect(provide.store.setActiveVolume).toHaveBeenCalledWith('foobar');
  });

  it('deselects the active volume on @deselect-menu', () => {
    wrapper.find({ name: 'TutorialsNavigationMenu' }).vm.$emit('deselect-menu', 'foobar');
    expect(provide.store.setActiveVolume).toHaveBeenCalledWith(null);
  });

  it('renders TutorialsNavigationLink for Resource', () => {
    const link = wrapper.find('li.resource').find({ name: 'TutorialsNavigationLink' });
    expect(link.exists()).toBe(true);
    expect(link.text()).toBe('Resources');
  });
});
