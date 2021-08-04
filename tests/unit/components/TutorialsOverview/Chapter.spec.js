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
import Chapter from 'docc-render/components/TutorialsOverview/Chapter.vue';

const {
  Asset,
  ContentNode,
  TopicList,
} = Chapter.components;

describe('Chapter', () => {
  let wrapper;

  const propsData = {
    content: [
      {
        type: 'paragraph',
        inlineContent: [
          {
            type: 'text',
            text: 'This is content',
          },
        ],
      },
    ],
    image: 'foo.png',
    name: 'Foo',
    number: 1,
    topics: [
      {
        estimatedTime: '1min',
        kind: 'article',
        url: '/bar',
        title: 'Bar',
      },
      {
        estimatedTime: '2min',
        kind: 'project',
        url: '/baz',
        title: 'Baz',
      },
    ],
    volumeHasName: true,
  };

  const provide = {
    store: {
      setActiveSidebarLink: jest.fn(),
      setActiveVolume: jest.fn(),
    },
  };

  beforeEach(() => {
    wrapper = shallowMount(Chapter, { propsData, provide });
  });

  it('renders a section.chapter root', () => {
    expect(wrapper.is('section.chapter')).toBe(true);
    expect(wrapper.attributes('id')).toBe('foo');
  });

  it('renders an `Asset`', () => {
    const asset = wrapper.find(Asset);
    expect(asset.exists()).toBe(true);
    expect(asset.props('identifier')).toBe(propsData.image);
    expect(asset.attributes('aria-hidden')).toBe('true');
  });

  it('renders an `.name` with dynamic heading tag and the name/number', () => {
    const name = wrapper.find('.name');
    expect(name.exists()).toBe(true);
    expect(name.is('H3')).toBe(true);
    expect(name.text()).toMatch(/Chapter 1\s+Foo/);
    expect(name.attributes('aria-label')).toEqual('Foo - Chapter 1');

    const eyebrow = name.find('.eyebrow');
    expect(eyebrow.exists()).toBe(true);
    expect(eyebrow.text()).toBe('Chapter 1');
    expect(eyebrow.attributes('aria-hidden')).toBe('true');
  });

  it('renders the `.name` with H2 if volume has no name', () => {
    wrapper.setProps({ volumeHasName: false });
    const name = wrapper.find('.name');
    expect(name.is('H2')).toBe(true);
  });

  it('renders a `ContentNode`', () => {
    const node = wrapper.find(ContentNode);
    expect(node.exists()).toBe(true);
    expect(node.props('content')).toEqual(propsData.content);
  });

  it('renders a `TopicList`', () => {
    const list = wrapper.find(TopicList);
    expect(list.exists()).toBe(true);
    expect(list.props('topics')).toEqual(propsData.topics);
  });

  it('sets the active tutorial link when intersecting the viewport center', () => {
    wrapper.vm.onIntersectViewport();
    expect(provide.store.setActiveSidebarLink).toBeCalledWith(propsData.name);
    expect(provide.store.setActiveVolume).toBeCalledTimes(0);
  });

  it('unsets the volume, if it has no name, when intersecting the viewport center', () => {
    wrapper.setProps({
      volumeHasName: false,
    });
    wrapper.vm.onIntersectViewport();
    expect(provide.store.setActiveSidebarLink).toBeCalledWith(propsData.name);
    expect(provide.store.setActiveVolume).toBeCalledTimes(1);
    expect(provide.store.setActiveVolume).toBeCalledWith(null);
  });
});
