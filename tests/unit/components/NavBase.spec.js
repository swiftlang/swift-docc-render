/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import NavBase from 'docc-render/components/NavBase.vue';
import { shallowMount } from '@vue/test-utils';
import NavMenuItems from 'docc-render/components/NavMenuItems.vue';
import BreakpointEmitter from 'docc-render/components/BreakpointEmitter.vue';
import scrollLock from 'docc-render/utils/scroll-lock';
import changeElementVOVisibility from 'docc-render/utils/changeElementVOVisibility';
import { baseNavStickyAnchorId, MenuLinkModifierClasses } from 'docc-render/constants/nav';
import { waitFrames } from 'docc-render/utils/loading';
import { createEvent } from '../../../test-utils';

jest.mock('docc-render/utils/changeElementVOVisibility');
jest.mock('docc-render/utils/scroll-lock');
jest.mock('docc-render/utils/loading');

const { BreakpointScopes, BreakpointName } = BreakpointEmitter.constants;
const { NoBGTransitionFrames, NavStateClasses } = NavBase.constants;

const emitEndOfTrayTransition = (wrapper, propertyName = 'max-height') => {
  wrapper.findComponent({ ref: 'tray' }).trigger('transitionend', { propertyName });
};

const createWrapper = async ({ propsData, ...rest } = {}) => {
  const wrapper = shallowMount(NavBase, {
    propsData: {
      ...propsData,
    },
    attachToDocument: true,
    ...rest,
  });
  await wrapper.vm.$nextTick();
  return wrapper;
};

const event = window.Event;
let wrapper;

