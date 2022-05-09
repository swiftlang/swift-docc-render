/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

// Note: this is not an exhaustive/complete definition of all the various kinds
// that may be emitted by DocC in Render JSON at the moment—only the ones that
// the renderer cares about for the time being.
export default {
  class: 'class',
  enum: 'enum',
  protocol: 'protocol',
  struct: 'struct',
  uid: 'uid',
};
