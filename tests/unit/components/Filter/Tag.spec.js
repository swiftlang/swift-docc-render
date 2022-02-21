/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { prepareDataForHTMLClipboard } from 'docc-render/utils/clipboard';
import { shallowMount } from '@vue/test-utils';
import Tag from 'docc-render/components/Filter/Tag.vue';

describe('Tag', () => {
  let wrapper;
  let button;

  const propsData = {
    name: 'Tag A',
    isFocused: false,
    isRemovableTag: false,
    isActiveTag: false,
    activeTags: [],
  };

  beforeEach(() => {
    wrapper = shallowMount(Tag, { propsData });
    button = wrapper.find('button');
    jest.clearAllMocks();
  });
  afterEach(() => {
    // remove global even listeners before each test begins
    wrapper.destroy();
  });

  it('renders a tag', () => {
    expect(wrapper.is('.tag')).toBe(true);
    expect(wrapper.attributes()).toHaveProperty('role', 'presentation');

    expect(button.exists()).toBe(true);
    expect(button.attributes()).toHaveProperty('aria-roledescription', 'tag');
  });

  it('emits `click` when being clicked', () => {
    button.trigger('click');

    expect(wrapper.emitted().click).toBeTruthy();
  });

  it('emits `delete-tag` when being double clicked', () => {
    button.trigger('dblclick');

    expect(wrapper.emitted('delete-tag')).toBeTruthy();
    expect(wrapper.emitted('delete-tag')[0][0].tagName).toEqual(propsData.name);
  });

  it('does not emit `delete-tag` when being double clicked if `keyboardIsVirtual` is true', () => {
    wrapper.setProps({ keyboardIsVirtual: true });
    button.trigger('dblclick');

    expect(wrapper.emitted('delete-tag')).toBeFalsy();
  });

  it('emits `delete-tag` when pressing the delete keydown', () => {
    button.trigger('keydown.delete');

    expect(wrapper.emitted('delete-tag')).toBeTruthy();
  });

  it('prevents blur when deleting a tag', () => {
    button.trigger('keydown.delete');

    expect(wrapper.emitted('prevent-blur')).toBeTruthy();
  });

  it('focuses button when user clicks on tag', () => {
    // This is needed to focus tags on Safari
    // We use mousedown event instead of click to be able
    // to focus on the input right after on suggestedTags
    button.trigger('mousedown');
    expect(wrapper.emitted('delete-tag')).toBeFalsy();

    expect(document.activeElement).toBe(button.element);
    expect(wrapper.emitted('focus')).toBeTruthy();
  });

  it('does not prevent blur when focusing in a tag', () => {
    button.trigger('mousedown');

    expect(document.activeElement).toBe(button.element);
    expect(wrapper.emitted('prevent-blur')).toBeFalsy();
  });

  it('does not focus the button when `keyboardIsVirtual` is true', () => {
    // This is needed to prevent from focusing the button
    // on tags when user uses a virtual keyboard
    wrapper.setProps({ keyboardIsVirtual: true });
    button = wrapper.find('button');
    button.trigger('mousedown');

    expect(wrapper.emitted('focus')).toBeFalsy();
  });

  it('does not delete the tag if clicked from VO but NOT focused', () => {
    button.trigger('mousedown', {
      buttons: 0,
    });
    expect(wrapper.emitted('delete-tag')).toBeFalsy();

    expect(document.activeElement).toBe(button.element);
  });

  it('deletes the tag if clicked from VO and is focused', () => {
    wrapper.setProps({ isFocused: true });
    button.trigger('mousedown', {
      buttons: 0,
    });
    expect(wrapper.emitted('delete-tag')).toBeTruthy();

    expect(document.activeElement).toBe(button.element);
    expect(wrapper.emitted('prevent-blur')).toBeTruthy();
  });

  it('adds extra text `Add tag -` as a span inside button if `isRemovableTag: false`', () => {
    wrapper.setProps({
      isRemovableTag: false,
    });
    const span = wrapper.findAll('span.visuallyhidden');
    expect(span.exists()).toBe(true);
    expect(span.length).toBe(1);
    expect(span.at(0).text()).toEqual('Add tag -');
  });

  it('adds extra text `– Tag` as a span inside button if `isRemovableTag: true`', () => {
    wrapper.setProps({
      isRemovableTag: true,
    });
    const span = wrapper.findAll('span.visuallyhidden');
    expect(span.length).toBe(1);
    expect(span.at(0).text()).toEqual('– Tag. Select to remove from list.');
  });

  describe('copy/cut', () => {
    const setData = jest.fn();
    const clipboardData = {
      setData,
    };
    const { Event } = window;

    function triggerGlobalEvent(eventName, data = clipboardData) {
      const clipboardEvent = new Event(eventName);
      clipboardEvent.clipboardData = data;
      document.dispatchEvent(clipboardEvent);
      return clipboardEvent;
    }

    beforeEach(() => {
      // TODO: remove hack for VueTestUtils to overwrite `clipboardData`, when we update version.
      window.Event = null;
    });
    afterEach(() => {
      window.Event = Event;
    });
    it('adds and removes event listeners on mounted and destroyed', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      wrapper = shallowMount(Tag, { propsData });
      // assert `copy` and `cut` are added
      expect(addEventListenerSpy).toHaveBeenCalledTimes(3);
      expect(addEventListenerSpy).toHaveBeenCalledWith('copy', wrapper.vm.handleCopy);
      expect(addEventListenerSpy).toHaveBeenCalledWith('cut', wrapper.vm.handleCut);
      expect(addEventListenerSpy).toHaveBeenCalledWith('paste', wrapper.vm.handlePaste);
      // assert `copy` and `cut` are removed
      wrapper.destroy();
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(3);
      expect(removeEventListenerSpy).toHaveBeenCalledWith('copy', wrapper.vm.handleCopy);
      expect(removeEventListenerSpy).toHaveBeenCalledWith('cut', wrapper.vm.handleCut);
      expect(removeEventListenerSpy).toHaveBeenCalledWith('paste', wrapper.vm.handlePaste);
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('handles a global copy command, only when tag is focused', async () => {
      expect(setData).not.toHaveBeenCalled();

      wrapper.setProps({
        isFocused: true,
      });
      triggerGlobalEvent('copy');
      expect(setData).toHaveBeenCalledTimes(2);
      expect(setData)
        .toHaveBeenNthCalledWith(1, 'text/html', prepareDataForHTMLClipboard({ tags: [propsData.name] }));
      expect(setData).toHaveBeenNthCalledWith(2, 'text/plain', propsData.name);
      expect(wrapper.emitted('delete-tag')).toBeFalsy();
    });

    it('handles cutting a tag, only when tag is focused and removable', () => {
      triggerGlobalEvent('cut');

      expect(setData).not.toHaveBeenCalled();

      wrapper.setProps({
        isFocused: true,
      });
      triggerGlobalEvent('cut');

      expect(setData).not.toHaveBeenCalled();

      wrapper.setProps({
        isFocused: true,
        isRemovableTag: true,
      });
      triggerGlobalEvent('cut');

      expect(setData).toHaveBeenCalledTimes(2);
      expect(setData)
        .toHaveBeenNthCalledWith(1, 'text/html', prepareDataForHTMLClipboard({ tags: [propsData.name] }));
      expect(setData).toHaveBeenNthCalledWith(2, 'text/plain', propsData.name);
      expect(wrapper.emitted('delete-tag')).toBeTruthy();
    });

    it('handles copying a tag directly on the button', () => {
      wrapper.setProps({
        isFocused: true,
      });
      wrapper.find({ ref: 'button' }).trigger('copy', { clipboardData });
      expect(clipboardData.setData).toHaveBeenCalledTimes(2);
      expect(clipboardData.setData)
        .toHaveBeenCalledWith('text/html', prepareDataForHTMLClipboard({ tags: [propsData.name] }));
      expect(clipboardData.setData).toHaveBeenCalledWith('text/plain', propsData.name);
    });

    it('on paste, does nothing if tag is not focused', () => {
      triggerGlobalEvent('paste');

      expect(wrapper.emitted('paste-content')).toBeFalsy();
      expect(wrapper.emitted('delete-tag')).toBeFalsy();
    });

    it('on paste, does nothing if tag is focused but not removable', () => {
      wrapper.setProps({
        isFocused: true,
      });

      triggerGlobalEvent('paste');

      expect(wrapper.emitted('paste-content')).toBeFalsy();
      expect(wrapper.emitted('delete-tag')).toBeFalsy();
    });

    it('on paste, does nothing if tag is not focused, but removable', () => {
      wrapper.setProps({
        isRemovableTag: true,
      });

      triggerGlobalEvent('paste');

      expect(wrapper.emitted('paste-content')).toBeFalsy();
      expect(wrapper.emitted('delete-tag')).toBeFalsy();
    });

    it('on paste, deletes the current tag and emits up the event body, if focused and removable', () => {
      wrapper.setProps({
        isFocused: true,
        isRemovableTag: true,
      });

      const event = triggerGlobalEvent('paste');

      // assert the tag is being deleted and the `paste-content` event is emitted once
      expect(wrapper.emitted('delete-tag')).toHaveLength(1);
      expect(wrapper.emitted('paste-content')).toHaveLength(1);
      // assert the event is being passed up.
      expect(wrapper.emitted('paste-content')[0][0]).toEqual(event);
    });
  });
});
