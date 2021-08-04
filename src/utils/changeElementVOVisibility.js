/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

/* eslint-disable no-cond-assign */
function iterateOverSiblings(el, callback) {
  const ancestor = document.body;
  let previousNode = el;
  let nextNode = el;

  while ((previousNode = previousNode.previousElementSibling)) {
    callback(previousNode);
  }

  while ((nextNode = nextNode.nextElementSibling)) {
    callback(nextNode);
  }

  if (el.parentElement && el.parentElement !== ancestor) {
    iterateOverSiblings(el.parentElement, callback);
  }
}

const PREFIX = 'data-original-';
const prop = 'aria-hidden';
const prefixedProperty = PREFIX + prop;

/**
 * Hides an element from VO
 * @param {HTMLElement} element
 */
const hideElement = (element) => {
  let originalValue = element.getAttribute(prefixedProperty);
  if (!originalValue) {
    // store the prop temporarily, to retrieve later.
    originalValue = element.getAttribute(prop) || '';
    element.setAttribute(prefixedProperty, originalValue);
  }
  // hide the component
  element.setAttribute(prop, 'true');
};

/**
 * Show an element
 * @param {HTMLElement} element
 */
const showElement = (element) => {
  // get the cached property
  const originalValue = element.getAttribute(prefixedProperty);
  if (typeof originalValue === 'string') {
    // if there is a value, set it back.
    if (originalValue.length) {
      element.setAttribute(prop, originalValue);
    } else {
      // otherwise remove the attribute entirely.
      element.removeAttribute(prop);
    }
  }
  // remove the prefixed attribute
  element.removeAttribute(prefixedProperty);
};

/**
 * Hides and reveals all siblings,
 * up to the root element, of the passed element.
 * Used for modals, to capture VO in a specific container.
 */
export default {
  /**
   * Hide all sibling elements,
   * of the passed element to VO.
   * @param {HTMLElement} element
   */
  hide(element) {
    iterateOverSiblings(element, hideElement);
  },
  /**
   * Reveal all sibling elements,
   * of the passed element to VO.
   * @param {HTMLElement} element
   */
  show(element) {
    iterateOverSiblings(element, showElement);
  },
};
