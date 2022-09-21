/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import TaskList from 'docc-render/components/ContentNode/TaskList.vue';

describe('ContentNode', () => {
  const createWrapper = options => shallowMount(TaskList, options);

  it('renders a list with a disabled checkbox for each list item', () => {
    const tasks = [
      { checked: false },
      { checked: true },
    ];

    const wrapper = createWrapper({
      propsData: { tasks },
    });
    expect(wrapper.is('ul.tasklist')).toBe(true);

    const checkboxes = wrapper.findAll('li input[disabled][type="checkbox"]');
    expect(checkboxes.length).toBe(tasks.length);
    expect(checkboxes.at(0).element.checked).toBe(tasks[0].checked);
    expect(checkboxes.at(1).element.checked).toBe(tasks[1].checked);
  });

  it('renders slot content for tasks', () => {
    const tasks = [
      { checked: false, text: 'foo' },
      { checked: true, text: 'bar' },
    ];

    const wrapper = createWrapper({
      propsData: { tasks },
      scopedSlots: {
        task: function render(slotProps) {
          return this.$createElement('p', slotProps.task.text);
        },
      },
    });

    const paragraphs = wrapper.findAll('li p');
    expect(paragraphs.length).toBe(tasks.length);
    expect(paragraphs.at(0).text()).toBe(tasks[0].text);
    expect(paragraphs.at(1).text()).toBe(tasks[1].text);
  });

  it('does not render checkbox for items without `checked` prop', () => {
    const tasks = [
      { checked: false, content: 'foo' },
      { content: 'bar' },
      { checked: true, content: 'baz' },
    ];

    const wrapper = createWrapper({
      propsData: { tasks },
    });
    const items = wrapper.findAll('li');
    expect(items.length).toBe(tasks.length);
    expect(items.at(0).find('input[type="checkbox"]').exists()).toBe(true);
    expect(items.at(1).find('input[type="checkbox"]').exists()).toBe(false);
    expect(items.at(2).find('input[type="checkbox"]').exists()).toBe(true);
  });
});
