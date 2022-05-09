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
import TutorialsOverview from 'docc-render/components/TutorialsOverview.vue';

const {
  Hero,
  LearningPath,
  Nav,
} = TutorialsOverview.components;
const { SectionKind } = TutorialsOverview.constants;

describe('TutorialsOverview', () => {
  let wrapper;

  const propsData = {
    metadata: {
      category: 'SwiftUI',
      estimatedTime: '3hr 55min',
    },
    sections: [
      {
        kind: SectionKind.hero,
        title: 'Foo Bar',
        content: [{
          inlineContent: [{
            type: 'text',
            text: 'Hero description',
          }],
          type: 'paragraph',
        }],
        image: 'foobar.png',
      },
      {
        kind: SectionKind.volume,
        chapters: [
          {
            name: 'Baz',
            tutorials: ['qux'],
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    wrapper = shallowMount(TutorialsOverview, { propsData });
  });

  it('provides a page title based on the category', () => {
    expect(document.title).toBe(`${propsData.metadata.category} Tutorials | Documentation`);
  });

  it('provides a page title with `Tutorials` even when category is empty', () => {
    wrapper = shallowMount(TutorialsOverview, {
      propsData: {
        ...propsData,
        metadata: {
          category: '',
        },
      },
    });

    const titleText = 'Tutorials | Documentation';

    expect(document.title).toBe(titleText);
  });

  it('provides a page description based on the hero content text', () => {
    const { text: heroContentText } = propsData.sections[0].content[0].inlineContent[0];

    expect(document.querySelector('meta[name="description"]').content).toBe(heroContentText);
  });

  it('renders a `nav` with the category name as the title', () => {
    const nav = wrapper.find(Nav);
    expect(nav.exists()).toBe(true);
    expect(nav.text()).toBe(propsData.metadata.category);
  });

  it('does not render the `nav` for IDE targets', () => {
    wrapper = shallowMount(TutorialsOverview, {
      propsData,
      provide: { isTargetIDE: true },
    });
    expect(wrapper.contains(Nav)).toBe(false);
  });

  it('renders a `Hero`', () => {
    const hero = wrapper.find(Hero);
    expect(hero.exists()).toBe(true);

    const { kind, ...heroProps } = propsData.sections[0];
    expect(hero.props()).toEqual({
      ...heroProps,
      estimatedTime: propsData.metadata.estimatedTime,
    });
  });

  it('renders a `LearningPath`', () => {
    const learningPath = wrapper.find(LearningPath);
    expect(learningPath.exists()).toBe(true);
    expect(learningPath.props('sections')).toEqual(propsData.sections.slice(1));
  });

  it('exposes a `above-hero` slot', () => {
    wrapper = shallowMount(TutorialsOverview, {
      propsData,
      slots: { 'above-hero': 'Above Hero Content' },
    });
    expect(wrapper.text()).toContain('Above Hero Content');
  });
});
