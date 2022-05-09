/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import hljs from 'highlight.js/lib/core';

/** A map of custom aliases for supported languages (additions to default hljs aliases) */
const CustomLanguageAliases = {
  objectivec: ['objective-c'],
};

/** A map of supported languages and their aliases */
const Languages = {
  bash: ['sh', 'zsh'],
  c: ['h'],
  cpp: ['cc', 'c++', 'h++', 'hpp', 'hh', 'hxx', 'cxx'],
  css: [],
  diff: ['patch'],
  http: ['https'],
  java: ['jsp'],
  javascript: ['js', 'jsx', 'mjs', 'cjs'],
  json: [],
  llvm: [],
  markdown: ['md', 'mkdown', 'mkd'],
  objectivec: ['mm', 'objc', 'obj-c'].concat(CustomLanguageAliases.objectivec),
  perl: ['pl', 'pm'],
  php: [],
  python: ['py', 'gyp', 'ipython'],
  ruby: ['rb', 'gemspec', 'podspec', 'thor', 'irb'],
  scss: [],
  shell: ['console', 'shellsession'],
  swift: [],
  xml: ['html', 'xhtml', 'rss', 'atom', 'xjb', 'xsd', 'xsl', 'plist', 'wsf', 'svg'],
};

export const CustomLanguagesSet = new Set([
  'markdown',
  'swift',
]);

export const LanguageAliasEntries = Object.entries(Languages);

export const SupportedLanguagesSet = new Set(Object.keys(Languages));

export const LanguageAliasCacheMap = new Map();

hljs.configure({
  classPrefix: 'syntax-',
  languages: [...SupportedLanguagesSet],
});

/**
 * Imports the necessary files for each language in highlightjs, sequentially.
 * @param {string} language - The language to import for
 * @return {Promise<boolean>}
 */
async function importHighlightFileForLanguage(language) {
  // this previously needed to be an array to support languages with
  // dependencies on other languages, but this is no longer the case with v11 of
  // highlight.js, so this could be refactored in the future to eliminate this
  // array entirely
  const files = [language];
  try {
    // use a reduce to sequentially resolve promises, in the order given.
    await files.reduce(async (previousPromise, file) => {
      // This line will wait for the last async function to finish.
      // The first iteration uses an already resolved Promise
      // so, it will immediately continue.
      await previousPromise;
      let languageFile;

      if (CustomLanguagesSet.has(file)) {
        languageFile = await import(
          /* webpackChunkName: "highlight-js-custom-[request]" */
          `../utils/custom-highlight-lang/${file}`
        );
      } else {
        languageFile = await import(
          /* webpackChunkName: "highlight-js-[request]" */
          // eslint-disable-next-line max-len
          /* webpackInclude: /\/(bash|c|s?css|cpp|diff|http|java|llvm|perl|php|python|ruby|xml|javascript|json|markdown|objectivec|shell|swift)\.js$/ */
          `highlight.js/lib/languages/${file}`
        );
      }

      hljs.registerLanguage(file, languageFile.default);
    }, Promise.resolve());

    return true;
  } catch (err) {
    console.error(`Could not load ${language} file`);
    return false;
  }
}

/**
 * Gets a language by it's alias
 * @param {string} language - the language to find, by alias
 * @return {string|null}
 */
function getLanguageByAlias(language) {
  // if the language is not an alias and is supported, return it
  if (SupportedLanguagesSet.has(language)) return language;
  // find the language, by searching in the aliases
  const languageAlias = LanguageAliasEntries.find(([, aliases]) => aliases.includes(language));
  // if we find an alias, use it's associated language, or return null
  return languageAlias ? languageAlias[0] : null;
}

/**
 * Memoize the {@see getLanguageByAlias} function, to reduce lookup in the alias entries
 * @param {string} language
 * @return {string|null}
 */
function memoizedGetLanguageByAlias(language) {
  if (LanguageAliasCacheMap.has(language)) return LanguageAliasCacheMap.get(language);
  const result = getLanguageByAlias(language);
  // cache the result so we dont call the function again with the same params
  LanguageAliasCacheMap.set(language, result);
  return result;
}