describe('NavBase', () => {
  beforeAll(() => {
    window.Event = null;
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    wrapper.destroy();
  });
  afterAll(() => {
    window.Event = event;
  });
  it('renders a nav element at the root', async () => {
    wrapper = await createWrapper();
    const nav = wrapper.findComponent('nav');
    expect(nav.exists()).toBe(true);
    expect(nav.classes()).toContain('nav');
    expect(nav.attributes()).toHaveProperty('role', 'navigation');
  });

  it('renders a background', async () => {
    wrapper = await createWrapper();
    expect(wrapper.findComponent('.nav__background').exists()).toBe(true);
  });

  it('adds a solid background class', async () => {
    wrapper = await createWrapper();
    expect(wrapper.classes()).not.toContain(NavStateClasses.hasSolidBackground);
    await wrapper.setProps({ hasSolidBackground: true });
    expect(wrapper.classes()).toContain(NavStateClasses.hasSolidBackground);
  });

  it('adds a no border class', async () => {
    wrapper = await createWrapper();
    expect(wrapper.classes()).not.toContain(NavStateClasses.hasNoBorder);
    await wrapper.setProps({ hasNoBorder: true });
    expect(wrapper.classes()).toContain(NavStateClasses.hasNoBorder);
  });

  it('adds a full-width border class', async () => {
    wrapper = await createWrapper();
    expect(wrapper.classes()).not.toContain(NavStateClasses.hasFullWidthBorder);
    await wrapper.setProps({ hasFullWidthBorder: true });
    expect(wrapper.classes()).toContain(NavStateClasses.hasFullWidthBorder);
  });

  it('adds a dark-theme class', async () => {
    wrapper = await createWrapper();
    expect(wrapper.classes()).not.toContain(NavStateClasses.isDark);
    await wrapper.setProps({ isDark: true });
    expect(wrapper.classes()).toContain(NavStateClasses.isDark);
  });

  it('does conditionally renders an overlay', async () => {
    wrapper = await createWrapper({
      propsData: {
        hasOverlay: false,
      },
    });

    expect(wrapper.findComponent('.nav-overlay').exists()).toBe(false);
  });

  it('renders an overlay, that when clicked, closes the expanded nav', async () => {
    wrapper = await createWrapper({
      data: () => ({ isOpen: true }),
    });
    const overlay = wrapper.findComponent('.nav-overlay');
    expect(overlay.exists()).toBe(true);
    expect(wrapper.classes()).toContain(NavStateClasses.isOpen);
    await overlay.trigger('click');
    expect(wrapper.classes()).not.toContain(NavStateClasses.isOpen);
    // assert clicking again does not toggle on
    await overlay.trigger('click');
    expect(wrapper.classes()).not.toContain(NavStateClasses.isOpen);
  });

  it('renders the default slot inside the nav-title', async () => {
    wrapper = await createWrapper({
      slots: {
        default: 'Default Slot',
      },
    });

    expect(wrapper.findComponent('.nav-title').text()).toEqual('Default Slot');
  });

  it('does not render the title if no default slot is provided', async () => {
    wrapper = await createWrapper();
    expect(wrapper.findComponent('.nav-title').exists()).toBe(false);
  });

  it('renders items in the `after-title` slot', async () => {
    wrapper = await createWrapper({
      slots: {
        'after-title': '<div class="after-title">After Title</div>',
      },
    });
    expect(wrapper.findComponent('.after-title').exists()).toBe(true);
  });

  it('renders a pre-title slot', async () => {
    let preTitleProps;
    wrapper = await createWrapper({
      scopedSlots: {
        'pre-title': function preTitle(props) {
          preTitleProps = props;
          return this.$createElement('div', { class: 'pre-title-slot' }, 'Pre Title');
        },
      },
    });
    expect(wrapper.findComponent('.pre-title-slot').text()).toBe('Pre Title');
    expect(preTitleProps).toEqual({
      className: 'pre-title',
      closeNav: expect.any(Function),
      isOpen: false,
      inBreakpoint: false,
      currentBreakpoint: BreakpointName.large,
    });
    await wrapper.findComponent('a.nav-menucta').trigger('click');
    expect(wrapper.classes()).toContain(NavStateClasses.isOpen);
    expect(preTitleProps).toEqual({
      className: 'pre-title',
      closeNav: expect.any(Function),
      isOpen: true,
      inBreakpoint: false,
      currentBreakpoint: BreakpointName.large,
    });
    preTitleProps.closeNav();
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).not.toContain(NavStateClasses.isOpen);
    expect(preTitleProps).toEqual({
      className: 'pre-title',
      closeNav: expect.any(Function),
      isOpen: false,
      inBreakpoint: false,
      currentBreakpoint: BreakpointName.large,
    });
  });

  it('renders a dedicated AX toggle', async () => {
    wrapper = await createWrapper();
    const menu = wrapper.findComponent('.nav-menu');
    expect(menu.exists()).toBe(true);
    const toggle = menu.find('.nav-ax-toggle');
    expect(toggle.exists()).toBe(true);
    expect(toggle.is('a')).toBe(true);
    expect(toggle.attributes()).toHaveProperty('href', '#');
    expect(toggle.attributes()).toHaveProperty('role', 'button');
    // assert the nav toggling works
    expect(wrapper.classes()).not.toContain(NavStateClasses.isOpen);
    toggle.trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).toContain(NavStateClasses.isOpen);
    toggle.trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).not.toContain(NavStateClasses.isOpen);
  });

  it('renders the correct label for the AX toggle', async () => {
    wrapper = await createWrapper();
    const toggle = wrapper.findComponent({ ref: 'axToggle' });
    const label = toggle.find('.visuallyhidden');
    expect(label.text()).toBe('documentation.nav.open-menu');
    await toggle.trigger('click');
    expect(label.text()).toBe('documentation.nav.close-menu');
  });

  it('renders the `tray` slot', async () => {
    let slotProps = null;
    wrapper = await createWrapper({
      scopedSlots: {
        tray(props) {
          slotProps = props;
          return this.$createElement('div', { class: 'tray-slot' }, 'Tray slot content');
        },
      },
    });
    const tray = wrapper.findComponent({ ref: 'tray' });
    expect(tray.find('.tray-slot').text()).toBe('Tray slot content');
    expect(wrapper.findComponent(NavMenuItems).exists()).toBe(false);
    expect(slotProps).toEqual({
      closeNav: expect.any(Function),
    });
  });

  it('renders the `menu-items` slot', async () => {
    wrapper = await createWrapper({
      slots: {
        'menu-items': '<li class="menu-slot">Menu slot content</li>',
      },
    });
    const tray = wrapper.findComponent(NavMenuItems);
    expect(tray.find('.menu-slot').text()).toBe('Menu slot content');
  });

  it('closes the navigation if clicked on a link inside the tray', async () => {
    wrapper = await createWrapper({
      data: () => ({ isOpen: true }),
      slots: {
        'menu-items': `
          <li class="with-anchor"><a href="#">Somewhere</a></li>
          <li class="without-anchor"><div class="foo">Foo</div></li>`,
      },
    });
    const tray = wrapper.findComponent(NavMenuItems);
    await tray.find('.foo').trigger('click');
    expect(wrapper.classes()).toContain(NavStateClasses.isOpen);
    tray.find('.with-anchor a').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).not.toContain(NavStateClasses.isOpen);
  });

  it('does not close the navigation if clicked on a .noclose link inside the tray', async () => {
    const { noClose } = MenuLinkModifierClasses;
    wrapper = await createWrapper({
      data: () => ({ isOpen: true }),
      slots: {
        'menu-items': `
          <li class="with-anchor"><a class="${noClose}" href="#">Somewhere</a></li>
          <li class="without-anchor"><div class="foo">Foo</div></li>`,
      },
    });
    const tray = wrapper.findComponent(NavMenuItems);
    tray.find('.with-anchor a').trigger('click');
    expect(wrapper.classes()).toContain(NavStateClasses.isOpen);
  });

  it('adds extra classes to stop scrolling while animating the tray up/down', async () => {
    wrapper = await createWrapper();
    wrapper.findComponent({ ref: 'axToggle' }).trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).toContain(NavStateClasses.isOpen);
    expect(wrapper.classes()).toContain(NavStateClasses.isTransitioning);
    // assert it removes the class, after transition is done
    emitEndOfTrayTransition(wrapper, 'height');
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).toContain(NavStateClasses.isTransitioning);
    // assert it only tracks transform property
    emitEndOfTrayTransition(wrapper);
    await wrapper.vm.$nextTick();
    // assert the class is no more
    expect(wrapper.classes()).not.toContain(NavStateClasses.isTransitioning);
    // close the nav
    wrapper.findComponent({ ref: 'axToggle' }).trigger('click');
    await wrapper.vm.$nextTick();
    // assert the correct classes are there
    expect(wrapper.classes()).not.toContain(NavStateClasses.isOpen);
    expect(wrapper.classes()).toContain(NavStateClasses.isTransitioning);
    // end the transition
    emitEndOfTrayTransition(wrapper);
    await wrapper.vm.$nextTick();
    // assert the class is no longer there
    expect(wrapper.classes()).not.toContain(NavStateClasses.isTransitioning);
  });

  it('renders a menu chevron toggle, which is hidden to VO', async () => {
    wrapper = await createWrapper();
    const link = wrapper.findComponent('a.nav-menucta');
    expect(link.attributes()).toHaveProperty('tabindex', '-1');
    expect(link.attributes()).toHaveProperty('href', '#');
    link.trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).toContain(NavStateClasses.isOpen);
    link.trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).not.toContain(NavStateClasses.isOpen);
  });

  it('does not renders a menu chevron toggle if showActions is false', async () => {
    wrapper = await createWrapper({
      propsData: {
        showActions: false,
      },
    });
    const link = wrapper.findComponent('a.nav-menucta');
    expect(link.exists()).toBe(false);
  });

  it('does not trigger a stick if there is a negative vertical scroll', async () => {
    window.scrollY = -1;
    wrapper = await createWrapper();
    expect(wrapper.classes()).not.toContain(NavStateClasses.isSticking);
    wrapper.vm.onIntersect({ intersectionRatio: 0.9 });
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).not.toContain(NavStateClasses.isSticking);
    window.scrollY = 1;
    wrapper.vm.onIntersect({ intersectionRatio: 0.5 });
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).toContain(NavStateClasses.isSticking);
  });

  it('adds a class when sticking to the top', async () => {
    wrapper = await createWrapper();
    expect(wrapper.classes()).not.toContain(NavStateClasses.isSticking);
    wrapper.vm.onIntersect({ intersectionRatio: 0.9 });
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).toContain(NavStateClasses.isSticking);
    wrapper.vm.onIntersect({ intersectionRatio: 1 });
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).not.toContain(NavStateClasses.isSticking);
  });

  it('gets the anchor as an intersection target', async () => {
    // create the sticky anchor and add it to the body
    const sticky = document.createElement('DIV');
    sticky.setAttribute('id', baseNavStickyAnchorId);
    document.body.appendChild(sticky);
    wrapper = await createWrapper();
    // make sure it is returned as an intersection point
    expect(wrapper.vm.getIntersectionTargets()).toEqual([sticky]);
  });

  it('emits events upon closing/opening', async () => {
    wrapper = await createWrapper();
    const link = wrapper.findComponent('a.nav-menucta');
    // open the nav
    link.trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('change')).toEqual([[true]]);
    expect(wrapper.emitted('open')).toEqual([[]]);
    expect(wrapper.emitted('close')).toBeFalsy();
    expect(wrapper.emitted('changed')).toBeFalsy();

    // simulate end of transition
    emitEndOfTrayTransition(wrapper);
    // make sure the `change` event is still the same
    expect(wrapper.emitted('change')).toHaveLength(1);
    // assert end events are emitted
    expect(wrapper.emitted('changed')).toEqual([[true]]);
    expect(wrapper.emitted('opened')).toEqual([[]]);
    // close the nav
    link.trigger('click');
    await wrapper.vm.$nextTick();
    // assert the `change` and `close` event are emitted
    expect(wrapper.emitted('change')).toEqual([[true], [false]]);
    expect(wrapper.emitted('close')).toEqual([[]]);

    // simulate end of transition
    emitEndOfTrayTransition(wrapper);
    // make sure the `change` event is still the same
    expect(wrapper.emitted('change')).toHaveLength(2);
    // assert the end events are emitted
    expect(wrapper.emitted('changed')).toEqual([[true], [false]]);
    expect(wrapper.emitted('closed')).toEqual([[]]);
  });

  it('does only counts transitions as ended, if coming from the tray', async () => {
    wrapper = await createWrapper();
    wrapper.findComponent(NavMenuItems).trigger('transitionend', { propertyName: 'max-height' });
    expect(wrapper.emitted('changed')).toBeFalsy();
    expect(wrapper.emitted('closed')).toBeFalsy();
    expect(wrapper.emitted('opened')).toBeFalsy();
    emitEndOfTrayTransition(wrapper);
    expect(wrapper.emitted('changed')).toBeTruthy();
  });

  it('renders a `after-content` slot', async () => {
    wrapper = await createWrapper({
      slots: {
        'after-content': '<div class="afterContentSlot">Foo</div>',
      },
    });
    expect(wrapper.findComponent('.afterContentSlot').text()).toEqual('Foo');
  });

  it('renders a breakpoint emitter component', async () => {
    wrapper = await createWrapper({
      propsData: {
        breakpoint: BreakpointName.medium,
      },
    });

    const emitter = wrapper.findComponent(BreakpointEmitter);
    expect(emitter.exists()).toBe(true);
    expect(emitter.props()).toHaveProperty('scope', BreakpointScopes.nav);
  });

  it('adds the breakpoint range class, when the breakpoint fits the breakpoint query', async () => {
    wrapper = await createWrapper({
      data: () => ({ isOpen: true }),
      propsData: {
        breakpoint: BreakpointName.medium,
      },
    });
    expect(wrapper.classes()).toContain(NavStateClasses.isOpen);
    const emitter = wrapper.findComponent(BreakpointEmitter);
    expect(emitter.exists()).toBe(true);
    // should do nothing, as the breakpoint change is below the target breakpoint "medium".
    emitter.vm.$emit('change', BreakpointName.small);
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).toContain(NavStateClasses.inBreakpoint);

    emitter.vm.$emit('change', BreakpointName.large);
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).not.toContain(NavStateClasses.inBreakpoint);
  });

  it('locks the scrolling after all the transitions end', async () => {
    wrapper = await createWrapper();
    wrapper.findComponent({ ref: 'axToggle' }).trigger('click');
    // make sure its not locked still
    expect(scrollLock.lockScroll).toHaveBeenCalledTimes(0);
    // simulate end of transitions
    emitEndOfTrayTransition(wrapper);
    // assert the lock is called once
    expect(scrollLock.lockScroll).toHaveBeenCalledTimes(1);
  });

  it('unlocks the scrolling, immediately after closing', async () => {
    wrapper = await createWrapper();
    const link = wrapper.findComponent({ ref: 'axToggle' });
    link.trigger('click');
    await wrapper.vm.$nextTick();
    // simulate end of transitions
    emitEndOfTrayTransition(wrapper);
    // assert the lock is called once
    expect(scrollLock.lockScroll).toHaveBeenCalledTimes(1);
    await link.trigger('click');
    expect(scrollLock.unlockScroll).toHaveBeenCalledTimes(1);
  });

  it('renders with a no-transition class and removes it after a few frames', async () => {
    let resolve;
    waitFrames.mockImplementationOnce(() => new Promise((r) => {
      resolve = r;
    }));
    wrapper = await createWrapper();
    expect(wrapper.classes()).toContain(NavStateClasses.noBackgroundTransition);
    resolve();
    await wrapper.vm.$nextTick();
    expect(waitFrames).toHaveBeenCalledWith(NoBGTransitionFrames);
    expect(wrapper.classes()).not.toContain(NavStateClasses.noBackgroundTransition);
  });

  it('unlocks the scrolling, if still open before destroying', async () => {
    wrapper = await createWrapper();
    const link = wrapper.findComponent({ ref: 'axToggle' });
    link.trigger('click');
    expect(scrollLock.unlockScroll).toHaveBeenCalledTimes(0);
    wrapper.destroy();
    expect(scrollLock.unlockScroll).toHaveBeenCalledTimes(1);
  });

  it('stays focus on axToggle, if nav expand is toggled from axToggle', async () => {
    wrapper = await createWrapper();
    const axToggle = wrapper.findComponent({ ref: 'axToggle' });
    const focusSpy = jest.spyOn(axToggle.element, 'focus');
    axToggle.trigger('click');

    // assert focus is not moved
    expect(focusSpy).toHaveBeenCalledTimes(0);
  });

  it('blurs active element, if nav expand is toggled by mouse click', async () => {
    wrapper = await createWrapper();
    const navToggle = wrapper.findComponent('.nav-menucta');
    const blurSpy = jest.spyOn(navToggle.element, 'blur');
    // manually focus to fix JSDom issue
    navToggle.element.focus();
    navToggle.trigger('click');
    await wrapper.vm.$nextTick();
    expect(blurSpy).toHaveBeenCalledTimes(1);
    // assert focus is on the body
    expect(document.activeElement).toEqual(document.body);
  });

  it('changes the sibling visibility to `hidden` on expand', async () => {
    wrapper = await createWrapper();
    expect(changeElementVOVisibility.hide).toHaveBeenCalledTimes(0);
    wrapper.findComponent({ ref: 'axToggle' }).trigger('click');
    await wrapper.vm.$nextTick();
    expect(changeElementVOVisibility.hide).toHaveBeenCalledTimes(1);
    expect(changeElementVOVisibility.hide).toHaveBeenCalledWith(wrapper.vm.$refs.wrapper);
  });

  it('changes the sibling visibility back to normal on close', async () => {
    wrapper = await createWrapper();

    expect(changeElementVOVisibility.show).toHaveBeenCalledTimes(0);
    await wrapper.findComponent({ ref: 'axToggle' }).trigger('click');
    expect(changeElementVOVisibility.hide).toHaveBeenCalledTimes(1);
    wrapper.findComponent({ ref: 'axToggle' }).trigger('click');
    await wrapper.vm.$nextTick();
    expect(changeElementVOVisibility.show).toHaveBeenCalledTimes(1);
    expect(changeElementVOVisibility.show).toHaveBeenCalledWith(wrapper.vm.$refs.wrapper);
  });

  describe('closes the nav', () => {
    it('upon hitting Escape key', async () => {
      wrapper = await createWrapper({
        data: () => ({ isOpen: true }),
      });
      // assert it only works for Escape key
      window.dispatchEvent(createEvent('keydown', { key: 'leftArrow' }));
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).toContain(NavStateClasses.isOpen);
      // press Esc
      window.dispatchEvent(createEvent('keydown', { key: 'Escape' }));
      await wrapper.vm.$nextTick();
      // assert its closed
      expect(wrapper.classes()).not.toContain(NavStateClasses.isOpen);
      // assert the toggle is focused
      expect(document.activeElement).toEqual(wrapper.findComponent({ ref: 'axToggle' }).element);
    });

    it('upon popstate change when navigating back/forward', async () => {
      wrapper = await createWrapper({
        data: () => ({ isOpen: true }),
      });
      window.dispatchEvent(createEvent('popstate'));
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).not.toContain(NavStateClasses.isOpen);
    });

    it('upon `orientationchange`, on mobile devices', async () => {
      wrapper = await createWrapper({
        data: () => ({ isOpen: true }),
      });
      window.dispatchEvent(createEvent('orientationchange'));
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).not.toContain(NavStateClasses.isOpen);
    });

    it('upon clicking outside of the nav', async () => {
      wrapper = await createWrapper({
        data: () => ({ isOpen: true }),
      });
      document.dispatchEvent(createEvent('click'));
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).not.toContain(NavStateClasses.isOpen);
    });

    it('upon clicking inside, does not close the nav', async () => {
      wrapper = await createWrapper({
        data: () => ({ isOpen: true }),
      });
      const target = wrapper.findComponent('.nav__background').element;
      document.dispatchEvent(createEvent('click', { target }));
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).toContain(NavStateClasses.isOpen);
    });

    it('upon changing into a breakpoint outside of the breakpoint', async () => {
      wrapper = await createWrapper({
        data: () => ({ isOpen: true }),
        propsData: {
          breakpoint: BreakpointName.medium,
        },
      });
      expect(wrapper.classes()).toContain(NavStateClasses.isOpen);
      // should do nothing, as the breakpoint change is below the target breakpoint "medium".
      wrapper.findComponent(BreakpointEmitter).vm.$emit('change', BreakpointName.small);
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).toContain(NavStateClasses.isOpen);

      wrapper.findComponent(BreakpointEmitter).vm.$emit('change', BreakpointName.large);
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).not.toContain(NavStateClasses.isOpen);
    });

    it('resolves closeNav on transitionEnd, only when inside Breakpoint', async () => {
      wrapper = await createWrapper({
        data: () => ({ currentBreakpoint: BreakpointName.small, isOpen: true }),
      });
      expect(wrapper.classes()).toContain(NavStateClasses.isOpen);
      let resolved = false;
      wrapper.vm.closeNav().then(() => {
        resolved = true;
      });
      await wrapper.vm.$nextTick();
      expect(resolved).toBe(false);
      emitEndOfTrayTransition(wrapper);
      await wrapper.vm.$nextTick();
      expect(resolved).toBe(true);
    });

    it('resolves closeNav immediately, if already closed and in breakpoint', async () => {
      wrapper = await createWrapper({
        data: () => ({ currentBreakpoint: BreakpointName.small, isOpen: false }),
      });
      expect(wrapper.classes()).not.toContain(NavStateClasses.isOpen);
      await expect(wrapper.vm.closeNav()).resolves.toBeUndefined();
    });
  });
});
