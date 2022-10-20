/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import AdjustableSidebarWidth, {
  eventsMap,
  STORAGE_KEY,
  MAX_WIDTH,
  ULTRA_WIDE_DEFAULT,
} from '@/components/AdjustableSidebarWidth.vue';

import store from '@/stores/DocumentationTopicStore';
import { shallowMount } from '@vue/test-utils';
import { storage } from 'docc-render/utils/storage';
import BreakpointEmitter from '@/components/BreakpointEmitter.vue';
import { waitFrames } from '@/utils/loading';
import FocusTrap from '@/utils/FocusTrap';
import scrollLock from 'docc-render/utils/scroll-lock';
import changeElementVOVisibility from 'docc-render/utils/changeElementVOVisibility';
import { BreakpointName, BreakpointScopes } from '@/utils/breakpoints';
import { baseNavStickyAnchorId } from '@/constants/nav';
import { createEvent, flushPromises } from '../../../test-utils';

jest.mock('docc-render/utils/debounce');
jest.mock('docc-render/utils/storage');

jest.mock('docc-render/utils/changeElementVOVisibility');
jest.mock('docc-render/utils/scroll-lock');
jest.mock('docc-render/utils/FocusTrap');
jest.mock('docc-render/utils/throttle', () => jest.fn(v => v));

storage.get.mockImplementation((key, value) => value);

const { SCROLL_LOCK_ID } = AdjustableSidebarWidth.constants;

const scrollLockTarget = document.createElement('DIV');
scrollLockTarget.id = SCROLL_LOCK_ID;
document.body.appendChild(scrollLockTarget);

const navStickyElement = document.createElement('DIV');
navStickyElement.id = baseNavStickyAnchorId;
const boundingClientSpy = jest.spyOn(navStickyElement, 'getBoundingClientRect')
  .mockReturnValue({ y: 0 });

document.body.appendChild(navStickyElement);

const maxWidth = 500; // 50% of the innerWidth, as per the default maxWidth on large
let slotProps = {};

const createWrapper = opts => shallowMount(AdjustableSidebarWidth, {
  slots: {
    default: '<div class="default-content">Default Content</div>',
  },
  scopedSlots: {
    aside(props) {
      slotProps = props;
      return this.$createElement('div', { class: 'aside-content' }, 'Aside Content');
    },
  },
  mocks: { $route: {} },
  provide: {
    store,
  },
  ...opts,
});

function assertWidth(wrapper, value) {
  expect(wrapper.find('.aside').attributes('style')).toContain(`width: ${value}px`);
}

Object.defineProperty(HTMLElement.prototype, 'offsetLeft', { configurable: true, value: 100 });

