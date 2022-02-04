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
import { createEvent, flushPromises } from '../../../test-utils';

jest.mock('docc-render/utils/storage');

storage.get.mockImplementation((key, value) => value);
const maxWidth = 800; // 80% of the innerWidth, as per the default maxWidth prop

const createWrapper = opts => shallowMount(AdjustableSidebarWidth, {
  slots: {
    aside: '<div class="aside-content">Aside Content</div>',
    default: '<div class="default-content">Default Content</div>',
  },
  mocks: { $route: {} },
  ...opts,
});

function assertWidth(wrapper, value) {
  expect(wrapper.find('.aside').attributes('style')).toContain(`width: ${value}px`);
}

Object.defineProperty(HTMLElement.prototype, 'offsetLeft', { configurable: true, value: 100 });

describe('AdjustableSidebarWidth', () => {
  beforeEach(() => {
    window.innerWidth = 1000; // 1000 for easy math
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
    it('sets the `width` to the minWidthPercent, on mount', () => {
      const wrapper = createWrapper({
        propsData: {
          minWidthPercent: 20,
        },
      });
      assertWidth(wrapper, 200);
    });

    it('sets the `width` to the last stored value', () => {
      storage.get.mockReturnValueOnce(450);
      const wrapper = createWrapper({
        propsData: {
          minWidthPercent: 20,
        },
      });
      assertWidth(wrapper, 450);
      // assert the storage was called with the key and the default size
      expect(storage.get).toHaveBeenLastCalledWith(STORAGE_KEY, 200);
    });

    it('sets the `width` to the `max width allowed`, if stored value is bigger', () => {
      storage.get.mockReturnValueOnce(window.innerWidth + 500);
      const wrapper = createWrapper();
      assertWidth(wrapper, maxWidth); // 80% of 1000
    });
  });

  describe('external open', () => {
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

    it('allows closing the sidebar, with Esc', () => {
      const wrapper = createWrapper({
        propsData: {
          openExternally: true,
        },
      });
      window.dispatchEvent(createEvent('keydown', {
        key: 'Escape',
      }));
      expect(wrapper.emitted('update:openExternally')).toEqual([[false]]);
    });

    it('allows closing the sidebar, when `$route` changes', () => {
      // cannot mock the entire $route, and trigger watchers
      expect(AdjustableSidebarWidth.watch.$route).toEqual('closeMobileSidebar');
    });
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

  it('changes the sidebar width, if outside the min/max on orientation change', async () => {
    // set prev stored value to max beyond max value
    storage.get.mockReturnValueOnce(window.innerWidth);
    const wrapper = createWrapper({
      propsData: {
        minWidthPercent: 50,
        maxWidthPercent: 80,
      },
    });
    // simulate window changes width form orientation change
    window.innerWidth = 500;
    window.dispatchEvent(createEvent('orientationchange'));
    await flushPromises();
    assertWidth(wrapper, 400); // 80% of 500
    window.innerWidth = 1000;
    window.dispatchEvent(createEvent('orientationchange'));
    await flushPromises();
    assertWidth(wrapper, 500); // 50% out of 1000, as that is the min percentage
  });

  it('changes the sidebar width, if outside the min/max on resize', async () => {
    // set prev stored value to max beyond max value
    storage.get.mockReturnValueOnce(window.innerWidth);
    const wrapper = createWrapper({
      propsData: {
        minWidthPercent: 50,
        maxWidthPercent: 80,
      },
    });
    // simulate window changes width form orientation change
    window.innerWidth = 500;
    window.dispatchEvent(createEvent('resize'));
    await flushPromises();
    assertWidth(wrapper, 400); // 80% of 500
    window.innerWidth = 1000;
    window.dispatchEvent(createEvent('resize'));
    await flushPromises();
    assertWidth(wrapper, 500); // 50% out of 1000, as that is the min percentage
  });

  it('sets helper classes when `fully open`', () => {
    storage.get.mockReturnValueOnce(window.innerWidth);
    const wrapper = createWrapper();
    expect(wrapper.find('.sidebar').classes()).toContain('fully-open');
    assertWidth(wrapper, maxWidth);
  });

  it('allows dragging the handle to expand/contract the sidebar, with the mouse', () => {
    const wrapper = createWrapper({
      propsData: {
        minWidthPercent: 30,
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
    assertWidth(wrapper, maxWidth);
    // assert drop
    document.dispatchEvent(createEvent(eventsMap.mouse.end));
    // assert emit event
    expect(wrapper.emitted('width-change')).toEqual([[maxWidth]]);
    // assert saved storage
    expect(storage.set).toHaveBeenLastCalledWith(STORAGE_KEY, maxWidth);
    // assert drag stopped
    expect(aside.classes()).not.toContain('dragging');
    // assert dragging no longer works
    document.dispatchEvent(createEvent(eventsMap.mouse.move, {
      clientX: 800,
    }));
    // assert class
    expect(aside.classes()).not.toContain('dragging');
    assertWidth(wrapper, maxWidth);
  });

  it('allows dragging the handle to expand/contract the sidebar, with the touch device', () => {
    const wrapper = createWrapper({
      propsData: {
        minWidthPercent: 20,
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
    assertWidth(wrapper, maxWidth);
    // assert drop
    document.dispatchEvent(createEvent(eventsMap.touch.end));
    // assert emit event
    expect(wrapper.emitted('width-change')).toEqual([[maxWidth]]);
    // assert saved storage
    expect(storage.set).toHaveBeenLastCalledWith(STORAGE_KEY, maxWidth);
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
    assertWidth(wrapper, maxWidth);
  });

  it('prevents dragging outside of the window', () => {
    window.innerWidth = 1000;
    const wrapper = createWrapper({
      propsData: {
        maxWidthPercent: 100,
      },
    });
    const aside = wrapper.find('.aside');
    // assert dragging
    wrapper.find('.resize-handle').trigger('mousedown', { type: 'mousedown' });
    document.dispatchEvent(createEvent(eventsMap.mouse.move, {
      clientX: window.innerWidth + 500,
    }));
    // assert class
    expect(aside.classes()).toContain('dragging');
    assertWidth(wrapper, 1000); // wrapper is no wider than the innerWidth
  });

  it('prevents dragging wider than `maxWidth`', () => {
    const wrapper = createWrapper({
      propsData: {
        maxWidthPercent: 70,
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
    assertWidth(wrapper, 700); // wrapper is no wider than the maxWidth
  });

  it('prevents dragging below the `minWidthPercent`', () => {
    const wrapper = createWrapper({
      propsData: {
        minWidthPercent: 15,
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
    assertWidth(wrapper, 150); // wrapper is no thinner, than the minWidthPercent
  });
});
