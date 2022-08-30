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

function setOriginalValue(element, prop) {
  // TO ASK: isn't this the same as originalVal = self || ''?
  let originalValue = element.getAttribute(prop);
  if (!originalValue) {
    originalValue = element.getAttribute(prop) || '';
    element.setAttribute(prop, originalValue);
  }
  return originalValue;
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

const PREFIX = 'data-original-';
const prop = 'aria-hidden';
const prefixedProperty = PREFIX + prop;
const TABINDEX = 'tabindex';
/**
 * Hides an element from VO
 * @param {HTMLElement} element
 */
const hideElement = (element) => {
  console.log('hideElement', element);
  let originalValue = element.getAttribute(prefixedProperty);
  let originalTabValue = element.getAttribute(TABINDEX);

  // set original value for prefixed properties and tabindex
  // store the prop temporarily, to retrieve later.
  if (!originalValue) {
    // TO ASK: isn't this the same as originalVal = self || ''?
    originalValue = element.getAttribute(prop) || '';
    element.setAttribute(prefixedProperty, originalValue);
  }

  // TODO: make it deep
  if (!originalTabValue) {
    originalTabValue = element.getAttribute(TABINDEX) || '';
    element.setAttribute(TABINDEX, originalTabValue);
  }

  // hide the component, set aria-hidden to be true shallowly
  element.setAttribute(prop, 'true');

  // hide the component, set tabindex to -1 deeply
  element.setAttribute(TABINDEX, '-1');

  if (TabManager.isFocusableElement(element)) {
    console.log(element, 'is focusable');
    element.setAttribute(TABINDEX, '-1');
  } else {
    // make sure element's tabbable children are hidden as well
    const tabbables = TabManager.getTabbableElements(element);
    console.log('tabindex children', tabbables);
    let i = tabbables.length;
    while (i -= 1) {
      setOriginalValue(tabbables[i], TABINDEX);
      tabbables[i].setAttribute(TABINDEX, '-1');
    }
  }
};

/**
 * Show an element
 * @param {HTMLElement} element
 */
const showElement = (element) => {
  // get the cached property
  const originalValue = element.getAttribute(prefixedProperty);
  const originalTabValue = element.getAttribute(TABINDEX);

  if (typeof originalValue === 'string') {
    // if there is a value, set it back.
    if (originalValue.length) {
      element.setAttribute(prop, originalValue);
    } else {
      // otherwise remove the attribute entirely.
      element.removeAttribute(prop);
    }
  }
  if (typeof originalTabValue === 'number') {
    if (originalTabValue.length) {
      element.setAttribute(TABINDEX, originalTabValue);
    } else {
      element.removeAttribute(TABINDEX);
    }
  }

  // remove the prefixed attribute
  element.removeAttribute(prefixedProperty);

  // remove tabindex deeply
  if (TabManager.isFocusableElement(element)) {
    element.removeAttribute(TABINDEX);
  } else {
    // make sure element's tabbable children are hidden as well
    const tabbables = TabManager.getTabbableElements(element);
    let i = tabbables.length;
    while (i -= 1) {
      if (originalValue.length) {
        element.setAttribute(TABINDEX, originalTabValue);
      } else {
        element.removeAttribute(TABINDEX);
      }
    }
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
