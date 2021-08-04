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
import LearningPath from 'docc-render/components/TutorialsOverview/LearningPath.vue';

const { SectionKind } = LearningPath.constants;
const {
  Resources,
  Volume,
  TutorialsNavigation,
} = LearningPath.components;

describe('LearningPath', () => {
  let wrapper;

  const propsData = {
    sections: [
      {
        kind: SectionKind.volume,
        chapters: [
          { name: 'Foo', tutorials: ['foo'] },
          { name: 'Bar', tutorials: ['bar'] },
        ],
        name: 'Volume Name',
        content: [{ type: 'text', text: 'Come Description' }],
        image: 'path-to-image.jpg',
      },
      {
        kind: SectionKind.resources,
        tiles: [
          {
            title: 'A',
            content: [{ type: 'text', text: 'a' }],
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    wrapper = shallowMount(LearningPath, { propsData });
  });

  it('renders a .learning-path root', () => {
    expect(wrapper.is('.learning-path')).toBe(true);
  });

  it('renders a TutorialsNavigation if in Web mode', () => {
    const navigation = wrapper.find(TutorialsNavigation);
    expect(navigation.exists()).toBe(true);
    expect(navigation.props('sections')).toEqual(propsData.sections);
    expect(navigation.attributes('aria-label')).toBe('On this page');
  });

  it('does not render TutorialsNavigation in IDE mode', () => {
    wrapper = shallowMount(LearningPath, {
      propsData,
      provide: { isTargetIDE: true },
    });
    expect(wrapper.find(TutorialsNavigation).exists()).toBe(false);
  });

  it('renders a main container with primary/secondary content containers', () => {
    const main = wrapper.find('.main-container');
    expect(main.exists()).toBe(true);

    expect(main.contains('.secondary-content-container')).toBe(true);
    expect(main.contains('.primary-content-container')).toBe(true);
  });

  it('does not render a secondary content container for IDE targets', () => {
    wrapper = shallowMount(LearningPath, {
      propsData,
      provide: { isTargetIDE: true },
    });
    expect(wrapper.classes('ide')).toBe(true);
    expect(wrapper.contains('.secondary-content-container')).toBe(false);
  });

  it('renders a `Volume` section', () => {
    const { kind, ...volumeProps } = propsData.sections[0];
    const volume = wrapper.find(Volume);
    expect(volume.exists()).toBe(true);
    expect(volume.props('chapters')).toEqual(volumeProps.chapters);
    expect(volume.props('content')).toEqual(volumeProps.content);
    expect(volume.props('image')).toEqual(volumeProps.image);
    expect(volume.props('name')).toEqual(volumeProps.name);
  });

  it('renders a `Resources` section', () => {
    const { kind, ...resourcesProps } = propsData.sections[1];
    const resources = wrapper.find(Resources);
    expect(resources.exists()).toBe(true);
    expect(resources.props()).toEqual(resourcesProps);
  });

  it('wraps sections in a container (to group for border selectors)', () => {
    const container = wrapper.find('.content-sections-container');
    expect(container.exists()).toBe(true);
    expect(container.findAll(Volume).length).toBe(1);
    expect(container.findAll(Resources).length).toBe(1);
  });
});
