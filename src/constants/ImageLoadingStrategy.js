/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

// These are possible values for the `loading` attribute of `<img>` elements.
// When the "eager" loading strategy is used (the default without specifying),
// images are fetched and rendered on the page as soon as possible. With the
// "lazy" loading strategy, the images are only fetched and rendered on the page
// when necessary as the element comes into view in the browser.
export default {
  eager: 'eager',
  lazy: 'lazy',
};
