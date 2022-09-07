/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

export const focusableElements = [
  'input',
  'select',
  'textarea',
  'button',
  'optgroup',
  'option',
  'menuitem',
  'fieldset',
  'object',
  'a[href]',
  '*[tabindex]',
  '*[contenteditable]',
];
export const focusableSelector = focusableElements.join(',');

export default {
  /**
   * Collects all tabbable elements.
   * @param {HTMLElement | Element} containerElement
   */
  getTabbableElements(containerElement) {
    const elements = containerElement.querySelectorAll(focusableSelector);

    const len = elements.length;
    let i;
    const tabbableElements = [];

    for (i = 0; i < len; i += 1) {
      if (this.isTabbableElement(elements[i])) {
        tabbableElements.push(elements[i]);
      }
    }

    return tabbableElements;
  },

  /**
   * Checks if passed element can be tabbed through.
   * @param {HTMLAnchorElement | HTMLInputElement | ElementContentEditable} element
   * @return {boolean|*}
   */
  isTabbableElement(element) {
    // if element is hidden, it cant be tabbed or focused
    if (!element.offsetParent) return false;

    const tabIndex = parseFloat(element.getAttribute('tabindex'));
    if (Number.isNaN(tabIndex)) {
      return this.isFocusableElement(element);
    }

    return tabIndex >= 0;
  },

  /**
   * Checks whether the passed element is focusable.
   * @param {HTMLAnchorElement | HTMLInputElement | ElementContentEditable} element
   */
  isFocusableElement(element) {
    const nodeName = element.nodeName.toLowerCase();
    const isFocusable = focusableElements.includes(nodeName);
    // if its an anchor, its focusable
    if (nodeName === 'a' && element.getAttribute('href')) return true;

    // if is directly focusable
    if (isFocusable) return !element.disabled;

    if (element.getAttribute('contenteditable') === 'true') return true;

    return !Number.isNaN(parseFloat(element.getAttribute('tabindex')));
  },
};
