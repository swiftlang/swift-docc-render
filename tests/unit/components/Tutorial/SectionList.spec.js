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
import SectionList from 'docc-render/components/Tutorial/SectionList.vue';

const {
  Section,
} = SectionList.components;

describe('SectionList', () => {
  let wrapper;

  const provide = { isTargetIDE: false };

  const propsData = {
    tasks: [
      {
        anchor: 'task-a',
        title: 'Task A',
        contentSection: [
          {
            layout: 'titled2Up',
            media: 'task-a.jpg',
            content: [
              {
                type: 'text',
                text: 'A',
              },
            ],
          },
        ],
        stepsSection: [
          {
            type: 'step',
            content: [],
            media: 'task-a-step-0.jpg',
          },
        ],
      },
      {
        anchor: 'task-b',
        title: 'Task B',
        contentSection: [
          {
            layout: 'titled2Up',
            media: 'task-b.jpg',
            content: [
              {
                type: 'text',
                text: 'B',
              },
            ],
          },
        ],
        stepsSection: [
          {
            type: 'step',
            content: [],
            code: 'task-b-step-0.swift',
            runtimePreview: 'task-b-step-0.jpg',
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    wrapper = shallowMount(SectionList, { propsData, provide });
  });

  it('renders a div.sections with a `Section` for each section', () => {
    expect(wrapper.is('div.sections')).toBe(true);
    const sections = wrapper.findAll(Section);
    expect(sections.length).toBe(propsData.tasks.length);

    const sectionA = sections.at(0);
    expect(sectionA.props('sectionNumber')).toBe(1);
    expect(sectionA.props('contentSection'))
      .toEqual(propsData.tasks[0].contentSection);
    expect(sectionA.props('stepsSection'))
      .toEqual(propsData.tasks[0].stepsSection);
    const sectionB = sections.at(1);
    expect(sectionB.props('sectionNumber')).toBe(2);
    expect(sectionB.props('contentSection'))
      .toEqual(propsData.tasks[1].contentSection);
    expect(sectionB.props('stepsSection'))
      .toEqual(propsData.tasks[1].stepsSection);
  });

  describe('when a `Section` emits a "runtime-preview-toggle" event', () => {
    beforeEach(() => {
      wrapper.find(Section).vm.$emit('runtime-preview-toggle', false);
    });

    it('updates the `isRuntimePreviewVisible` prop of all the `Section`s', () => {
      wrapper.findAll(Section).wrappers.forEach((section) => {
        expect(section.props('isRuntimePreviewVisible')).toBe(false);
      });
    });
  });
});
