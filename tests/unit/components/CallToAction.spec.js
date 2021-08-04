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
import CallToAction from 'docc-render/components/CallToAction.vue';

describe('CallToAction', () => {
  let wrapper;

  const {
    Asset,
    Button,
    ContentNode,
    LeftColumn,
    RightColumn,
    Row,
  } = CallToAction.components;

  const propsData = {
    title: 'Fooing the Bar',
    label: 'Foobar',
    abstract: [
      {
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        type: 'text',
      },
    ],
    action: {},
    media: 'foo.bar',
  };

  beforeEach(() => {
    wrapper = shallowMount(CallToAction, { propsData });
  });

  it('renders a .call-to-action', () => {
    expect(wrapper.is('.call-to-action')).toBe(true);
  });

  it('renders a row with 2 columns', () => {
    const row = wrapper.find(Row);
    expect(row.exists()).toBe(true);

    expect(row.contains(LeftColumn)).toBe(true);
    expect(row.contains(RightColumn)).toBe(true);
  });

  describe('LeftColumn', () => {
    let col;

    beforeEach(() => {
      col = wrapper.find(LeftColumn);
    });

    it('renders a label', () => {
      const label = col.find('.label');
      expect(label.exists()).toBe(true);
      expect(label.text()).toBe(propsData.label);
    });

    it('renders a title', () => {
      const title = col.find('h2');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe(propsData.title);
    });

    it('renders abstract', () => {
      const node = col.find(ContentNode);
      expect(node.exists()).toBe(true);
      expect(node.props('content')).toEqual([{
        type: 'paragraph',
        inlineContent: propsData.abstract,
      }]);
    });

    it('renders a button', () => {
      const btn = col.find(Button);
      expect(btn.exists()).toBe(true);
      expect(btn.props('action')).toEqual(propsData.action);
    });
  });

  it('renders an asset in the RightColumn', () => {
    const asset = wrapper.find(RightColumn).find(Asset);
    expect(asset.exists()).toBe(true);
    expect(asset.props('identifier')).toBe(propsData.media);
  });
});
