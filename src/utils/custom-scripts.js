/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import fetchText from 'docc-render/utils/fetch-text';
import {
  copyPresentProperties,
  copyPropertyIfPresent,
  has,
  mustNotHave,
} from 'docc-render/utils/object-properties';
import { resolveAbsoluteUrl } from 'docc-render/utils/url-helper';

/** Enum for the allowed values of the `run` property in a custom script. */
const Run = {
  onLoad: 'on-load',
  onLoadAndNavigate: 'on-load-and-navigate',
  onNavigate: 'on-navigate',
};

/**
 * Returns whether the custom script should be run when the reader navigates to a subpage.
 * @param {object} customScript
 * @returns {boolean} Returns whether the custom script has a `run` property with a value of
 * "on-load" or "on-load-and-navigate". Also returns true if the `run` property is absent.
 */
function shouldRunOnPageLoad(customScript) {
  return !has(customScript, 'run')
    || customScript.run === Run.onLoad || customScript.run === Run.onLoadAndNavigate;
}

/**
 * Returns whether the custom script should be run when the reader navigates to a topic.
 * @param {object} customScript
 * @returns {boolean} Returns whether the custom script has a `run` property with a value of
 * "on-navigate" or "on-load-and-navigate".
 */
function shouldRunOnNavigate(customScript) {
  return has(customScript, 'run')
    && (customScript.run === Run.onNavigate || customScript.run === Run.onLoadAndNavigate);
}

/**
 * Gets the URL for a local custom script given its name.
 * @param {string} customScriptName The name of the custom script as spelled in
 * custom-scripts.json. While the actual filename (in the custom-scripts directory) is always
 * expected to end in ".js", the name in custom-scripts.json may or may not include the ".js"
 * extension.
 * @returns {string} The absolute URL where the script is, accounting for baseURL.
 * @example
 * // if baseURL if '/foo'
 * urlGivenScriptName('hello-world')    // http://localhost:8080/foo/hello-world.js
 * urlGivenScriptName('hello-world.js') // http://localhost:8080/foo/hello-world.js
 */
function urlGivenScriptName(customScriptName) {
  let scriptNameWithExtension = customScriptName;

  // If the provided name does not already include the ".js" extension, add it.
  if (customScriptName.slice(-3) !== '.js') {
    scriptNameWithExtension = `${customScriptName}.js`;
  }

  return resolveAbsoluteUrl(['', 'custom-scripts', scriptNameWithExtension]);
}

/**
 * Add an HTMLScriptElement containing the custom script to the document's head, which runs the
 * script on page load.
 * @param {object} customScript The custom script, assuming it should be run on page load.
 */
function addScriptElement(customScript) {
  const scriptElement = document.createElement('script');

  copyPropertyIfPresent('type', customScript, scriptElement);

  if (has(customScript, 'url')) {
    mustNotHave(customScript, 'name', 'Custom script cannot have both `url` and `name`.');
    mustNotHave(customScript, 'code', 'Custom script cannot have both `url` and `code`.');

    scriptElement.src = customScript.url;

    // Dynamically-created script elements are `async` by default. But we don't want custom
    // scripts to be implicitly async by default, because if a documentation author adds `defer` to
    // some or all of their custom scripts (meaning that they want the execution order of those
    // scripts to be deterministic), then the author's `defer` will be overriden by the implicit
    // `async`, meaning that the execution order will be unexpectedly nondeterministic.
    //
    // Therefore, remove the script element's `async` unless async is explicitly enabled.
    scriptElement.async = customScript.async || false;

    copyPresentProperties(['defer', 'integrity'], customScript, scriptElement);

    // If `integrity` is set on an external script, then CORS must be enabled as well.
    if (has(customScript, 'integrity')) {
      scriptElement.crossOrigin = 'anonymous';
    }
  } else if (has(customScript, 'name')) {
    mustNotHave(customScript, 'code', 'Custom script cannot have both `name` and `code`.');

    scriptElement.src = urlGivenScriptName(customScript.name);
    scriptElement.async = customScript.async || false;

    copyPresentProperties(['async', 'defer', 'integrity'], customScript, scriptElement);
  } else if (has(customScript, 'code')) {
    mustNotHave(customScript, 'async', 'Inline script cannot be `async`.');
    mustNotHave(customScript, 'defer', 'Inline script cannot have `defer`.');
    mustNotHave(customScript, 'integrity', 'Inline script cannot have `integrity`.');

    scriptElement.innerHTML = customScript.code;
  } else {
    throw new Error('Custom script does not have `url`, `name`, or `code` properties.');
  }

  document.head.appendChild(scriptElement);
}

/**
 * Run the custom script using `eval`. Useful for running a custom script anytime after page load,
 * namely when the reader navigates to a subpage.
 * @param {object} customScript The custom script, assuming it should be run on navigate.
 */
async function evalScript(customScript) {
  let codeToEval;

  if (has(customScript, 'url')) {
    mustNotHave(customScript, 'name', 'Custom script cannot have both `url` and `name`.');
    mustNotHave(customScript, 'code', 'Custom script cannot have both `url` and `code`.');

    if (has(customScript, 'integrity')) {
      // External script with integrity. Must also use CORS.
      codeToEval = await fetchText(customScript.url, {
        integrity: customScript.integrity,
        crossOrigin: 'anonymous',
      });
    } else {
      // External script without integrity.
      codeToEval = await fetchText(customScript.url);
    }
  } else if (has(customScript, 'name')) {
    mustNotHave(customScript, 'code', 'Custom script cannot have both `name` and `code`.');

    const url = urlGivenScriptName(customScript.name);

    if (has(customScript, 'integrity')) {
      // Local script with integrity. Do not use CORS.
      codeToEval = await fetchText(url, { integrity: customScript.integrity });
    } else {
      // Local script without integrity.
      codeToEval = await fetchText(url);
    }
  } else if (has(customScript, 'code')) {
    mustNotHave(customScript, 'async', 'Inline script cannot be `async`.');
    mustNotHave(customScript, 'defer', 'Inline script cannot have `defer`.');
    mustNotHave(customScript, 'integrity', 'Inline script cannot have `integrity`.');

    codeToEval = customScript.code;
  } else {
    throw new Error('Custom script does not have `url`, `name`, or `code` properties.');
  }

  // eslint-disable-next-line no-eval
  eval(codeToEval);
}

/**
 * Run all custom scripts that pass the `predicate` using the `executor`.
 * @param {(customScript: object) => boolean} predicate
 * @param {(customScript: object) => void} executor
 * @returns {Promise<void>}
 */
async function runCustomScripts(predicate, executor) {
  const customScriptsFileName = 'custom-scripts.json';
  const url = resolveAbsoluteUrl(`/${customScriptsFileName}`);

  const response = await fetch(url);
  if (!response.ok) {
    // If the file is absent, fail silently.
    return;
  }

  const customScripts = await response.json();
  if (!Array.isArray(customScripts)) {
    throw new Error(`Content of ${customScriptsFileName} should be an array.`);
  }

  customScripts.filter(predicate).forEach(executor);
}

/**
 * Runs all "on-load" and "on-load-and-navigate" scripts.
 * @returns {Promise<void>}
 */
export async function runCustomPageLoadScripts() {
  await runCustomScripts(shouldRunOnPageLoad, addScriptElement);
}

/**
 * Runs all "on-navigate" and "on-load-and-navigate" scripts.
 * @returns {Promise<void>}
 */
export async function runCustomNavigateScripts() {
  await runCustomScripts(shouldRunOnNavigate, evalScript);
}
