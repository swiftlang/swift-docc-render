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
import Section from 'docc-render/components/Tutorial/Section.vue';

const {
  Intro,
  LinkableSection,
  Steps,
} = Section.components;

const paragraph = text => ({
  type: 'paragraph',
  inlineContent: [
    {
      type: 'text',
      text,
    },
  ],
});

describe('Section', () => {
  let wrapper;

  const expandedIntroSections = [
    {
      kind: 'fullWidth',
      content: [{ type: 'text', text: 'foo' }],
    },
  ];

  const propsData = {
    anchor: 'foo',
    title: 'Foo',
    sectionNumber: 42,
    isRuntimePreviewVisible: true,
    contentSection: [
      {
        content: [paragraph('foo')],
        media: 'foo.jpg',
      },
      ...expandedIntroSections,
    ],
    stepsSection: [
      {
        type: 'step',
        content: [paragraph('bar')],
        media: 'bar.jpg',
      },
      paragraph('baz'),
      {
        type: 'step',
        code: 'qux.swift',
        content: [paragraph('qux')],
        runtimePreview: 'qux.jpg',
      },
    ],
  };

  beforeEach(() => {
    wrapper = shallowMount(Section, { propsData });
  });

  it('renders a `LinkableSection`', () => {
    const section = wrapper.find(LinkableSection);
    expect(section.exists()).toBe(true);
    expect(section.classes('section')).toBe(true);
    expect(section.props()).toEqual({
      anchor: 'foo',
      depth: 0,
      tag: 'div',
      title: 'Foo',
    });
  });

  it('renders an `Intro`', () => {
    const section = wrapper.find(Section);
    const intro = wrapper.find(Intro);
    expect(section.exists()).toBe(true);
    expect(section.props('title')).toEqual('Foo');
    expect(intro.exists()).toBe(true);
    expect(intro.props('title')).toEqual(section.props('title'));
    expect(intro.props('content')).toEqual(propsData.contentSection[0].content);
    expect(intro.props('sectionNumber')).toBe(propsData.sectionNumber);
    expect(intro.props('expandedSections')).toEqual(expandedIntroSections);
  });

  it('renders a `Steps`', () => {
    const steps = wrapper.find(Steps);
    expect(steps.exists()).toBe(true);
    expect(steps.props('content')).toEqual(propsData.stepsSection);
  });

  describe('when a `Steps` emits a "runtime-preview-toggle" event', () => {
    beforeEach(() => {
      wrapper.find(Steps).vm.$emit('runtime-preview-toggle', false);
    });

    it('emits the event as well with the same value', () => {
      expect(wrapper.emitted()['runtime-preview-toggle'][0]).toEqual([false]);
    });
  });

  describe('section with no step content', () => {
    beforeEach(() => {
      wrapper = shallowMount(Section, {
        propsData: {
          ...propsData,
          stepsSection: [],
        },
      });
    });

    it('does not render a steps section', () => {
      expect(wrapper.find(Steps).exists()).toBe(false);
    });
  });
});
