/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2026 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

export default {
  bash: () => import('highlight.js/lib/languages/bash'),
  c: () => import('highlight.js/lib/languages/c'),
  cpp: () => import('highlight.js/lib/languages/cpp'),
  css: () => import('highlight.js/lib/languages/css'),
  diff: () => import('highlight.js/lib/languages/diff'),
  http: () => import('highlight.js/lib/languages/http'),
  java: () => import('highlight.js/lib/languages/java'),
  javascript: () => import('highlight.js/lib/languages/javascript'),
  json: () => import('highlight.js/lib/languages/json'),
  llvm: () => import('highlight.js/lib/languages/llvm'),
  markdown: () => import('docc-render/utils/custom-highlight-lang/markdown'),
  objectivec: () => import('highlight.js/lib/languages/objectivec'),
  perl: () => import('highlight.js/lib/languages/perl'),
  php: () => import('highlight.js/lib/languages/php'),
  pkl: () => import('docc-render/utils/custom-highlight-lang/pkl'),
  python: () => import('highlight.js/lib/languages/python'),
  ruby: () => import('highlight.js/lib/languages/ruby'),
  scss: () => import('highlight.js/lib/languages/scss'),
  shell: () => import('highlight.js/lib/languages/shell'),
  swift: () => import('docc-render/utils/custom-highlight-lang/swift'),
  typescript: () => import('highlight.js/lib/languages/typescript'),
  xml: () => import('highlight.js/lib/languages/xml'),
  yaml: () => import('highlight.js/lib/languages/yaml'),
};