/**
 * Register a language into Highlight JS
 * @param {String} originalLanguage - the language to load
 * @return {Promise<boolean>}
 */
export const registerHighlightLanguage = async (originalLanguage) => {
  // normalize the language parameter
  const language = memoizedGetLanguageByAlias(originalLanguage);
  // if we dont support the language, or its already registered, bail silently
  if (!language || hljs.listLanguages().includes(language)) {
    return false;
  }
  // import the file dynamically. Only import the files we support.
  return importHighlightFileForLanguage(language);
};

const BREAK_LINE_REGEXP = /\r\n|\r|\n/g;
const HIGHLIGHT_CLASS_RE = /syntax-/;

/**
 * Split the DOM string into individual lines
 * @param {String} text
 * @returns {string[]}
 */
function getLines(text) {
  if (text.length === 0) return [];
  return text.split(BREAK_LINE_REGEXP);
}

/**
 * Returns the total line count
 * @param {String} text
 * @returns {number}
 */
function getLinesCount(text) {
  return (text.trim().match(BREAK_LINE_REGEXP) || []).length;
}

/**
 * Converts an HTML string into DOM elements
 * @param {string} html - string representing HTML content
 * @return {NodeListOf<ChildNode>}
 */
function htmlToElements(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content.childNodes;
}

/**
 * Wrap each new line in a component, with the same class as the parent.
 * @param {HTMLElement} element
 * @return NodeListOf<HTMLElement> | null
 */
function duplicateMultilineNode(element) {
  const { className } = element;

  // if the element's class does not match, or it has none, exit
  if (!HIGHLIGHT_CLASS_RE.test(className)) return null;

  // wrap each new line with the current element's class
  const result = getLines(element.innerHTML)
    .reduce((all, lineText) => `${all}<span class="${className}">${lineText}</span>\n`, '');

  // return a list of newly wrapped HTML elements
  return htmlToElements(result.trim());
}

/**
 * Fix multi-line tags by Highlightjs
 * Recursively wrap each row in a span with the same class as the parent, N levels deep.
 * @param {HTMLElement} element
 * @return {NodeList<HTMLElement> | null}
 */
export function sanitizeMultilineNodes(element) {
  Array.from(element.childNodes).forEach((child) => {
    // if child element has multiple rows, go over them
    if (getLinesCount(child.textContent)) {
      try {
        // if there are multiple more nested children, go over them as well
        const elements = child.childNodes.length
          ? sanitizeMultilineNodes(child)
          // otherwise unwrap the lines.
          : duplicateMultilineNode(child);
        if (elements) {
          child.replaceWith(...elements);
        }
      } catch (err) {
        console.error(err);
      }
    }
  });
  return duplicateMultilineNode(element);
}

/**
 * Highlight code string
 * @param {string} code
 * @param {string} language
 * @returns {string}
 */
export function highlight(code, language) {
  // normalize the language name in case it is a custom alias that highlight.js
  // doesn't know about
  const normalizedLang = getLanguageByAlias(language);
  if (!hljs.getLanguage(normalizedLang)) {
    throw new Error(`Unsupported language for syntax highlighting: ${language}`);
  }

  return hljs.highlight(code, { language: normalizedLang, ignoreIllegals: true }).value;
}

/**
 * Transforms multiline code split into an array of strings
 * to a code highlighted, multiline array with fixed
 * multiline blocks.
 * @param {string[]} content
 * @param {string} language
 * @returns {string[]}
 */
export function highlightContent(content, language) {
  // join the lines back
  const rawCode = content.join('\n');
  // highlight the code as normal
  const highlightedCode = highlight(rawCode, language);

  // create a temporary element to mount the highlighted code into
  const tempElement = document.createElement('code');
  tempElement.innerHTML = highlightedCode;
  // duplicate multiline tags
  sanitizeMultilineNodes(tempElement);

  // Split the html string back into individual lines, retaining newline
  // characters for empty lines so that they can be copied correctly
  return getLines(tempElement.innerHTML);
}
