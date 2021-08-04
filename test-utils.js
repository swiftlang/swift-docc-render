/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

/**
 * Parses a passed HTML string to a DOM object.
 * @param {string} template
 * @return {HTMLDivElement}
 */
export const parseHTMLString = (template) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = template;
  return tmp;
};

/**
 * Creates an event and attaches payload to it
 * @param {String} eventName
 * @param {Object} payload
 * @return {Event}
 */
export const createEvent = (eventName, payload = {}) => {
  let event;
  if (Event) {
    event = new Event(eventName);
  } else {
    event = document.createEvent('Event');
    event.initEvent(eventName);
  }
  Object.entries(payload).forEach(([key, value]) => {
    Object.defineProperty(event, key, { value });
  });
  return event;
};

const scheduler = typeof setImmediate === 'function' ? setImmediate : setTimeout;

export function flushPromises() {
  return new Promise(((resolve) => {
    scheduler(resolve);
  }));
}
