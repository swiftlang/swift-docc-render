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
import Volume from 'docc-render/components/TutorialsOverview/Volume.vue';

const {
  Chapter,
  VolumeName,
} = Volume.components;

describe('Volume', () => {
  let wrapper;

  const topics = {
    a: {
      identifier: 'a',
      title: 'A',
      type: 'topic',
      url: '/tutorials/blah/a',
    },
    b: {
      identifier: 'b',
      title: 'B',
      type: 'topic',
      url: '/tutorials/blah/b',
    },
    c: {
      identifier: 'c',
      title: 'C',
      type: 'topic',
      url: '/tutorials/blah/c',
    },
  };

  const provide = {
    references: {
      [topics.a.identifier]: topics.a,
      [topics.b.identifier]: topics.b,
      [topics.c.identifier]: topics.c,
    },
    store: {
      setActiveVolume: jest.fn(),
    },
  };

  const propsData = {
    name: 'FooBar',
    image: 'foobar.png',
    content: [
      {
        type: 'paragraph',
        inlineContent: [
          {
            type: 'text',
            text: 'blah',
          },
        ],
      },
    ],
    chapters: [
      {
        name: 'Foo',
        image: 'foo.png',
        tutorials: [
          topics.a.identifier,
          topics.b.identifier,
        ],
        content: [
          {
            type: 'paragraph',
            inlineContent: [{ type: 'text', text: 'blah' }],
          },
        ],
      },
      {
        name: 'Bar',
        image: 'bar.png',
        tutorials: [
          topics.c.identifier,
          'd',
        ],
        content: [
          {
            type: 'paragraph',
            inlineContent: [{ type: 'text', text: 'blah' }],
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    wrapper = shallowMount(Volume, { propsData, provide });
  });

  it('renders a section.volume root', () => {
    expect(wrapper.is('section.volume')).toBe(true);
  });

  it('renders an VolumeName', () => {
    const title = wrapper.find(VolumeName);
    expect(title.exists()).toBe(true);
    expect(title.props('name')).toBe('FooBar');
    expect(title.props('content')).toEqual(propsData.content);
  });

  it('renders a `Chapter` for each chapter', () => {
    const chapters = wrapper.findAll(Chapter);
    expect(chapters.length).toBe(propsData.chapters.length);

    chapters.wrappers.forEach((chapter, i) => {
      expect(chapter.props('content')).toEqual(propsData.chapters[i].content);
      expect(chapter.props('image')).toBe(propsData.chapters[i].image);
      expect(chapter.props('name')).toBe(propsData.chapters[i].name);
      expect(chapter.props('number')).toBe(i + 1);
      expect(chapter.props('volumeHasName')).toBe(true);
    });

    expect(chapters.at(0).props('topics')).toEqual([
      topics.a,
      topics.b,
    ]);
    expect(chapters.at(1).props('topics')).toEqual([
      topics.c,
    ]);
  });

  it('sets the active volume when intersecting the viewport center', () => {
    wrapper.vm.onIntersectViewport();
    expect(provide.store.setActiveVolume).toBeCalledWith(propsData.name);
  });

  it('renders a volume without a name', () => {
    wrapper.setProps({ name: undefined });
    expect(wrapper.find(VolumeName).exists()).toBe(false);
    expect(wrapper.find(Chapter).props('volumeHasName')).toBe(false);
  });
});
