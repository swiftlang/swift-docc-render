/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import GenericModal from 'docc-render/components/GenericModal.vue';
import { shallowMount } from '@vue/test-utils';
import scrollLock from 'docc-render/utils/scroll-lock';
import FocusTrap from 'docc-render/utils/FocusTrap';
import changeElementVOVisibility from 'docc-render/utils/changeElementVOVisibility';
import { Portal } from 'portal-vue';
import { createEvent as createBaseEvent, flushPromises } from '../../../test-utils';

jest.mock('docc-render/utils/changeElementVOVisibility', () => ({
  hide: jest.fn(),
  show: jest.fn(),
}));

const mockFocusTrap = {
  start: jest.fn(),
  stop: jest.fn(),
  destroy: jest.fn(),
  updateFocusContainer: jest.fn(),
};

jest.mock('docc-render/utils/FocusTrap', () => jest.fn(() => (mockFocusTrap)));

jest.mock('docc-render/utils/scroll-lock', () => ({
  lockScroll: jest.fn(),
  unlockScroll: jest.fn(),
}));

const VisibleChangeEvent = 'update:visible';

const createWrapper = ({ propsData, ...other } = {}) => {
  const config = {
    propsData,
    slots: {
      default: '<div class="default">Default</div>',
    },
    ...other,
  };
  return shallowMount(GenericModal, config);
};

const createEvent = (key = 'Escape') => createBaseEvent('keydown', { key });

