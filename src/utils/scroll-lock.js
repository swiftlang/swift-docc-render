/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

let isLocked = false;
let initialClientY = -1;
let scrolledClientY = 0;

const isIosDevice = () => window.navigator
  && window.navigator.platform
  && (/iP(ad|hone|od)/.test(window.navigator.platform)
    || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1));

/**
 * Prevents the default action of any event
 * @param {TouchEvent} event
 */
function preventDefault(event) {
  // Do not prevent if the event has more than one touch
  // (usually meaning this is a multi touch gesture like pinch to zoom).
  if (event.touches.length > 1) return;
  event.preventDefault();
}

/**
 * Determine if an element is scrolled to the bottom
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#Problems_and_solutions
 * @param {HTMLElement} targetElement
 * @return {boolean}
 */
const isTargetElementTotallyScrolled = targetElement => (
  targetElement
    ? targetElement.scrollHeight - targetElement.scrollTop <= targetElement.clientHeight
    : false
);

/**
 * A simple locking, that works for the majority of browsers
 */
function simpleLock() {
  // save scrolled Y position when locking
  scrolledClientY = document.body.getBoundingClientRect().top;
  // force the Y scrollbar to always appear to prevent jumping issues
  document.body.style.overflow = 'hidden scroll';
  // add scrolled Y position to body top before changing the position property
  document.body.style.top = `${scrolledClientY}px`;
  // limit the vertical height by fixing the position
  document.body.style.position = 'fixed';
  // force body to expand to its whole width
  document.body.style.width = '100%';
}

/**
 * Stops the advanced locking
 * @param {HTMLElement} targetElement
 */
function advancedUnlock(targetElement) {
  /* eslint-disable no-param-reassign */
  // remove the touch listeners on the target
  if (targetElement) {
    targetElement.ontouchstart = null;
    targetElement.ontouchmove = null;
  }
  // remove the body event listener
  document.removeEventListener('touchmove', preventDefault);
}

/**
 * Handles the scrolling of the targetElement
 * @param {TouchEvent} event
 * @param {HTMLElement} targetElement
 * @return {boolean}
 */
function handleScroll(event, targetElement) {
  const clientY = event.targetTouches[0].clientY - initialClientY;
  if (targetElement.scrollTop === 0 && clientY > 0) {
    // element is at the top of its scroll.
    return preventDefault(event);
  }

  if (isTargetElementTotallyScrolled(targetElement) && clientY < 0) {
    // element is at the bottom of its scroll.
    return preventDefault(event);
  }

  // prevent the scroll event from going up to the parent/window
  event.stopPropagation();
  return true;
}

/**
 * Advanced scroll locking for iOS devices.
 * @param targetElement
 */
function advancedLock(targetElement) {
  // add a scroll listener to the body
  document.addEventListener('touchmove', preventDefault, { passive: false });
  if (!targetElement) return;
  /* eslint-disable no-param-reassign */
  // add inline listeners to the target, for easier removal later.
  targetElement.ontouchstart = (event) => {
    if (event.targetTouches.length === 1) {
      // detect single touch.
      initialClientY = event.targetTouches[0].clientY;
    }
  };
  targetElement.ontouchmove = (event) => {
    if (event.targetTouches.length === 1) {
      // detect single touch.
      handleScroll(event, targetElement);
    }
  };
}

/**
 * Allows locking body scroll, and unlocking, reverting to old scroll position.
 * Used primarily for Modals.
 */
export default {
  /**
   * Locks the scrolling of the body, except for an element
   * @param {HTMLElement} targetElement
   */
  lockScroll(targetElement) {
    // skip lock if already locked
    if (isLocked) return;
    // iOS devices require a more advanced locking.
    if (!isIosDevice()) {
      simpleLock();
    } else {
      advancedLock(targetElement);
    }
    isLocked = true;
  },
  /**
   * Unlocks the scrolling.
   * @param {HTMLElement} targetElement
   */
  unlockScroll(targetElement) {
    if (!isLocked) return;

    if (isIosDevice()) {
      // revert the old scroll position
      advancedUnlock(targetElement);
    } else {
      // remove all inline styles added by the `simpleLock` function
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('top');
      document.body.style.removeProperty('position');
      document.body.style.removeProperty('width');

      // restore scrolled Y position after resetting the position property
      window.scrollTo(0, Math.abs(scrolledClientY));
    }
    isLocked = false;
  },
};
