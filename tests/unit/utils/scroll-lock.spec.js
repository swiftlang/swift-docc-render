/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import scrollLock, { SCROLL_LOCK_DISABLE_ATTR, SCROLL_LOCK_DISABLE_HORIZONTAL_ATTR } from 'docc-render/utils/scroll-lock';
import { createEvent, parseHTMLString } from '../../../test-utils';

const { platform } = window.navigator;
Object.defineProperty(window.navigator, 'platform', { value: '', writable: true });

let DOM;
let container;
const preventDefault = jest.fn();
const stopPropagation = jest.fn();
const getBoundingClientRect = jest.fn();
const scrollToSpy = jest.fn();

Object.defineProperty(window, 'scrollTo', {
  value: scrollToSpy,
});

describe('scroll-lock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    DOM = parseHTMLString(`
      <div class="container">
        <div class="scrollable">long</div>
        <div ${SCROLL_LOCK_DISABLE_ATTR}="true" class="disabled-target"></div>
        <div ${SCROLL_LOCK_DISABLE_HORIZONTAL_ATTR}="true" class="disabled-horizontal-target"></div>
      </div>
    `);
    document.body.appendChild(DOM);
    container = DOM.querySelector('.container');
    Object.defineProperty(container, 'scrollHeight', { value: 10, writable: true });
  });
  afterEach(() => {
    window.navigator.platform = platform;
    document.getElementsByTagName('html')[0].innerHTML = '';
  });

  describe('iOS device', () => {
    beforeEach(() => {
      window.navigator.platform = 'iPhone';
    });

    it('tracks scrolling, preventing body scroll when target reaches top/bottom', () => {
      const targetTouches = [{ clientY: 10 }];
      const touchStartEvent = {
        targetTouches: [{ clientY: 0 }],
      };
      const touchMoveEvent = {
        targetTouches,
        preventDefault,
        stopPropagation,
        touches: [1],
        target: {
          closest: jest.fn(),
        },
      };
      // init the scroll lock
      scrollLock.lockScroll(container);
      // assert event listeners are attached
      expect(container.ontouchstart).toEqual(expect.any(Function));
      expect(container.ontouchmove).toEqual(expect.any(Function));
      // simulate scroll above top
      container.ontouchstart(touchStartEvent);
      container.ontouchmove(touchMoveEvent);
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(stopPropagation).toHaveBeenCalledTimes(0);
      // simulate scroll middle
      container.ontouchmove({ ...touchMoveEvent, targetTouches: [{ clientY: -10 }] });
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(stopPropagation).toHaveBeenCalledTimes(1);

      // simulate scroll came to the bottom
      Object.defineProperty(container, 'clientHeight', { value: 10, writable: true });
      container.ontouchmove({ ...touchMoveEvent, targetTouches: [{ clientY: -10 }] });
      expect(preventDefault).toHaveBeenCalledTimes(2);
      expect(stopPropagation).toHaveBeenCalledTimes(1);

      scrollLock.unlockScroll(container);
      expect(container.ontouchmove).toBeFalsy();
      expect(container.ontouchstart).toBeFalsy();
    });

    it('adds event listeners to the disabled targets too', () => {
      const disabledTarget = DOM.querySelector('.disabled-target');
      const disabledHorizontalTarget = DOM.querySelector('.disabled-horizontal-target');
      // init the scroll lock
      scrollLock.lockScroll(container);
      // assert event listeners are attached
      expect(disabledTarget.ontouchstart).toEqual(expect.any(Function));
      expect(disabledTarget.ontouchmove).toEqual(expect.any(Function));
      expect(disabledHorizontalTarget.ontouchstart).toEqual(expect.any(Function));
      expect(disabledHorizontalTarget.ontouchmove).toEqual(expect.any(Function));

      scrollLock.unlockScroll(container);
      expect(disabledTarget.ontouchmove).toBeFalsy();
      expect(disabledTarget.ontouchstart).toBeFalsy();
      expect(disabledHorizontalTarget.ontouchstart).toBeFalsy();
      expect(disabledHorizontalTarget.ontouchmove).toBeFalsy();
    });

    it('prevent event if user tries to perform vertical scroll in an horizontal scrolling element', () => {
      // set horizontal scrolling element only
      DOM = parseHTMLString(`
        <div class="container">
          <div class="scrollable">long</div>
          <div ${SCROLL_LOCK_DISABLE_HORIZONTAL_ATTR}="true" class="disabled-horizontal-target"></div>
        </div>
      `);
      document.body.appendChild(DOM);
      container = DOM.querySelector('.container');

      const touchStartEvent = {
        targetTouches: [{ clientY: 0, clientX: 0 }],
      };
      // perform vertical scroll
      const touchMoveEvent = {
        targetTouches: [{ clientY: -10, clientX: 0 }],
        preventDefault,
        stopPropagation,
        touches: [1],
        target: {
          closest: jest.fn(),
        },
      };

      scrollLock.lockScroll(container);
      container.ontouchstart(touchStartEvent);
      container.ontouchmove(touchMoveEvent);

      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(stopPropagation).toHaveBeenCalledTimes(0);
    });

    it('prevents body scrolling', () => {
      scrollLock.lockScroll(container);
      // assert body scroll is getting prevented when swiping up/down
      document.dispatchEvent(createEvent('touchmove', {
        preventDefault,
        touches: [1],
      }));
      expect(preventDefault).toHaveBeenCalledTimes(1);

      // assert body scroll is not getting prevented if more then one finger is used (pinch, pan)
      document.dispatchEvent(createEvent('touchmove', {
        preventDefault,
        touches: [1, 2, 3],
      }));
      expect(preventDefault).toHaveBeenCalledTimes(1);

      // remove the lock
      scrollLock.unlockScroll(container);
      // assert it no longer calls the `preventDefault`
      document.dispatchEvent(createEvent('touchmove', {
        preventDefault,
        touches: [1],
      }));
      expect(preventDefault).toHaveBeenCalledTimes(1);
    });

    it('does not throw, if not passed an element', () => {
      expect(() => scrollLock.lockScroll(null)).not.toThrow();
      // assert body scroll is getting prevented when swiping up/down
      document.dispatchEvent(createEvent('touchmove', {
        preventDefault,
        touches: [1],
      }));
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(() => scrollLock.unlockScroll(null)).not.toThrow();
    });

    it('attaches only once event listeners', () => {
      // enable scroll locking
      scrollLock.lockScroll(container);
      // cache the listener
      const cachedListener = container.ontouchmove;
      // enable again
      scrollLock.lockScroll(container);
      // make sure the listener is the same
      expect(cachedListener).toBe(container.ontouchmove);
      scrollLock.unlockScroll(container);
    });
  });

  describe('other devices', () => {
    it('toggles CSS properties on the body', () => {
      const scrolledClientY = -500;
      document.body.getBoundingClientRect = getBoundingClientRect;
      getBoundingClientRect.mockReturnValue({ top: scrolledClientY });

      expect(document.body.style.overflow).toEqual('');
      expect(document.body.style.position).toEqual('');
      scrollLock.lockScroll(container);
      expect(document.body.style.overflow).toEqual('hidden scroll');
      expect(document.body.style.position).toEqual('fixed');
      expect(document.body.style.top).toEqual(`${scrolledClientY}px`);
      expect(document.body.style.width).toEqual('100%');
      // assert no event listeners are attached
      document.dispatchEvent(createEvent('touchmove', {
        preventDefault,
        touches: [1],
      }));
      expect(preventDefault).toHaveBeenCalledTimes(0);

      scrollLock.unlockScroll(container);
      expect(document.body.style.overflow).toEqual('');
      expect(scrollToSpy).toHaveBeenCalledTimes(1);
      expect(scrollToSpy).toHaveBeenCalledWith(0, Math.abs(scrolledClientY));
    });
  });
});
