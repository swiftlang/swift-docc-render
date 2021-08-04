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
import Asset from 'docc-render/components/Asset.vue';
import Columns from 'docc-render/components/Article/Layouts/Columns.vue';
import ContentNode from 'docc-render/components/ContentNode.vue';

describe('Columns', () => {
  let wrapper;

  const columnWithoutText = id => ({ media: id });
  const column = id => ({
    ...columnWithoutText(id),
    content: [{ type: 'text', text: id }],
  });

  describe('with 2 columns', () => {
    const propsData = {
      columns: [
        column('foo'),
        column('bar'),
      ],
    };

    beforeEach(() => {
      wrapper = shallowMount(Columns, { propsData });
    });

    it('renders a .columns.cols-2 row', () => {
      expect(wrapper.is('div.columns.cols-2')).toBe(true);
    });

    it('renders an `Asset` and `ContentNode` for each col', () => {
      const nodes = wrapper.findAll(ContentNode);
      expect(nodes.length).toBe(2);
      expect(nodes.at(0).props('content'))
        .toEqual(propsData.columns[0].content);
      expect(nodes.at(1).props('content'))
        .toEqual(propsData.columns[1].content);

      const assets = wrapper.findAll(Asset);
      expect(assets.length).toBe(2);
      expect(assets.at(0).props('identifier'))
        .toBe(propsData.columns[0].media);
      expect(assets.at(1).props('identifier'))
        .toBe(propsData.columns[1].media);
    });

    it('does not allow autoplay for video assets', () => {
      const allowsAutoplay = asset => asset.props('videoAutoplays');
      const assets = wrapper.findAll(Asset);
      expect(assets.length).toEqual(2);
      expect(assets.filter(allowsAutoplay).length).toEqual(0);
    });
  });

  describe('with 3 columns', () => {
    const propsData = {
      columns: [
        column('foo'),
        column('bar'),
        column('baz'),
      ],
    };

    beforeEach(() => {
      wrapper = shallowMount(Columns, { propsData });
    });

    it('renders a .columns.cols-3 row', () => {
      expect(wrapper.is('div.columns.cols-3')).toBe(true);
    });

    it('renders an `Asset` and `ContentNode` for each col', () => {
      const nodes = wrapper.findAll(ContentNode);
      expect(nodes.length).toBe(3);
      expect(nodes.at(0).props('content'))
        .toEqual(propsData.columns[0].content);
      expect(nodes.at(1).props('content'))
        .toEqual(propsData.columns[1].content);
      expect(nodes.at(2).props('content'))
        .toEqual(propsData.columns[2].content);

      const assets = wrapper.findAll(Asset);
      expect(assets.length).toBe(3);
      expect(assets.at(0).props('identifier'))
        .toBe(propsData.columns[0].media);
      expect(assets.at(1).props('identifier'))
        .toBe(propsData.columns[1].media);
      expect(assets.at(2).props('identifier'))
        .toBe(propsData.columns[2].media);
    });
  });

  describe('with optional content not provided for a column', () => {
    const propsData = {
      columns: [
        column('foo'),
        columnWithoutText('bar'),
        column('baz'),
      ],
    };

    beforeEach(() => {
      wrapper = shallowMount(Columns, { propsData });
    });

    it('does not render a `ContentNode` for that column', () => {
      const nodes = wrapper.findAll(ContentNode);
      expect(nodes.length).toBe(2);

      expect(nodes.at(0).props('content')).toEqual(propsData.columns[0].content);
      expect(nodes.at(1).props('content')).toEqual(propsData.columns[2].content);
    });
  });
});
