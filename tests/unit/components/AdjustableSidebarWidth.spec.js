/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import AdjustableSidebarWidth, {
  eventsMap,
  STORAGE_KEY,
} from '@/components/AdjustableSidebarWidth.vue';
import { shallowMount } from '@vue/test-utils';
import { storage } from 'docc-render/utils/storage';
import { createEvent } from '../../../test-utils';

jest.mock('docc-render/utils/storage');

storage.get.mockImplementation((key, value) => value);

const createWrapper = opts => shallowMount(AdjustableSidebarWidth, {
  slots: {
    aside: '<div class="aside-content">Aside Content</div>',
    default: '<div class="default-content">Default Content</div>',
  },
  ...opts,
});

function assertWidth(wrapper, value) {
  expect(wrapper.find('.aside').attributes('style')).toContain(`width: ${value}px`);
}

Object.defineProperty(HTMLElement.prototype, 'offsetLeft', { configurable: true, value: 100 });

describe('AdjustableSidebarWidth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders the AdjustableSidebarWidth', () => {
    const wrapper = createWrapper();
    // sidebar
    expect(wrapper.find('.sidebar').exists()).toBe(true);
    expect(wrapper.find('.aside').exists()).toBe(true);
    // handle
    expect(wrapper.find('.resize-handle').exists()).toBe(true);
    // sidebar-slot
    expect(wrapper.find('.aside-content').text()).toBe('Aside Content');
    // content and default slot
    expect(wrapper.find('.default-content').text()).toBe('Default Content');
  });

  describe('on mount', () => {
    it('sets the `width` to the minWidth, on mount', () => {
      const wrapper = createWrapper({
        propsData: {
          minWidth: 320,
        },
      });
      assertWidth(wrapper, 320);
    });

    it('sets the `width` to the last stored value', () => {
      storage.get.mockReturnValueOnce(450);
      const wrapper = createWrapper({
        propsData: {
          minWidth: 320,
        },
      });
      assertWidth(wrapper, 450);
      expect(storage.get).toHaveBeenLastCalledWith(STORAGE_KEY, 320);
    });

    it('sets the `width` to the `window.innerWidth`, if stored value is bigger', () => {
      storage.get.mockReturnValueOnce(1500);
      window.innerWidth = 1000;
      const wrapper = createWrapper();
      assertWidth(wrapper, window.innerWidth);
    });
  });

  it('allows opening the sidebar externally', () => {
    const wrapper = createWrapper({
      propsData: {
        openExternally: true,
      },
    });
    expect(wrapper.find('.aside').classes()).toContain('force-open');
    wrapper.setProps({
      openExternally: false,
    });
    expect(wrapper.find('.aside').classes()).not.toContain('force-open');
  });

  it('allows removing the sidebar using `hideSidebar` prop', () => {
    const wrapper = createWrapper({
      propsData: {
        hideSidebar: true,
      },
    });
    expect(wrapper.find('.sidebar').exists()).toBe(false);
  });

  it('sets helper classes when `fully closed`', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.sidebar').classes()).toContain('fully-closed');
    assertWidth(wrapper, 0);
  });

  it('sets helper classes when `fully open`', () => {
    storage.get.mockReturnValueOnce(window.innerWidth);
    const wrapper = createWrapper();
    expect(wrapper.find('.sidebar').classes()).toContain('fully-open');
    assertWidth(wrapper, window.innerWidth);
  });

  it('allows dragging the handle to expand/contract the sidebar, with the mouse', () => {
    const wrapper = createWrapper({
      propsData: {
        minWidth: 320,
      },
    });
    const aside = wrapper.find('.aside');
    // assert dragging
    wrapper.find('.resize-handle').trigger('mousedown', { type: 'mouseevent' });
    document.dispatchEvent(createEvent(eventsMap.mouse.move, {
      clientX: 500,
    }));
    // assert class
    expect(aside.classes()).toContain('dragging');
    assertWidth(wrapper, 400); // offset is 100, so we remove it from the clientX
    // assert maxWidth
    document.dispatchEvent(createEvent(eventsMap.mouse.move, {
      clientX: window.innerWidth + 150,
    }));
    assertWidth(wrapper, window.innerWidth);
    // assert drop
    document.dispatchEvent(createEvent(eventsMap.mouse.end));
    // assert emit event
    expect(wrapper.emitted('width-change')).toEqual([[window.innerWidth]]);
    // assert saved storage
    expect(storage.set).toHaveBeenLastCalledWith(STORAGE_KEY, window.innerWidth);
    // assert drag stopped
    expect(aside.classes()).not.toContain('dragging');
    // assert dragging no longer works
    document.dispatchEvent(createEvent(eventsMap.mouse.move, {
      clientX: 800,
    }));
    // assert class
    expect(aside.classes()).not.toContain('dragging');
    assertWidth(wrapper, window.innerWidth);
  });

  it('allows dragging the handle to expand/contract the sidebar, with the touch device', () => {
    const wrapper = createWrapper({
      propsData: {
        minWidth: 320,
      },
    });
    const aside = wrapper.find('.aside');
    // assert dragging
    wrapper.find('.resize-handle').trigger('touchstart', { type: 'touchstart' });
    document.dispatchEvent(createEvent(eventsMap.touch.move, {
      touches: [{
        clientX: 500,
      }],
    }));
    // assert class
    expect(aside.classes()).toContain('dragging');
    assertWidth(wrapper, 400); // offset is 100, so we remove it from the clientX
    // assert maxWidth
    document.dispatchEvent(createEvent(eventsMap.touch.move, {
      touches: [{
        clientX: window.innerWidth + 150,
      }],
    }));
    assertWidth(wrapper, window.innerWidth);
    // assert drop
    document.dispatchEvent(createEvent(eventsMap.touch.end));
    // assert emit event
    expect(wrapper.emitted('width-change')).toEqual([[window.innerWidth]]);
    // assert saved storage
    expect(storage.set).toHaveBeenLastCalledWith(STORAGE_KEY, window.innerWidth);
    // assert drag stopped
    expect(aside.classes()).not.toContain('dragging');
    // assert dragging no longer works
    document.dispatchEvent(createEvent(eventsMap.touch.move, {
      touches: [{
        clientX: 800,
      }],
    }));
    // assert class
    expect(aside.classes()).not.toContain('dragging');
    assertWidth(wrapper, window.innerWidth);
  });

  it('prevents dragging outside of the window', () => {
    const wrapper = createWrapper();
    const aside = wrapper.find('.aside');
    // assert dragging
    wrapper.find('.resize-handle').trigger('mousedown', { type: 'mousedown' });
    document.dispatchEvent(createEvent(eventsMap.mouse.move, {
      clientX: window.innerWidth + 500,
    }));
    // assert class
    expect(aside.classes()).toContain('dragging');
    assertWidth(wrapper, window.innerWidth); // wrapper is no wider than the innerWidth
  });

  it('prevents dragging wider than `maxWidth`', () => {
    window.innerWidth = 1920;
    const wrapper = createWrapper({
      propsData: {
        maxWidth: 1800,
      },
    });
    const aside = wrapper.find('.aside');
    // assert dragging
    wrapper.find('.resize-handle').trigger('mousedown', { type: 'mousedown' });
    document.dispatchEvent(createEvent(eventsMap.mouse.move, {
      clientX: 2500,
    }));
    // assert class
    expect(aside.classes()).toContain('dragging');
    assertWidth(wrapper, 1800); // wrapper is no wider than the maxWidth
  });

  it('prevents dragging below the `minWidth`', () => {
    const wrapper = createWrapper({
      propsData: {
        minWidth: 320,
      },
    });
    const aside = wrapper.find('.aside');
    // assert dragging
    wrapper.find('.resize-handle').trigger('mousedown', { type: 'mousedown' });
    document.dispatchEvent(createEvent(eventsMap.mouse.move, {
      clientX: 100,
    }));
    // assert class
    expect(aside.classes()).toContain('dragging');
    assertWidth(wrapper, 320); // wrapper is no thinner, than the minWidth
  });
});
