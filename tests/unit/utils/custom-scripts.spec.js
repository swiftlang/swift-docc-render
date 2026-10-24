/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import {
  runCustomPageLoadScripts,
  runCustomNavigateScripts,
  runCustomScriptsForNewContent,
} from 'docc-render/utils/custom-scripts';

let jsonMock;
let fetchMock;

const createElementMock = jest.fn(document.createElement);
document.createElement = createElementMock;

// Spy on document.head.appendChild to check which script elements are added, even after they're
// removed again.
const appendChildSpy = jest.spyOn(document.head, 'appendChild');

/**
 * Sets the custom-scripts.json array fetched by the fetchMock.
 * @param {object[]} customScripts
 */
function setCustomScripts(customScripts) {
  // The jsonMock is different for each test, so it must be reset.
  jsonMock = jest.fn().mockResolvedValue(customScripts);

  fetchMock = jest.fn().mockResolvedValue({
    ok: true,
    json: jsonMock,
  });

  window.fetch = fetchMock;
}

/**
 * Returns the script elements that were added to the document's head, in the order in which they
 * were added.
 * @returns {HTMLScriptElement[]}
 */
function addedScriptElements() {
  return appendChildSpy.mock.calls.map(([element]) => element);
}

/**
 * Waits for pending promises, like the mocked fetch of custom-scripts.json, to settle.
 * @returns {Promise<void>}
 */
function flushPromises() {
  return new Promise((resolve) => {
    setTimeout(resolve);
  });
}

/**
 * Runs the navigation scripts, simulating each added script element loading, since jsdom doesn't
 * load scripts.
 * @param {(element: HTMLScriptElement) => string} eventType The event to dispatch on each element.
 * @returns {Promise<void>}
 */
async function runNavigateScripts(eventType = () => 'load') {
  const promise = runCustomNavigateScripts();
  await flushPromises();
  addedScriptElements().forEach(element => element.dispatchEvent(new Event(eventType(element))));
  return promise;
}

