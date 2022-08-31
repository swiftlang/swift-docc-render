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

const PREFIX = 'data-original-';
const ARIA = 'aria-hidden';
const TABINDEX = 'tabindex';

function setOriginalValue(element, prop) {
  // TO ASK: isn't this the same as originalVal = self || ''?
  let originalValue = element.getAttribute(PREFIX + prop);
  if (!originalValue) {
    originalValue = element.getAttribute(prop) || '';
    element.setAttribute(prop, originalValue);
  }
  return originalValue;
}

function retrieveOriginalValue(element, prop) {
  // get the cached property
  const originalValue = element.getAttribute(PREFIX + prop);

  // remove the prefixed attribute
  element.removeAttribute(PREFIX + prop);

  if (typeof originalValue === 'string') {
    // if there is a value, set it back.
    if (originalValue.length) {
      element.setAttribute(ARIA, originalValue);
    } else {
      // otherwise remove the attribute entirely.
      element.removeAttribute(ARIA);
    }
  }
  if (typeof originalTabValue === 'number') {
    if (originalValue.length) {
      element.setAttribute(TABINDEX, originalValue);
    } else {
      element.removeAttribute(TABINDEX);
    }
  }
}

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

/**
 * Hides an element from VO
 * @param {HTMLElement} element
 */
const hideElement = (element) => {
  // set original value for prefixed properties and tabindex
  // store the prop temporarily, to retrieve later.
  setOriginalValue(element, ARIA);
  setOriginalValue(element, TABINDEX);

  // hide the component from VO
  element.setAttribute(ARIA, 'true');

  // hide the component from tabbing
  element.setAttribute(TABINDEX, '-1');
  // make sure element's tabbable children are hidden as well
  const tabbables = TabManager.getTabbableElements(element);
  let i = tabbables.length - 1;
  while (i >= 0) {
    setOriginalValue(tabbables[i], TABINDEX);
    tabbables[i].setAttribute(TABINDEX, '-1');
    i -= 1;
  }
};

/**
 * Show an element
 * @param {HTMLElement} element
 */
const showElement = (element) => {
  retrieveOriginalValue(element, ARIA);
  retrieveOriginalValue(element, TABINDEX);

  // make sure element's tabbable children are hidden as well
  const tabbables = TabManager.getTabbableElements(element);
  let i = tabbables.length;
  while (i -= 1) {
    retrieveOriginalValue(tabbables[i], TABINDEX);
  }
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
