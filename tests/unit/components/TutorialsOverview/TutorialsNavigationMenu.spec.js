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
import TutorialsNavigationMenu from 'docc-render/components/TutorialsOverview/TutorialsNavigationMenu.vue';

const { TutorialsNavigationList, InlineCloseIcon } = TutorialsNavigationMenu.components;

describe('TutorialsNavigationMenu', () => {
  let wrapper;

  const propsData = { title: 'Introduction' };
  const slots = { default: '<li>foo</li>' };

  beforeEach(() => {
    wrapper = shallowMount(TutorialsNavigationMenu, { propsData, slots });
  });

  it('renders renders a collapsed class', () => {
    expect(wrapper.classes('collapsed')).toBe(true);
    wrapper.setProps({ collapsed: false });
    expect(wrapper.classes('collapsed')).toBeFalsy();
  });

  it('renders a toggle link with the title', () => {
    const link = wrapper.find('button.toggle');

    expect(link.attributes('type')).toBe('button');
    expect(link.text()).toBe(propsData.title);

    // assert the correct AX tag is being applied
    expect(link.attributes('aria-expanded')).toBe('false');

    const icon = link.find('.toggle-icon');
    expect(icon.exists()).toBe(true);
    expect(icon.is(InlineCloseIcon)).toBe(true);
  });

  it('renders a `TutorialsNavigationList` with slot content', () => {
    wrapper.setProps({ collapsed: false });
    const navigation = wrapper.find(TutorialsNavigationList);
    expect(navigation.exists()).toBe(true);
    expect(navigation.contains('li')).toBe(true);
    expect(navigation.text()).toBe('foo');
    expect(navigation.attributes('aria-label')).toBe('Chapters');
  });

  it('does not render the List if collapsed is false', () => {
    const navigation = wrapper.find(TutorialsNavigationList);
    expect(navigation.exists()).toBe(false);
  });

  it('emits a "select-menu" event with the title when the toggle is clicked', () => {
    wrapper.find('.toggle').trigger('click');
    expect(wrapper.emitted()['select-menu'][0]).toEqual([propsData.title]);
  });

  it('emits a "deselect-menu" event when not collapsed and the toggle is clicked', () => {
    wrapper.setProps({ collapsed: false });
    const link = wrapper.find('.toggle');

    // assert the correct AX tag is being applied
    expect(link.attributes('aria-expanded')).toBe('true');
    link.trigger('click');
    expect(wrapper.emitted()['deselect-menu'].length).toBe(1);
  });
});