describe('custom-scripts', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.resetModules();

    document.head.innerHTML = '';
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('runCustomPageLoadScripts', () => {
    it('creates a script element for each explicit or implicit "on-load" script', async () => {
      setCustomScripts([
        {
          url: 'https://www.example.js',
          async: true,
          run: 'on-load',
        },
        { name: 'my-local-script' },
      ]);

      await runCustomPageLoadScripts();

      expect(createElementMock).toHaveBeenCalledTimes(2);
    });

    it('runs "on-load-and-navigate" scripts as well', async () => {
      setCustomScripts([
        {
          name: 'my-local-script.js',
          run: 'on-load-and-navigate',
        },
      ]);

      await runCustomPageLoadScripts();

      expect(createElementMock).toHaveBeenCalledTimes(1);
    });

    it('does not run "on-navigate" scripts', async () => {
      setCustomScripts([
        {
          name: 'my-local-script',
          run: 'on-navigate',
        },
      ]);

      await runCustomPageLoadScripts();

      expect(createElementMock).toHaveBeenCalledTimes(0);
    });

    it('configures script elements from the custom scripts', async () => {
      setCustomScripts([
        { url: 'https://www.example.com/external.js', integrity: 'sha384-external' },
        { name: 'my-local-script' },
        { name: 'my-async-script.js', async: true },
      ]);

      await runCustomPageLoadScripts();

      const [external, local, asyncScript] = addedScriptElements();

      expect(external.src).toBe('https://www.example.com/external.js');
      expect(external.integrity).toBe('sha384-external');
      expect(external.crossOrigin).toBe('anonymous');
      expect(external.async).toBe(false);

      expect(local.src).toMatch(/\/custom-scripts\/my-local-script\.js$/);
      expect(local.async).toBe(false);

      expect(asyncScript.src).toMatch(/\/custom-scripts\/my-async-script\.js$/);
      expect(asyncScript.async).toBe(true);
    });

    it('skips invalid scripts, adding the other scripts', async () => {
      setCustomScripts([
        // A script must have either a `url` or a `name`.
        { async: true },
        // A script can't have both a `url` and a `name`.
        { url: 'https://www.example.com/script.js', name: 'my-local-script' },
        { name: 'my-other-local-script' },
      ]);

      await runCustomPageLoadScripts();

      const scriptElements = addedScriptElements();
      expect(scriptElements).toHaveLength(1);
      expect(scriptElements[0].src).toMatch(/\/custom-scripts\/my-other-local-script\.js$/);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('runCustomNavigateScripts', () => {
    it('runs "on-navigate" and "on-load-and-navigate" scripts', async () => {
      setCustomScripts([
        {
          name: 'script1.js',
          run: 'on-navigate',
        },
        {
          name: 'script2',
          run: 'on-load-and-navigate',
        },
        {
          name: 'script3.js',
          run: 'on-load-and-navigate',
        },
      ]);

      await runNavigateScripts();

      expect(addedScriptElements()).toHaveLength(3);
    });

    it('adds the scripts in the order in which they are listed, without `async`', async () => {
      setCustomScripts([
        { name: 'first.js', run: 'on-navigate' },
        { url: 'https://www.example.com/second.js', run: 'on-navigate' },
      ]);

      await runNavigateScripts();

      const scriptElements = addedScriptElements();
      expect(scriptElements.map(element => element.src)).toEqual([
        expect.stringMatching(/\/custom-scripts\/first\.js$/),
        'https://www.example.com/second.js',
      ]);
      // Script elements that aren't `async` run in the order in which they're added.
      expect(scriptElements.map(element => element.async)).toEqual([false, false]);
    });

    it('adds a new script element each time the reader navigates', async () => {
      setCustomScripts([{ name: 'my-script.js', run: 'on-navigate' }]);

      await runNavigateScripts();
      await runNavigateScripts();

      const scriptElements = addedScriptElements();
      expect(scriptElements).toHaveLength(2);
      expect(scriptElements[0]).not.toBe(scriptElements[1]);
      expect(scriptElements[0].src).toBe(scriptElements[1].src);
    });

    it('removes each script element once its script has run or failed to load', async () => {
      setCustomScripts([
        { name: 'loads.js', run: 'on-navigate' },
        { name: 'fails.js', run: 'on-navigate' },
      ]);

      const promise = runCustomNavigateScripts();
      await flushPromises();

      const [loads, fails] = addedScriptElements();
      expect(document.head.contains(loads)).toBe(true);
      expect(document.head.contains(fails)).toBe(true);

      loads.dispatchEvent(new Event('load'));
      fails.dispatchEvent(new Event('error'));
      await promise;

      expect(document.head.contains(loads)).toBe(false);
      expect(document.head.contains(fails)).toBe(false);
    });

    it('waits for the scripts to run before resolving', async () => {
      setCustomScripts([{ name: 'my-script.js', run: 'on-navigate' }]);

      let hasResolved = false;
      const promise = runCustomNavigateScripts().then(() => { hasResolved = true; });
      await flushPromises();
      expect(hasResolved).toBe(false);

      addedScriptElements()[0].dispatchEvent(new Event('load'));
      await promise;
      expect(hasResolved).toBe(true);
    });

    it('runs the other scripts when one of them fails to load', async () => {
      setCustomScripts([
        { name: 'missing.js', run: 'on-navigate' },
        { name: 'present.js', run: 'on-navigate' },
      ]);

      await runNavigateScripts(element => (element.src.endsWith('missing.js') ? 'error' : 'load'));

      expect(addedScriptElements()).toHaveLength(2);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('runs the other scripts when one of them is invalid', async () => {
      setCustomScripts([
        // A script must have either a `url` or a `name`.
        { run: 'on-navigate' },
        { name: 'valid.js', run: 'on-navigate' },
      ]);

      await runNavigateScripts();

      const scriptElements = addedScriptElements();
      expect(scriptElements).toHaveLength(1);
      expect(scriptElements[0].src).toMatch(/\/custom-scripts\/valid\.js$/);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('does not run scripts without a `run` property', async () => {
      setCustomScripts([{ name: 'my-script' }]);

      await runCustomNavigateScripts();

      expect(addedScriptElements()).toHaveLength(0);
    });
  });

  describe('runCustomScriptsForNewContent', () => {
    it('runs the page load scripts the first time, and the navigation scripts after that', async () => {
      setCustomScripts([
        { name: 'on-load.js' },
        { name: 'on-navigate.js', run: 'on-navigate' },
      ]);

      await runCustomScriptsForNewContent();
      expect(addedScriptElements().map(element => element.src)).toEqual([
        expect.stringMatching(/\/on-load\.js$/),
      ]);

      // Navigation scripts are awaited, so simulate the script loading.
      const promise = runCustomScriptsForNewContent();
      await flushPromises();
      addedScriptElements()[1].dispatchEvent(new Event('load'));
      await promise;
      expect(addedScriptElements().map(element => element.src)).toEqual([
        expect.stringMatching(/\/on-load\.js$/),
        expect.stringMatching(/\/on-navigate\.js$/),
      ]);
    });
  });
});