describe('AdjustableSidebarWidth', () => {
  beforeEach(() => {
    window.innerWidth = 1000; // 1000 for easy math
    store.state.contentWidth = 0;
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

  it('provides props from the aside scoped slot', () => {
    createWrapper();
    expect(slotProps).toEqual({
      animationClass: 'aside-animated-child',
      scrollLockID: 'sidebar-scroll-lock',
      breakpoint: 'large',
    });
  });

  describe('on mount', () => {
    it('sets the `width` to the middle between min and max for `large`, on mount', () => {
      const wrapper = createWrapper();
      assertWidth(wrapper, 350); // 35% on large
    });

    it('changes the `width`, to the next closest max or min, on mount, as soon as the breakpoint gets changed', () => {
      const wrapper = createWrapper({
        data: () => ({
          width: 650,
        }),
      });
      assertWidth(wrapper, 650);
      wrapper.find(BreakpointEmitter).vm.$emit('change', 'medium');
      assertWidth(wrapper, 500); // 50% on medium
    });

    it('applies a momentary no-transition class to the aside, if going from a larger breakpoint into `small`', async () => {
      const wrapper = createWrapper();
      const aside = wrapper.find('.aside');
      expect(aside.classes()).not.toContain('no-transition');
      const emitter = wrapper.find(BreakpointEmitter);
      expect(emitter.props('scope')).toEqual(BreakpointScopes.nav);
      emitter.vm.$emit('change', BreakpointName.small);
      expect(aside.classes()).toContain('no-transition');
      await waitFrames(5);
      expect(aside.classes()).not.toContain('no-transition');
      // try going back to large now
      emitter.vm.$emit('change', BreakpointName.large);
      expect(aside.classes()).toContain('no-transition');
      await waitFrames(5);
      expect(aside.classes()).not.toContain('no-transition');
    });

    it('sets the `width` to the last stored value', () => {
      storage.get.mockReturnValueOnce(450);
      const wrapper = createWrapper();
      assertWidth(wrapper, 450);
      // assert the storage was called with the key and the default size
      // 350 is half of min and max on Large
      expect(storage.get).toHaveBeenLastCalledWith(STORAGE_KEY, 350);
    });

    it('sets the `width` to the `max width allowed`, if stored value is bigger', () => {
      storage.get.mockReturnValueOnce(window.innerWidth + 500);
      const wrapper = createWrapper();
      assertWidth(wrapper, maxWidth); // 80% of 1000
    });

    it('sets the `width` to the `min` width allowed, if stored value is smaller', () => {
      storage.get.mockReturnValueOnce(100);
      const wrapper = createWrapper();
      assertWidth(wrapper, 200); // 20% of 1000
    });

    it('sets the `width` to the `ULTRA_WIDE_DEFAULT`, if no stored value, and on a very large monitor', () => {
      window.innerWidth = MAX_WIDTH;
      storage.get.mockImplementationOnce((key, value) => value);
      const wrapper = createWrapper();
      assertWidth(wrapper, ULTRA_WIDE_DEFAULT);
    });

    it('stores the topOffset, if any', async () => {
      boundingClientSpy.mockReturnValue({ y: 22 });
      const wrapper = createWrapper();
      await flushPromises();
      expect(boundingClientSpy).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.topOffset).toBe(22);
      // cannot assert css vars in JSDOM
      expect(wrapper.vm.asideStyles).toHaveProperty('--top-offset', '22px');
      // assert scroll watcher is initiated
      boundingClientSpy.mockReturnValue({ y: 11 });
      window.dispatchEvent(createEvent('scroll'));
      expect(wrapper.vm.asideStyles).toHaveProperty('--top-offset', '11px');
    });

    it('does not initiate a scroll listener, if topOffset is 0 and there is no scrollY', async () => {
      boundingClientSpy.mockReturnValue({ y: 0 });
      const wrapper = createWrapper();
      await flushPromises();
      expect(boundingClientSpy).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.topOffset).toBe(0);
      expect(wrapper.vm.asideStyles).toHaveProperty('--top-offset', null);
      // assert scroll watcher is initiated
      boundingClientSpy.mockReturnValue({ y: 11 });
      window.dispatchEvent(createEvent('scroll'));
      expect(wrapper.vm.asideStyles).toHaveProperty('--top-offset', null);
    });
  });

  describe('external open', () => {
    beforeEach(() => {
      boundingClientSpy.mockReturnValue({ y: 22 });
    });
    it('allows opening the sidebar externally', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      // assert not open
      const aside = wrapper.find('.aside');
      expect(aside.classes()).not.toContain('show-on-mobile');
      expect(FocusTrap).toHaveBeenCalledTimes(1);
      expect(FocusTrap.mock.results[0].value.start).toHaveBeenCalledTimes(0);
      expect(FocusTrap.mock.results[0].value.stop).toHaveBeenCalledTimes(0);
      // trigger opening externally
      wrapper.setProps({ shownOnMobile: true });
      await flushPromises();
      // assert open class attached
      expect(aside.classes()).toContain('show-on-mobile');
      // assert `mobileTopOffset` is the same as the `navStickyElement` `y` offset.
      expect(wrapper.vm.mobileTopOffset).toBe(22);
      // called once on mount, once now
      expect(boundingClientSpy).toHaveBeenCalledTimes(2);
      // assert scroll lock and other helpers initiated
      expect(scrollLock.lockScroll).toHaveBeenCalledWith(scrollLockTarget);
      expect(changeElementVOVisibility.hide).toHaveBeenCalledWith(aside.element);
      expect(FocusTrap.mock.results[0].value.start).toHaveBeenCalledTimes(1);
      expect(FocusTrap.mock.results[0].value.stop).toHaveBeenCalledTimes(0);
      // close again
      wrapper.setProps({ shownOnMobile: false });
      await flushPromises();
      // assert class
      expect(aside.classes()).not.toContain('show-on-mobile');
      // assert helper status
      expect(scrollLock.unlockScroll).toHaveBeenCalledWith(scrollLockTarget);
      expect(changeElementVOVisibility.show).toHaveBeenCalledWith(aside.element);
      expect(FocusTrap.mock.results[0].value.start).toHaveBeenCalledTimes(1);
      expect(FocusTrap.mock.results[0].value.stop).toHaveBeenCalledTimes(1);
    });

    it('does not set a negative `mobileTopOffset`, if scrolled passed the nav', async () => {
      boundingClientSpy.mockReturnValue({ y: -50 });
      const wrapper = createWrapper();
      await flushPromises();
      // assert not open
      const aside = wrapper.find('.aside');
      // trigger opening externally
      wrapper.setProps({ shownOnMobile: true });
      await flushPromises();
      // assert open class attached
      expect(aside.classes()).toContain('show-on-mobile');
      // assert `mobileTopOffset` is 0, if `navStickyElement.y` is negative
      expect(wrapper.vm.mobileTopOffset).toBe(0);
      expect(boundingClientSpy).toHaveBeenCalledTimes(2);
    });

    it('allows closing the sidebar, with Esc', () => {
      const wrapper = createWrapper({
        propsData: {
          shownOnMobile: true,
        },
      });
      window.dispatchEvent(createEvent('keydown', {
        key: 'Escape',
      }));
      expect(wrapper.emitted('update:shownOnMobile')).toEqual([[false]]);
    });

    it('allows closing the sidebar, when `$route` changes', () => {
      // cannot mock the entire $route, and trigger watchers
      expect(AdjustableSidebarWidth.watch.$route).toEqual('closeMobileSidebar');
    });

    it('closes the nav, on breakpoint change from medium to large', async () => {
      const wrapper = createWrapper({
        propsData: {
          shownOnMobile: true,
        },
      });
      // setup
      wrapper.find(BreakpointEmitter).vm.$emit('change', BreakpointName.medium);
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted('update:shownOnMobile')).toBeFalsy();
      // true test
      wrapper.find(BreakpointEmitter).vm.$emit('change', BreakpointName.large);
      expect(wrapper.emitted('update:shownOnMobile')).toEqual([[false]]);
    });
  });

  it('adds a `hide-on-large` class, when `hiddenOnLarge: true`', async () => {
    const wrapper = createWrapper();
    const aside = wrapper.find({ ref: 'aside' });
    expect(aside.classes()).not.toContain('hide-on-large');
    expect(aside.classes()).not.toContain('sidebar-transitioning');
    wrapper.setProps({ hiddenOnLarge: true });
    await wrapper.vm.$nextTick();
    expect(aside.classes()).toContain('hide-on-large');
    expect(aside.classes()).toContain('sidebar-transitioning');
    expect(aside.attributes()).toMatchObject({
      'aria-hidden': 'true',
    });
    wrapper.setProps({ hiddenOnLarge: false });
    expect(wrapper.find({ ref: 'aside' }).classes()).not.toContain('hide-on-large');
    expect(aside.classes()).toContain('sidebar-transitioning');
  });

  it('changes the sidebar width, if outside the min/max on orientation change', async () => {
    // set prev stored value to max beyond max value
    storage.get.mockReturnValueOnce(window.innerWidth);
    const wrapper = createWrapper();
    // simulate window changes width form orientation change.
    // This should trigger both breakpoint emitter and window resize, but not in Jest
    window.innerWidth = 500;
    window.dispatchEvent(createEvent('orientationchange'));
    await flushPromises();
    assertWidth(wrapper, 250); // 50% of 500, on large
    window.innerWidth = 1000;
    window.dispatchEvent(createEvent('orientationchange'));
    await flushPromises();
    assertWidth(wrapper, 250); // 20% out of 1000, as that is the min percentage
  });

  it('changes the sidebar width, if outside the min/max on resize', async () => {
    // set prev stored value to max beyond max value
    storage.get.mockReturnValueOnce(window.innerWidth);
    const wrapper = createWrapper();
    // simulate window changes width form orientation change.
    // This should trigger both breakpoint emitter and window resize, but not in Jest
    window.innerWidth = 500;
    window.dispatchEvent(createEvent('resize'));
    await flushPromises();
    assertWidth(wrapper, 250); // 50% of 500, on large
    window.innerWidth = 1000;
    window.dispatchEvent(createEvent('resize'));
    await flushPromises();
    assertWidth(wrapper, 250); // 20% out of 1000, as that is the min percentage
  });

  it('stores the height of screen on orientationchange and resize', async () => {
    const wrapper = createWrapper();

    window.innerHeight = 500;
    window.dispatchEvent(createEvent('resize'));
    await flushPromises();
    expect(wrapper.vm.asideStyles).toHaveProperty('--app-height', '500px');
    window.innerHeight = 1000;
    window.dispatchEvent(createEvent('resize'));
    await flushPromises();
    expect(wrapper.vm.asideStyles).toHaveProperty('--app-height', '1000px');
    window.innerHeight = 700;
    window.dispatchEvent(createEvent('orientationchange'));
    await flushPromises();
    expect(wrapper.vm.asideStyles).toHaveProperty('--app-height', '700px');
  });

  it('allows dragging the handle to expand/contract the sidebar, with the mouse', () => {
    const wrapper = createWrapper();
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
    expect(wrapper.emitted('width-change')).toHaveLength(4);
    expect(wrapper.emitted('width-change')[3]).toEqual([maxWidth]);
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
    const wrapper = createWrapper();
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
    expect(wrapper.emitted('width-change')).toHaveLength(4);
    expect(wrapper.emitted('width-change')[3]).toEqual([maxWidth]);
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
    const wrapper = createWrapper();
    const aside = wrapper.find('.aside');
    // assert dragging
    wrapper.find('.resize-handle').trigger('mousedown', { type: 'mousedown' });
    document.dispatchEvent(createEvent(eventsMap.mouse.move, {
      clientX: window.innerWidth + 500,
    }));
    // assert class
    expect(aside.classes()).toContain('dragging');
    assertWidth(wrapper, maxWidth); // wrapper is no wider than the max width
  });

  it('prevents dragging outside of the max container', () => {
    window.innerWidth = MAX_WIDTH + 200; // very wide screen
    const wrapper = createWrapper();
    const aside = wrapper.find('.aside');
    // assert dragging
    wrapper.find('.resize-handle').trigger('mousedown', { type: 'mousedown' });
    document.dispatchEvent(createEvent(eventsMap.mouse.move, {
      clientX: window.innerWidth + 500,
    }));
    // assert class
    expect(aside.classes()).toContain('dragging');
    assertWidth(wrapper, 960); // wrapper is no wider than 50% of the widest possible, which is 1920
  });

  it('prevents dragging below the `minWidth`', () => {
    const wrapper = createWrapper();
    const aside = wrapper.find('.aside');
    // assert dragging
    wrapper.find('.resize-handle').trigger('mousedown', { type: 'mousedown' });
    document.dispatchEvent(createEvent(eventsMap.mouse.move, {
      clientX: 100,
    }));
    // assert class
    expect(aside.classes()).toContain('dragging');
    assertWidth(wrapper, 200); // wrapper is minimum 20% of the screen (1000px)
  });

  it('force closes the nav, if dragging below the forceClose threshold', () => {
    const wrapper = createWrapper();
    const aside = wrapper.find('.aside');
    // assert dragging
    expect(wrapper.emitted('update:hiddenOnLarge')).toBeFalsy();
    wrapper.find('.resize-handle').trigger('mousedown', { type: 'mousedown' });
    document.dispatchEvent(createEvent(eventsMap.mouse.move, {
      // minimum is 200, so 100px wide is the forceClose cutoff point, so we drag 50px beyond it
      clientX: 150,
    }));
    // assert class
    expect(aside.classes()).toContain('dragging');
    assertWidth(wrapper, 200); // wrapper is minimum 20% of the screen (1000px)
    expect(wrapper.emitted('update:hiddenOnLarge')).toEqual([[true]]);
    // simulate event is handled on parent
    wrapper.setProps({
      hiddenOnLarge: true,
    });
    // drag open now
    document.dispatchEvent(createEvent(eventsMap.mouse.move, {
      clientX: 350,
    }));
    assertWidth(wrapper, 250);
    expect(wrapper.emitted('update:hiddenOnLarge')).toEqual([[true], [false]]);
    expect(aside.classes()).toContain('is-opening-on-large');
  });

  it('removes any locks or listeners upon destruction', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    wrapper.setProps({ shownOnMobile: true });
    await flushPromises();
    wrapper.destroy();
    expect(FocusTrap.mock.results[0].value.destroy).toHaveBeenCalledTimes(1);
    expect(scrollLock.unlockScroll).toHaveBeenCalledTimes(1);
    expect(FocusTrap.mock.results[0].value.stop).toHaveBeenCalledTimes(1);
    expect(changeElementVOVisibility.show).toHaveBeenCalledTimes(1);
    // assert scroll watcher is not called
    boundingClientSpy.mockReturnValue({ y: 11 });
    window.dispatchEvent(createEvent('scroll'));
    expect(wrapper.vm.asideStyles).toHaveProperty('--top-offset', '22px');
  });

  it('accounts for zoomed in devices', () => {
    window.scrollX = 55;
    const wrapper = createWrapper();
    const aside = wrapper.find('.aside');
    // assert dragging
    wrapper.find('.resize-handle').trigger('touchstart', { type: 'touchstart' });
    document.dispatchEvent(createEvent(eventsMap.touch.move, {
      touches: [{
        clientX: 300,
      }],
    }));
    // assert class
    expect(aside.classes()).toContain('dragging');
    // offset is 100, so we remove it from the clientX, but we add the scrollX.
    assertWidth(wrapper, 255);
    // assert maxWidth
    document.dispatchEvent(createEvent(eventsMap.touch.move, {
      touches: [{
        clientX: window.innerWidth + 150,
      }],
    }));
    assertWidth(wrapper, maxWidth);
  });

  it('adds a transition detection', () => {
    const oldEvent = window.Event;
    window.Event = null;

    const wrapper = createWrapper();
    const aside = wrapper.find('.aside');
    expect(aside.classes()).not.toContain('sidebar-transitioning');
    aside.trigger('transitionstart', { propertyName: 'width' });
    expect(aside.classes()).toContain('sidebar-transitioning');
    aside.trigger('transitionend', { propertyName: 'width' });
    expect(aside.classes()).not.toContain('sidebar-transitioning');
    window.Event = oldEvent;
  });

  it('hides the nav on desktop', () => {
    const wrapper = createWrapper({
      propsData: {
        hiddenOnLarge: true,
      },
    });
    expect(wrapper.classes()).toContain('sidebar-hidden');
    const aside = wrapper.find({ ref: 'aside' });
    expect(aside.attributes('aria-hidden')).toBe('true');
    expect(aside.classes()).toContain('hide-on-large');
  });

  it('allows hard-coding a width', async () => {
    const wrapper = createWrapper({
      propsData: {
        fixedWidth: 200,
      },
    });
    expect(wrapper.vm.asideStyles).toHaveProperty('width', '200px');
    // simulate window changes width form orientation change.
    // This should trigger both breakpoint emitter and window resize, but not in Jest
    window.innerWidth = 1500;
    window.dispatchEvent(createEvent('resize'));
    await flushPromises();
    assertWidth(wrapper, 200); // hardcoded width
    expect(wrapper.find('.resize-handle').exists()).toBe(false);
  });

  describe('stores the content width in the store', () => {
    function setContentWidth(wrapper, value) {
      Object.defineProperty(wrapper.find({ ref: 'content' }).element, 'offsetWidth', {
        value,
        writable: true,
      });
    }

    it('when dragging to resize', async () => {
      const wrapper = createWrapper();
      setContentWidth(wrapper, 99);
      expect(store.state.contentWidth).toBe(0);
      wrapper.find('.resize-handle').trigger('touchstart', { type: 'touchstart' });
      document.dispatchEvent(createEvent(eventsMap.touch.move, {
        touches: [{
          clientX: 300,
        }],
      }));
      await flushPromises();
      expect(store.state.contentWidth).toBe(99);
    });

    it('when toggling on/off the sidebar', async () => {
      const backup = window.Event;
      window.Event = null;
      const wrapper = createWrapper();
      setContentWidth(wrapper, 99);
      expect(store.state.contentWidth).toBe(0);
      // setup an external close
      wrapper.setProps({ hiddenOnLarge: true });
      const aside = wrapper.find('.aside');
      aside.trigger('transitionstart', { propertyName: 'width' });
      aside.trigger('transitionend', { propertyName: 'width' });
      await flushPromises();
      // assert changes
      expect(store.state.contentWidth).toBe(99);
      // prepare for an external open
      setContentWidth(wrapper, 1099);
      wrapper.setProps({ hiddenOnLarge: false });
      aside.trigger('transitionstart', { propertyName: 'width' });
      await flushPromises();
      // assert its the same, until transitions end
      expect(store.state.contentWidth).toBe(99);
      aside.trigger('transitionend', { propertyName: 'width' });
      await flushPromises();
      expect(store.state.contentWidth).toBe(1099);
      window.Event = backup;
    });

    it('when resizing the screen', async () => {
      const wrapper = createWrapper();
      setContentWidth(wrapper, 99);
      expect(store.state.contentWidth).toBe(0);
      // setup window resize
      window.innerWidth = 500;
      window.dispatchEvent(createEvent('resize'));
      await flushPromises();
      // assert content changes as well as content width is stored
      assertWidth(wrapper, 250);
      expect(store.state.contentWidth).toBe(99);
    });
  });
});
