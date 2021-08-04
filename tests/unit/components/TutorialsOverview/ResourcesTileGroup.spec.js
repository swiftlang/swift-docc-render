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
import ResourcesTileGroup from 'docc-render/components/TutorialsOverview/ResourcesTileGroup.vue';

const { Tile } = ResourcesTileGroup.components;

describe('ResourcesTileGroup', () => {
  let wrapper;

  const propsData = {
    tiles: [
      {
        title: 'A',
        action: { title: 'a', destination: '/a' },
        content: [{ type: 'text', text: 'a' }],
      },
      {
        title: 'B',
        action: { title: 'b', destination: '/b' },
        content: [{ type: 'text', text: 'b' }],
      },
    ],
  };

  beforeEach(() => {
    wrapper = shallowMount(ResourcesTileGroup, { propsData });
  });

  it('renders a .tile-group root', () => {
    expect(wrapper.is('.tile-group'));
  });

  it('renders a "count-{n}" class for the number of tiles', () => {
    expect(wrapper.classes('count-2')).toBe(true);

    wrapper.setProps({ tiles: [...propsData.tiles, propsData.tiles[0]] });
    expect(wrapper.classes('count-2')).toBe(false);
    expect(wrapper.classes('count-3')).toBe(true);
  });

  it('renders a `Tile` for each tile', () => {
    const tiles = wrapper.findAll(Tile);
    expect(tiles.length).toBe(propsData.tiles.length);

    tiles.wrappers.forEach((tile, i) => {
      expect(tiles.at(i).props()).toEqual({
        action: propsData.tiles[i].action,
        content: propsData.tiles[i].content,
        title: propsData.tiles[i].title,
      });
    });
  });
});
