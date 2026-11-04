/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2026 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { h, isVNode } from 'vue';

const eventListeners = listeners => Object.fromEntries(
  Object.entries(listeners || {}).map(([name, listener]) => [
    `on${name.charAt(0).toUpperCase()}${name.slice(1)}`,
    listener,
  ]),
);

const normalizeChildren = (type, children) => {
  if (typeof type === 'string' || children === undefined || children === null) {
    return children;
  }
  if (typeof children === 'object' && !Array.isArray(children) && !isVNode(children)) {
    return children;
  }
  return { default: () => children };
};

/**
 * Translates the Vue 2 VNode-data surface used by DocC's schema-driven
 * renderers to Vue 3's flat VNode props.
 */
export default function createElement(type, data, children) {
  const normalizedData = data === undefined ? {} : data;
  if (
    Array.isArray(normalizedData)
    || typeof normalizedData !== 'object'
    || normalizedData === null
  ) {
    return h(
      type,
      null,
      normalizeChildren(
        type,
        typeof normalizedData === 'function' ? normalizedData() : normalizedData,
      ),
    );
  }

  const {
    attrs,
    domProps,
    nativeOn,
    on,
    props,
    scopedSlots,
    ...otherData
  } = normalizedData;
  const vnodeProps = {
    ...attrs,
    ...domProps,
    ...props,
    ...otherData,
    ...eventListeners(nativeOn),
    ...eventListeners(on),
  };

  let vnodeChildren = typeof children === 'function' ? children() : children;
  if (scopedSlots) {
    vnodeChildren = {
      ...scopedSlots,
      ...(vnodeChildren === undefined ? {} : { default: () => vnodeChildren }),
    };
  }
  return h(type, vnodeProps, normalizeChildren(type, vnodeChildren));
}
