/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import markdown from 'highlight.js/lib/languages/markdown';

const PAGE_LINK = {
  begin: '<doc:',
  end: '>',
  returnBegin: true,
  contains: [
    {
      className: 'link',
      begin: 'doc:',
      end: '>',
      excludeEnd: true,
    },
  ],
};

const SYMBOL_LINK = {
  className: 'link',
  // ideally these would be something like /(?<!`)`{2}(?!`)/ to prevent from
  // matching strings with 3 backticks, but the negative lookbehind assertion is
  // not yet implemented in webkit, so this will have to do for now—the CODE
  // rule will override the places where that happens for now, which is still
  // the expected result
  begin: /`{2}(?!`)/,
  end: /`{2}(?!`)/,
  excludeBegin: true,
  excludeEnd: true,
};

const ASIDE = {
  begin: '^>\\s+[Note:|Tip:|Important:|Experiment:|Warning:]',
  end: '$',
  returnBegin: true,
  contains: [
    {
      className: 'quote',
      begin: '^>',
      end: '\\s+',
    },
    {
      className: 'type',
      begin: 'Note|Tip|Important|Experiment|Warning',
      end: ':',
    },
    {
      className: 'quote',
      begin: '.*',
      end: '$',
      endsParent: true,
    },
  ],
};

const DIRECTIVE = {
  begin: '@',
  end: '[{\\)\\s]',
  returnBegin: true,
  contains: [
    {
      className: 'title',
      begin: '@',
      end: '[\\s+(]',
      excludeEnd: true,
    },
    {
      begin: ':',
      end: '[,\\)\n\t]',
      excludeBegin: true,
      keywords: {
        literal: 'true false null undefined',
      },
      contains: [
        {
          className: 'number',
          begin: '\\b([\\d_]+(\\.[\\deE_]+)?|0x[a-fA-F0-9_]+(\\.[a-fA-F0-9p_]+)?|0b[01_]+|0o[0-7_]+)\\b',
          endsWithParent: true,
          excludeEnd: true,
        },
        {
          className: 'string',
          variants: [
            { begin: /"""/, end: /"""/ },
            { begin: /"/, end: /"/ },
          ],
          endsParent: true,
        },
        {
          className: 'link',
          begin: 'http|https',
          endsWithParent: true,
          excludeEnd: true,
        },
      ],
    },
  ],
};

export default function (hljs) {
  const basicMarkdown = markdown(hljs);

  // it prevents lines starting with 4 spaces or a tab from being code types
  const code = basicMarkdown.contains.find(({ className }) => className === 'code');
  code.variants = code.variants.filter(({ begin }) => !begin.includes('( {4}|\\t)'));
  const contains = [...basicMarkdown.contains.filter(({ className }) => className !== 'code'), code];

  return {
    ...basicMarkdown,
    contains: [
      SYMBOL_LINK,
      PAGE_LINK,
      ASIDE,
      DIRECTIVE,
      // basic markdown syntax should be on the bottom so custom rules are prioritized
      ...contains,
    ],
  };
}
