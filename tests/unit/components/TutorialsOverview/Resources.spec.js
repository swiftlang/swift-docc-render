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
import Resources from 'docc-render/components/TutorialsOverview/Resources.vue';

const {
  VolumeName,
  TileGroup,
} = Resources.components;

describe('Resources', () => {
  let wrapper;

  const propsData = {
    content: [
      {
        type: 'paragraph',
        inlineContent: [{ type: 'text', text: 'blah blah' }],
      },
    ],
    tiles: [
      {
        title: 'A',
        content: [{ type: 'text', text: 'a' }],
      },
    ],
  };

  const provide = {
    store: {
      setActiveSidebarLink: jest.fn(),
      setActiveVolume: jest.fn(),
    },
  };

  beforeEach(() => {
    wrapper = shallowMount(Resources, { propsData, provide });
  });

  it('renders a section.resources root', () => {
    expect(wrapper.is('section.resources')).toBe(true);
    expect(wrapper.attributes('id')).toBe('resources');
  });

  it('renders a VolumeName component', () => {
    const title = wrapper.find(VolumeName);
    expect(title.exists()).toBe(true);
    expect(title.props('name')).toBe('Resources');
    expect(title.props('content')).toEqual(propsData.content);
  });

  it('renders a `TileGroup`', () => {
    const group = wrapper.find(TileGroup);
    expect(group.exists()).toBe(true);
    expect(group.props('tiles')).toEqual(propsData.tiles);
  });

  it('sets the active tutorial link when intersecting the viewport center', () => {
    wrapper.vm.onIntersectViewport();
    expect(provide.store.setActiveSidebarLink).toBeCalledWith('Resources');
    expect(provide.store.setActiveVolume).toBeCalledWith(null);
  });
});
