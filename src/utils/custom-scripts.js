/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

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
 * // if baseURL is '/foo'
 * urlGivenScriptName('hello-world')    // http://localhost:8080/foo/custom-scripts/hello-world.js
 * urlGivenScriptName('hello-world.js') // http://localhost:8080/foo/custom-scripts/hello-world.js
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
 * Describes a custom script, for error messages.
 * @param {object} customScript
 * @returns {string} The script's URL or name, or its JSON representation if it has neither.
 */
function describe(customScript) {
  return customScript.url || customScript.name || JSON.stringify(customScript);
}

/**
 * Creates an HTMLScriptElement for the custom script.
 * @param {object} customScript The custom script.
 * @returns {HTMLScriptElement} A script element that runs the custom script once it's added to the
 * document.
 */
function createScriptElement(customScript) {
  const scriptElement = document.createElement('script');

  copyPropertyIfPresent('type', customScript, scriptElement);

  if (has(customScript, 'url')) {
    mustNotHave(customScript, 'name', 'Custom script cannot have both `url` and `name`.');

    scriptElement.src = customScript.url;

    // Dynamically-created script elements are `async` by default, meaning that they run in
    // whatever order they finish loading. But custom scripts should run in the order in which
    // they're listed in custom-scripts.json, so that, for example, a library's configuration
    // script can run before the library itself.
    //
    // Therefore, remove the script element's `async` unless async is explicitly enabled.
    scriptElement.async = customScript.async || false;

    copyPresentProperties(['integrity'], customScript, scriptElement);

    // If `integrity` is set on an external script, then CORS must be enabled as well.
    if (has(customScript, 'integrity')) {
      scriptElement.crossOrigin = 'anonymous';
    }
  } else if (has(customScript, 'name')) {
    scriptElement.src = urlGivenScriptName(customScript.name);
    scriptElement.async = customScript.async || false;

    copyPresentProperties(['async', 'integrity'], customScript, scriptElement);
  } else {
    throw new Error('Custom script does not have `url` or `name` properties.');
  }

  return scriptElement;
}

/**
 * Add an HTMLScriptElement containing the custom script to the document's head, which runs the
 * script on page load.
 * @param {object} customScript The custom script, assuming it should be run on page load.
 */
function addScriptElement(customScript) {
  document.head.appendChild(createScriptElement(customScript));
}

/**
 * Runs the custom script again by adding a new HTMLScriptElement for it to the document's head,
 * and removes the element once the script has run or failed to load. Useful for running a custom
 * script anytime after page load, namely when the reader navigates to a subpage.
 *
 * Unlike evaluating the script's source code with `eval` or `new Function`, this works on websites
 * whose Content Security Policy disallows `unsafe-eval`.
 * @param {object} customScript The custom script, assuming it should be run on navigate.
 * @returns {Promise<void>} A promise that resolves once the script has run, or rejects if the
 * custom script is invalid or fails to load.
 */
async function rerunScriptElement(customScript) {
  const scriptElement = createScriptElement(customScript);

  try {
    await new Promise((resolve, reject) => {
      scriptElement.addEventListener('load', resolve, { once: true });
      scriptElement.addEventListener('error', () => {
        reject(new Error(`Failed to load ${scriptElement.src}.`));
      }, { once: true });

      document.head.appendChild(scriptElement);
    });
  } finally {
    scriptElement.remove();
  }
}

/**
 * Fetches the custom scripts declared in custom-scripts.json.
 * @returns {Promise<object[]>} The custom scripts, or an empty array if the file is absent.
 */
async function fetchCustomScripts() {
  const customScriptsFileName = 'custom-scripts.json';
  const url = resolveAbsoluteUrl(`/${customScriptsFileName}`);

  const response = await fetch(url);
  if (!response.ok) {
    // If the file is absent, fail silently.
    return [];
  }

  const customScripts = await response.json();
  if (!Array.isArray(customScripts)) {
    throw new Error(`Content of ${customScriptsFileName} should be an array.`);
  }

  return customScripts;
}

/**
 * Runs all "on-load" and "on-load-and-navigate" scripts.
 * @returns {Promise<void>}
 */
export async function runCustomPageLoadScripts() {
  const customScripts = await fetchCustomScripts();

  // An invalid script doesn't prevent the other scripts from running.
  customScripts.filter(shouldRunOnPageLoad).forEach((customScript) => {
    try {
      addScriptElement(customScript);
    } catch (error) {
      console.error(`Failed to add custom script (${describe(customScript)}):`, error);
    }
  });
}

/**
 * Runs all "on-navigate" and "on-load-and-navigate" scripts.
 * @returns {Promise<void>} A promise that resolves once all the scripts have run or failed.
 */
export async function runCustomNavigateScripts() {
  const customScripts = (await fetchCustomScripts()).filter(shouldRunOnNavigate);

  // The script elements are all added at once so that the browser loads the scripts in parallel,
  // but since they aren't `async` (unless explicitly enabled), the scripts still run in the order
  // in which they're listed. A script that's invalid or fails to load doesn't prevent the other
  // scripts from running.
  const results = await Promise.allSettled(customScripts.map(rerunScriptElement));
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(
        `Failed to run custom script (${describe(customScripts[index])}):`,
        result.reason,
      );
    }
  });
}

/** Whether the page load scripts have run, meaning that any new content is from a navigation. */
let hasRunPageLoadScripts = false;

/**
 * Runs the custom scripts for a page's new content, once it has been rendered: the page load
 * scripts for the first content, and the navigation scripts for any content after that.
 * @returns {Promise<void>}
 */
export async function runCustomScriptsForNewContent() {
  if (hasRunPageLoadScripts) {
    await runCustomNavigateScripts();
  } else {
    hasRunPageLoadScripts = true;
    await runCustomPageLoadScripts();
  }
}
