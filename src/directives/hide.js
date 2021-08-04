/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

/* eslint-disable no-param-reassign */

// A custom directive that can "hide" elements with `display: none` if the
// binding value is true--the opposite of the builtin `v-show` directive.
export default function hide(el, binding) {
  const { value: shouldHide = false } = binding;
  el.style.display = shouldHide ? 'none' : '';
}
