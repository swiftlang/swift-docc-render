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
import Hero from 'docc-render/components/TutorialsOverview/Hero.vue';

const {
  Asset,
  CallToActionButton,
  ContentNode,
  TimerIcon,
} = Hero.components;

const propsData = {
  action: {
    type: 'reference',
    identifier: 'foobar',
    overridingTitle: 'Get started',
  },
  content: [
    {
      type: 'paragraph',
      inlineContent: [
        {
          type: 'text',
          text: 'foo bar',
        },
      ],
    },
  ],
  estimatedTime: '4hr 2min',
  image: 'foo.bar',
  title: 'Foo Bar',
};

describe('Hero', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Hero, { propsData });
  });

  it('renders a section.hero root', () => {
    expect(wrapper.is('section.hero')).toBe(true);
  });

  it('renders an h1 title', () => {
    const h1 = wrapper.find('h1.title');
    expect(h1.exists()).toBe(true);
    expect(h1.text()).toBe(propsData.title);
  });

  it('renders a `ContentNode`', () => {
    const node = wrapper.find(ContentNode);
    expect(node.exists()).toBe(true);
    expect(node.props('content')).toEqual(propsData.content);
  });

  it('renders a `CallToActionButton`', () => {
    const btn = wrapper.find(CallToActionButton);
    expect(btn.exists()).toBe(true);
    expect(btn.props('action')).toEqual(propsData.action);
    expect(btn.props('isDark')).toBe(true);
    expect(btn.attributes('aria-label'))
      .toBe(`${propsData.action.overridingTitle} with ${propsData.title}`);
  });

  it('renders an `Asset`', () => {
    const asset = wrapper.find(Asset);
    expect(asset.exists()).toBe(true);
    expect(asset.props('identifier')).toBe(propsData.image);
  });

  it('renders an estimated time', () => {
    const meta = wrapper.find('p.meta');
    expect(meta.exists()).toBe(true);
    expect(meta.text()).toMatch(/4hr 2min\s+Estimated Time/);

    expect(meta.contains(TimerIcon)).toBe(true);

    const time = meta.find('.time');
    expect(time.exists()).toBe(true);
    expect(time.text()).toBe(propsData.estimatedTime);
  });
});
