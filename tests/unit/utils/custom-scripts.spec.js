/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

/* eslint-disable no-eval */

let runCustomPageLoadScripts;
let runCustomNavigateScripts;

let jsonMock;
let fetchMock;

const textMock = jest.fn().mockResolvedValue('');

const createElementMock = jest.fn(document.createElement);
document.createElement = createElementMock;

const evalMock = jest.fn(eval);
window.eval = evalMock;

/**
 * Sets the custom-scripts.json array fetched by the fetchMock.
 * @param {object[]} customScripts
 */
function setCustomScripts(customScripts) {
  // The jsonMock is different for each test, so it must be reset.
  jsonMock = jest.fn().mockResolvedValue(customScripts);

  // The first call to the fetch function on each test will be to fetch custom-scripts.json. That's
  // what the jsonMock is for. Any subsequent calls to fetch will be in the
  // runCustomNavigateScripts tests, to fetch the contents of each script file.
  fetchMock = jest.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: jsonMock,
    }).mockResolvedValue({
      ok: true,
      text: textMock,
    });

  window.fetch = fetchMock;
}

describe('custom-scripts', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.resetModules();
    // eslint-disable-next-line global-require
    ({ runCustomPageLoadScripts, runCustomNavigateScripts } = require('@/utils/custom-scripts'));
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

      // Unclear why this is necessary for runCustomNavigateScripts, especially since `await`ing
      // runCustomPageLoadScripts works fine.
      await new Promise(process.nextTick);

      expect(evalMock).toHaveBeenCalledTimes(3);
    });

    it('does not create script elements', async () => {
      setCustomScripts([{
        name: 'my_script.js',
        run: 'on-navigate',
      }]);

      await runCustomNavigateScripts();
      await new Promise(process.nextTick);

      expect(createElementMock).toHaveBeenCalledTimes(0);
    });

    it('does not run scripts without a `run` property', async () => {
      setCustomScripts([{ name: 'my-script' }]);

      await runCustomNavigateScripts();
      await new Promise(process.nextTick);

      expect(evalMock).toHaveBeenCalledTimes(0);
    });
  });
});
