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
  bash: () => import('highlight.js/lib/languages/bash.js'),
  c: () => import('highlight.js/lib/languages/c.js'),
  cpp: () => import('highlight.js/lib/languages/cpp.js'),
  css: () => import('highlight.js/lib/languages/css.js'),
  diff: () => import('highlight.js/lib/languages/diff.js'),
  http: () => import('highlight.js/lib/languages/http.js'),
  java: () => import('highlight.js/lib/languages/java.js'),
  javascript: () => import('highlight.js/lib/languages/javascript.js'),
  json: () => import('highlight.js/lib/languages/json.js'),
  llvm: () => import('highlight.js/lib/languages/llvm.js'),
  markdown: () => import('docc-render/utils/custom-highlight-lang/markdown'),
  objectivec: () => import('highlight.js/lib/languages/objectivec.js'),
  perl: () => import('highlight.js/lib/languages/perl.js'),
  php: () => import('highlight.js/lib/languages/php.js'),
  pkl: () => import('docc-render/utils/custom-highlight-lang/pkl'),
  python: () => import('highlight.js/lib/languages/python.js'),
  ruby: () => import('highlight.js/lib/languages/ruby.js'),
  scss: () => import('highlight.js/lib/languages/scss.js'),
  shell: () => import('highlight.js/lib/languages/shell.js'),
  swift: () => import('docc-render/utils/custom-highlight-lang/swift'),
  typescript: () => import('highlight.js/lib/languages/typescript.js'),
  xml: () => import('highlight.js/lib/languages/xml.js'),
  yaml: () => import('highlight.js/lib/languages/yaml.js'),
};
