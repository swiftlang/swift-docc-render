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

describe('custom-scripts', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.resetModules();

    document.head.innerHTML = '';
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

      await runCustomNavigateScripts();

      expect(addedScriptElements()).toHaveLength(3);
    });

    it('adds the scripts in the order in which they are listed, without `async`', async () => {
      setCustomScripts([
        { name: 'first.js', run: 'on-navigate' },
        { url: 'https://www.example.com/second.js', run: 'on-navigate' },
      ]);

      await runCustomNavigateScripts();

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

      await runCustomNavigateScripts();
      await runCustomNavigateScripts();

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

      await runCustomNavigateScripts();

      const [loads, fails] = addedScriptElements();
      expect(document.head.contains(loads)).toBe(true);
      expect(document.head.contains(fails)).toBe(true);

      loads.dispatchEvent(new Event('load'));
      fails.dispatchEvent(new Event('error'));

      expect(document.head.contains(loads)).toBe(false);
      expect(document.head.contains(fails)).toBe(false);
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

      await runCustomScriptsForNewContent();
      expect(addedScriptElements().map(element => element.src)).toEqual([
        expect.stringMatching(/\/on-load\.js$/),
        expect.stringMatching(/\/on-navigate\.js$/),
      ]);
    });
  });
});