const matchMedia = {
  matches: false,
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

describe('GenericModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.matchMedia = jest.fn().mockReturnValue(matchMedia);
  });

  it('wraps the modal in a PortalSource component', () => {
    const wrapper = createWrapper();
    const portalSource = wrapper.find(Portal);
    expect(portalSource.exists()).toBe(true);
    expect(portalSource.attributes()).toHaveProperty('to', 'modal-destination');
    expect(portalSource.contains('.generic-modal')).toBeTruthy();
  });

  it('renders the GenericModal hidden by default', () => {
    const wrapper = createWrapper();
    const modal = wrapper.find('.generic-modal');
    expect(wrapper.find(Portal).attributes('disabled')).toBe('true');
    expect(modal.attributes('style')).toContain('display: none');
    expect(modal.classes()).toContain('generic-modal');
  });

  it('renders the GenericModal content on open', () => {
    const wrapper = createWrapper({
      propsData: {
        visible: true,
      },
    });

    const modal = wrapper.find('.generic-modal');
    expect(wrapper.find(Portal).attributes('disabled')).toBeFalsy();
    expect(modal.attributes('style')).toBeUndefined();
  });

  it('adds appropriate AX tags', () => {
    const wrapper = createWrapper();
    const modal = wrapper.find('.generic-modal');
    expect(modal.attributes()).toHaveProperty('role', 'dialog');
  });

  it('closes modal when clicking on backdrop, if enabled', () => {
    const wrapper = createWrapper({ propsData: { visible: true, closeOnClickOut: true } });
    wrapper.find('.backdrop').trigger('click');
    // make sure its emitted only once
    expect(wrapper.emitted(VisibleChangeEvent)).toEqual([[false]]);
  });

  it('generates a close button', () => {
    const wrapper = createWrapper({ propsData: { visible: true } });
    const close = wrapper.find('.close');
    expect(close.exists()).toBe(true);
    // assert props
    expect(close.is('button')).toBe(true);
    expect(close.attributes()).toHaveProperty('aria-label', 'Close');
    // assert clicking closes modal
    close.trigger('click');
    expect(wrapper.emitted(VisibleChangeEvent)).toEqual([[false]]);
  });

  it('renders default slot content', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.default').text()).toEqual('Default');
  });

  describe('themes', () => {
    it('adds light theme class', () => {
      const wrapper = createWrapper({ propsData: { theme: 'light' } });
      const modal = wrapper.find('.generic-modal');
      // assert class
      expect(modal.classes()).toContain('theme-light');
    });

    it('adds dark theme class', () => {
      const wrapper = createWrapper({ propsData: { theme: 'dark' } });
      const modal = wrapper.find('.generic-modal');
      // assert class
      expect(modal.classes()).toContain('theme-dark');
    });

    it('adds preferred color scheme change listener for `dynamic` theme', () => {
      const wrapper = createWrapper({ propsData: { theme: 'dynamic' } });
      const modal = wrapper.find('.generic-modal');
      // assert class
      expect(modal.classes()).toContain('theme-light');
      expect(modal.classes()).toContain('theme-dynamic');
      // assert listeners
      expect(window.matchMedia).toHaveBeenCalledTimes(1);
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(matchMedia.addListener).toHaveBeenCalledTimes(1);
    });

    it('sets the theme as dark, if `theme === dynamic` and `match === true`, on mount', async () => {
      window.matchMedia.mockReturnValueOnce({
        ...matchMedia,
        matches: true,
        foo: 'foo',
      });
      const wrapper = createWrapper({ propsData: { theme: 'dynamic' } });
      await wrapper.vm.$nextTick();
      const modal = wrapper.find('.generic-modal');
      expect(modal.classes()).toContain('theme-dynamic');
      expect(modal.classes()).toContain('theme-dark');
    });

    it('detects color scheme changes, if theme is dynamic', () => {
      const wrapper = createWrapper({ propsData: { theme: 'dynamic' } });
      const modal = wrapper.find('.generic-modal');
      expect(modal.classes()).toContain('theme-dynamic');
      expect(modal.classes()).toContain('theme-light');
      matchMedia.addListener.mock.calls[0][0].call(wrapper.vm, { matches: true });
      expect(modal.classes()).toContain('theme-dark');
      expect(modal.classes()).not.toContain('theme-light');
    });

    it('removes the color scheme listener when destroyed', () => {
      const wrapper = createWrapper({ propsData: { theme: 'dynamic' } });
      expect(matchMedia.removeListener).toHaveBeenCalledTimes(0);
      wrapper.destroy();
      expect(matchMedia.removeListener).toHaveBeenCalledTimes(1);
    });

    it('adds preferred color scheme change listener for `code` theme', () => {
      const wrapper = createWrapper({ propsData: { theme: 'code' } });
      const modal = wrapper.find('.generic-modal');

      expect(modal.classes()).toContain('theme-code');
      expect(modal.classes()).toContain('theme-light');
      matchMedia.addListener.mock.calls[0][0].call(wrapper.vm, { matches: true });
      expect(modal.classes()).toContain('theme-dark');
      expect(modal.classes()).not.toContain('theme-light');
    });

    it('adds extra background color as custom properties, used for `code` theme', () => {
      const wrapper = createWrapper({
        propsData: {
          theme: 'code',
          codeBackgroundColorOverride: 'pink',
        },
      });
      // cannot assert DOM, because `jsdom` does not support custom properties in this version.
      expect(wrapper.vm.modalColors).toHaveProperty('--background', 'pink');
    });
  });

  it('allows rendering fullscreen', () => {
    const wrapper = createWrapper({ propsData: { isFullscreen: true } });
    const modal = wrapper.find('.generic-modal');

    expect(modal.classes()).toContain('modal-fullscreen');
    wrapper.setProps({ isFullscreen: false });
    expect(modal.classes()).not.toContain('modal-fullscreen');
  });

  it('does not react to `Escape` click, if not visible', () => {
    const wrapper = createWrapper({ propsData: { visible: false } });
    document.dispatchEvent(createEvent());
    expect(wrapper.emitted(VisibleChangeEvent)).toBeFalsy();
  });

  it('allows closing when clicking escape', () => {
    const wrapper = createWrapper({ propsData: { visible: true } });
    // click something else
    document.dispatchEvent(createEvent('A'));
    // assert
    expect(wrapper.emitted(VisibleChangeEvent)).toBeFalsy();
    // click Escape
    document.dispatchEvent(createEvent('Escape'));
    // assert
    expect(wrapper.emitted(VisibleChangeEvent)).toBeTruthy();
  });

  it('selects content when cmd+a or ctrl+a are typed', () => {
    const selectAllChildren = jest.fn();
    const preventDefault = jest.fn();
    window.getSelection = () => ({
      selectAllChildren,
    });
    const wrapper = createWrapper({ propsData: { visible: true } });
    const type = (options) => {
      const event = createBaseEvent('keydown', options);
      event.preventDefault = preventDefault;
      document.dispatchEvent(event);
    };
    // type cmd+a
    type({ key: 'a', metaKey: true });
    // assert that content is selected
    expect(selectAllChildren).toHaveBeenCalledWith(wrapper.vm.$refs.content);
    expect(preventDefault).toHaveBeenCalled();
    jest.clearAllMocks();
    // type a
    type({ key: 'a' });
    // assert that content is not selected
    expect(selectAllChildren).not.toHaveBeenCalledWith(wrapper.vm.$refs.content);
    expect(preventDefault).not.toHaveBeenCalled();
    jest.clearAllMocks();
    // type ctrl+a
    type({ key: 'a', ctrlKey: true });
    // assert that content is selected
    expect(selectAllChildren).toHaveBeenCalledWith(wrapper.vm.$refs.content);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('locks scrolling on `show`, and unlocks scrolling on `hide`', async () => {
    const wrapper = createWrapper();
    expect(scrollLock.lockScroll).not.toHaveBeenCalled();
    wrapper.setProps({
      visible: true,
    });
    await flushPromises();
    expect(scrollLock.lockScroll).toHaveBeenCalledWith(wrapper.vm.$refs.container);
    expect(scrollLock.unlockScroll).not.toHaveBeenCalled();

    wrapper.setProps({
      visible: false,
    });
    await flushPromises();
    expect(scrollLock.unlockScroll).toHaveBeenCalledWith(wrapper.vm.$refs.container);
  });

  it('hides all siblings on `show` and reveals them on `hide`', async () => {
    const wrapper = createWrapper({
      propsData: {
        visible: false,
      },
    });
    // simulate showing the modal
    wrapper.setProps({
      visible: true,
    });

    const container = wrapper.find({ ref: 'container' }).element;

    await flushPromises();
    expect(changeElementVOVisibility.hide).toHaveBeenCalledTimes(1);
    expect(changeElementVOVisibility.hide).toHaveBeenCalledWith(container);

    wrapper.setProps({
      visible: false,
    });
    expect(changeElementVOVisibility.show).toHaveBeenCalledTimes(1);
    expect(changeElementVOVisibility.show).toHaveBeenCalledWith(container);
  });

  it('focuses the `close` button on `open`, and reverts back to last focus target, on close', async () => {
    const button = document.createElement('button');
    document.body.appendChild(button);

    const wrapper = createWrapper({
      propsData: {
        visible: false,
      },
    });

    button.focus();
    wrapper.setProps({
      visible: true,
    });

    await flushPromises();

    expect(document.activeElement).toEqual(wrapper.find('.close').element);
    expect(wrapper.emitted('open')).toBeTruthy();

    wrapper.setProps({
      visible: false,
    });
    expect(document.activeElement).toEqual(button);
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('does not throw if the close button is hidden, while opening', async () => {
    const button = document.createElement('button');
    document.body.appendChild(button);

    const wrapper = createWrapper({
      propsData: {
        visible: false,
        showClose: false,
      },
    });

    button.focus();
    wrapper.setProps({
      visible: true,
    });

    await flushPromises();

    expect(document.activeElement).toEqual(button);
    expect(wrapper.emitted('open')).toBeTruthy();

    wrapper.setProps({
      visible: false,
    });
    expect(document.activeElement).toEqual(button);
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('removes the scroll lock before destroying', () => {
    const wrapper = createWrapper({
      propsData: {
        lockScrolling: true,
        visible: true,
      },
    });
    expect(scrollLock.unlockScroll).not.toHaveBeenCalled();
    const { container } = wrapper.vm.$refs;
    wrapper.destroy();
    expect(scrollLock.unlockScroll).toHaveBeenCalledWith(container);
  });

  it('uses the focus trap', async () => {
    // assert it instantiates on mount
    const wrapper = createWrapper({
      propsData: {
        visible: false,
      },
    });
    expect(FocusTrap).toHaveBeenCalledTimes(1);
    expect(FocusTrap).toHaveBeenCalledWith();
    // assert it starts on show
    wrapper.setProps({
      visible: true,
    });
    // await the watcher
    await flushPromises();
    expect(mockFocusTrap.start).toHaveBeenCalledTimes(1);
    // assert it stops on hide
    wrapper.setProps({
      visible: false,
    });
    expect(mockFocusTrap.stop).toHaveBeenCalledTimes(1);
    // assert it gets destroyed on destroy
    wrapper.destroy();
    expect(mockFocusTrap.destroy).toHaveBeenCalledTimes(1);
  });

  it('allows hiding the close button', () => {
    const wrapper = createWrapper({
      propsData: {
        showClose: false,
      },
    });
    expect(wrapper.find('.close').exists()).toBe(false);
    wrapper.setProps({
      showClose: true,
    });
    expect(wrapper.find('.close').exists()).toBe(true);
  });

  it('allows specifying a width to the container', () => {
    const wrapper = createWrapper({
      propsData: {
        width: '100px',
      },
    });
    expect(wrapper.find('.container').attributes('style')).toEqual('width: 100px;');
  });
});
