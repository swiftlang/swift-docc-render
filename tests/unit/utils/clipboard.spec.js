/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { parseDataFromClipboard, prepareDataForHTMLClipboard } from 'docc-render/utils/clipboard';

const payload = { foo: 'foo' };
const xmlPayload = `<data id="copy-data">${JSON.stringify(payload)}</data>`;

describe('clipboard', () => {
  describe('parseDataFromClipboard', () => {
    it('parses data from an html clipboard', () => {
      expect(parseDataFromClipboard(xmlPayload)).toEqual(payload);
    });

    it('returns null, if the data is not properly formatted', () => {
      expect(parseDataFromClipboard('<div id="copy-data">{ "foo": "bar" }</div>')).toEqual(null);
      expect(parseDataFromClipboard('<data id="copy-data">{ "foo": "bar" }')).toEqual(null);
      expect(parseDataFromClipboard('<data>{ "foo": "bar" }</data>')).toEqual(null);
    });

    it('returns proper JSON if content has special tags in it', () => {
      expect(parseDataFromClipboard('<data id="copy-data">{ "foo": "</data>"  }</data>')).toEqual({ foo: '</data>' });
    });

    it('returns proper JSON if wrapper has extra attributes', () => {
      expect(parseDataFromClipboard(`<data id="copy-data" style="color: pink">${JSON.stringify(payload)}</data>`)).toEqual(payload);
    });

    it('retrieves data from deeply nested xml data', () => {
      // Different browsers wrap the data differently, so we need to make sure it works deeply
      expect(parseDataFromClipboard(`<html><body>${xmlPayload}</body></html>`)).toEqual(payload);
    });

    it('does not error out, if the data is not properly formatted', () => {
      expect(parseDataFromClipboard('<data id="copy-data">not JSON</data>')).toBe(null);
      expect(parseDataFromClipboard('<data id="copy-data">{ "foo": bar  }</data>')).toEqual(null);
    });
  });

  describe('prepareDataForHTMLClipboard', () => {
    it('accepts string data', () => {
      expect(prepareDataForHTMLClipboard(JSON.stringify(payload))).toEqual(xmlPayload);
    });

    it('accepts none string data', () => {
      expect(prepareDataForHTMLClipboard(payload)).toEqual(xmlPayload);
    });

    it('does not sanitize data', () => {
      expect(prepareDataForHTMLClipboard('foo')).toEqual('<data id="copy-data">foo</data>');
    });
  });
});
