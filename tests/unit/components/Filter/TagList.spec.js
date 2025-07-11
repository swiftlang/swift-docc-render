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
import TagList from 'docc-render/components/Filter/TagList.vue';

describe('TagList', () => {
  let wrapper;
  let tag1;
  let tag2;

  const {
    Tag,
  } = TagList.components;

  const propsData = {
    tags: ['Tag1', 'Tag2'],
    activeTags: [],
  };

  beforeEach(() => {
    wrapper = shallowMount(TagList, { propsData });
    tag1 = wrapper.findAllComponents(Tag).at(0);
    tag2 = wrapper.findAllComponents(Tag).at(1);
  });

  it('renders `Tag` components', () => {
    const tags = wrapper.findAllComponents(Tag);

    expect(tags.length).toBe(2);
  });

  it('renders an `scrolling` class inside the tag list if `isScrolling` is true', async () => {
    const list = wrapper.findComponent({ ref: 'scroll-wrapper' });

    expect(list.classes('scrolling')).toBe(false);

    await wrapper.setData({ isScrolling: true });

    expect(list.classes('scrolling')).toBe(true);
  });

  it('re-emits `prevent-blur` when tag emitted `prevent-blur`', async () => {
    tag1.vm.$emit('prevent-blur');
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('prevent-blur')).toBeTruthy();
  });

  describe('when being focus on the first tag', () => {
    beforeEach(() => {
      tag1.vm.$emit('focus');
    });

    it('sets `focusedIndex` to the index value of the focused tag', () => {
      expect(wrapper.vm.focusedIndex).toBe(0);
    });

    it('allows the user to navigate through arrow keys', () => {
      tag1.trigger('keydown.right');
      expect(wrapper.vm.focusedIndex).toBe(1);

      tag2.trigger('keydown.left');
      expect(wrapper.vm.focusedIndex).toBe(0);

      tag1.trigger('keydown.down');
      expect(wrapper.vm.focusedIndex).toBe(1);

      tag2.trigger('keydown.up');
      expect(wrapper.vm.focusedIndex).toBe(0);
    });

    it('does not allow users to navigate through arrow keys if they are holding shift + cmd or shift + ctrl', () => {
      tag1.trigger('keydown.shift.cmd.right');
      expect(wrapper.vm.focusedIndex).toBe(0);

      tag2.trigger('keydown.shift.cmd.left');
      expect(wrapper.vm.focusedIndex).toBe(0);

      tag1.trigger('keydown.shift.cmd.down');
      expect(wrapper.vm.focusedIndex).toBe(0);

      tag2.trigger('keydown.shift.cmd.up');
      expect(wrapper.vm.focusedIndex).toBe(0);

      tag1.trigger('keydown.shift.ctrl.right');
      expect(wrapper.vm.focusedIndex).toBe(0);

      tag2.trigger('keydown.shift.ctrl.left');
      expect(wrapper.vm.focusedIndex).toBe(0);

      tag1.trigger('keydown.shift.ctrl.down');
      expect(wrapper.vm.focusedIndex).toBe(0);

      tag2.trigger('keydown.shift.ctrl.up');
      expect(wrapper.vm.focusedIndex).toBe(0);
    });

    it('emits `focus-prev` when clicking on the up arrow', () => {
      tag1.trigger('keydown.up');
      expect(wrapper.vm.focusedIndex).toBe(0);
      expect(wrapper.emitted('focus-prev')).toBeTruthy();
    });
  });

  describe('when being focus on the last tag', () => {
    beforeEach(() => {
      tag2.vm.$emit('focus');
    });

    it('sets `focusedIndex` to the index value of the focus tag', () => {
      expect(wrapper.vm.focusedIndex).toBe(1);
    });

    it('emits `focus-next` when clicking on the down arrow', () => {
      tag2.trigger('keydown.down');
      expect(wrapper.vm.focusedIndex).toBe(1);
      expect(wrapper.emitted('focus-next')).toBeTruthy();
    });

    it('emits `focus-next` when clicking on the right arrow', () => {
      tag2.trigger('keydown.right');
      expect(wrapper.vm.focusedIndex).toBe(1);
      expect(wrapper.emitted('focus-next')).toBeTruthy();
    });
  });

  it('reset filters when pressing the delete button while being focus only on the list', () => {
    const list = wrapper.findComponent({ ref: 'tags' });
    expect(list.exists()).toBe(true);

    list.trigger('keydown.delete.self');
    expect(wrapper.emitted('reset-filters')).toBeTruthy();
  });

  it('does not reset filters when hitting `Enter` while being focus only on the list', () => {
    const list = wrapper.findComponent({ ref: 'tags' });

    list.trigger('keydown', {
      key: 'Enter',
    });

    expect(wrapper.emitted('reset-filters')).not.toBeTruthy();
  });

  it('does not delete tag when hitting `Enter` while being focus only tag', () => {
    const tag = wrapper.findComponent({ ref: 'tag' });

    tag.trigger('keydown', {
      key: 'Enter',
    });

    expect(wrapper.emitted('delete-tag')).not.toBeTruthy();
  });

  it('deletes tag when hitting an alphanum key or space while being focus only tag', async () => {
    const tag = wrapper.findComponent({ ref: 'tag' });
    const alphanumKey = 'a';
    const input = 'foo';
    const space = ' ';
    await wrapper.setProps({ input });
    await wrapper.setData({ focusedIndex: 0 });
    tag.trigger('keydown', { key: alphanumKey });

    expect(wrapper.emitted('delete-tag')[0][0].tagName).toEqual(propsData.tags[0]);

    tag.trigger('keydown', { key: space });

    expect(wrapper.emitted('delete-tag')).toBeTruthy();
  });

  it('emits `select-all` when user has text on input and `command + a` is triggered on any tag', async () => {
    await wrapper.setProps({ input: 'something' });

    wrapper.findComponent({ ref: 'tags' }).trigger('keydown', {
      key: 'a',
      metaKey: true,
    });

    expect(wrapper.emitted('select-all')).toBeTruthy();
  });

  it('emits up `paste-tags`, when a tag emits a `paste-content` event', async () => {
    const tag = wrapper.findComponent({ ref: 'tag' });
    const payload = { someData: 'someData' };
    tag.vm.$emit('paste-content', payload);
    await wrapper.vm.$nextTick();
    // assert its emitted only once
    expect(wrapper.emitted('paste-tags')).toHaveLength(1);
    // assert it passes up the event payload up
    expect(wrapper.emitted('paste-tags')[0][0]).toEqual(payload);
  });

  describe('Removable Tags', () => {
    it('sets passed down `isRemovableTag` on tags', async () => {
      expect(wrapper.findComponent(Tag).props()).toHaveProperty('isRemovableTag', false);
      await wrapper.setProps({ areTagsRemovable: true });
      expect(wrapper.findComponent(Tag).props()).toHaveProperty('isRemovableTag', true);
    });

    it('sets the tabindex on the `ul`', () => {
      expect(wrapper.findComponent('ul').attributes()).toHaveProperty('tabindex', '0');
    });
  });
});
