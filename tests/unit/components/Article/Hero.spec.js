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
import Hero from 'docc-render/components/Article/Hero.vue';
// eslint-disable-next-line import/no-named-default
import { default as TutorialHero } from 'docc-render/components/Tutorial/Hero.vue';

describe('Hero', () => {
  let wrapper;

  const propsData = {
    backgroundImage: 'bg.jpg',
    chapter: 'Learning Swift',
    content: [
      {
        type: 'paragraph',
        inlineContent: [
          {
            type: 'text',
            text: 'Property wrappers...',
          },
        ],
      },
    ],
    estimatedTimeInMinutes: 42,
    title: 'Swift Property Wrappers',
  };

  beforeEach(() => {
    wrapper = shallowMount(Hero, { propsData });
  });

  it('renders a `TutorialHero`', () => {
    const hero = wrapper.find(TutorialHero);
    expect(hero.exists()).toBe(true);
    expect(hero.props()).toEqual(propsData);
  });
});
