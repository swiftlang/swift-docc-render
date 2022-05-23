/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import TabManager from 'docc-render/utils/TabManager';

/**
 * Allows trapping focus inside a specified container.
 * This allows you to Tab across elements, and the focus will move
 * between focusable targets only inside said container.
 */
export default class FocusTrap {
  /** @type HTMLElement */
  focusContainer = null;

  /** @type [HTMLElement] */
  tabTargets = [];

  /** @type HTMLElement */
  firstTabTarget = null;

  /** @type HTMLElement */
  lastTabTarget = null;

  /** @type HTMLElement | Element */
  lastFocusedElement = null;

  constructor(focusContainer) {
    this.focusContainer = focusContainer;
    this.onFocus = this.onFocus.bind(this);
  }

  updateFocusContainer(container) {
    this.focusContainer = container;
  }

  /**
   * Starts the focus trap.
   */
  start() {
    this.collectTabTargets();
    // If the current active element is not in the container,
    // focus the first tab target available.
    if (this.firstTabTarget) {
      if (
        // check if the focus container does not contain the current element
        !this.focusContainer.contains(document.activeElement)
        // or if if the current element should not be focusable (mouse click still focuses)
        || !TabManager.isTabbableElement(document.activeElement)
      ) {
        this.firstTabTarget.focus();
      }
    } else {
      console.warn('There are no focusable elements. FocusTrap needs at least one.');
    }

    this.lastFocusedElement = document.activeElement;
    document.addEventListener('focus', this.onFocus, true);
  }

  stop() {
    document.removeEventListener('focus', this.onFocus, true);
  }

  collectTabTargets() {
    // collect tab targets
    this.tabTargets = TabManager.getTabbableElements(this.focusContainer);
    // set first tab target
    // eslint-disable-next-line prefer-destructuring
    this.firstTabTarget = this.tabTargets[0];
    // set last tab target
    this.lastTabTarget = this.tabTargets[this.tabTargets.length - 1];
  }

  /**
   * Handles globally focusing on elements
   * @param {FocusEvent} event
   */
  onFocus(event) {
    // if the focus target is contained within the `focusContainer`
    if (this.focusContainer.contains(event.target)) {
      // save as a recent focus target
      this.lastFocusedElement = event.target;
    } else {
      // the focus target is outside of the container, stop the event.
      event.preventDefault();
      this.collectTabTargets();

      if (
        // if we are at the end of the tabbing list
        this.lastFocusedElement === this.lastTabTarget
        // or there is was no focused element at all
        || !this.lastFocusedElement
        // or the document no longer holds the reference to that element
        || !document.contains(this.lastFocusedElement)
      ) {
        this.firstTabTarget.focus();
        this.lastFocusedElement = this.firstTabTarget;
        return;
      }

      if (this.lastFocusedElement === this.firstTabTarget) {
        this.lastTabTarget.focus();
        this.lastFocusedElement = this.lastTabTarget;
      }
    }
  }

  destroy() {
    this.stop();
    this.focusContainer = null;
    this.tabTargets = [];
    this.firstTabTarget = null;
    this.lastTabTarget = null;
    this.lastFocusedElement = null;
  }
}
