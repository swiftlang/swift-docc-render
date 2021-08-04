/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { indentDeclaration } from 'docc-render/utils/indentation';

const prepare = (originalCode) => {
  const decl = document.createElement('div');
  decl.classList.add('declaration');
  decl.classList.add('code-listing');
  decl.innerHTML = `<pre><code>${originalCode}</code></pre>`;
  return decl.querySelector('code');
};

describe('indentDeclaration', () => {
  describe('swift', () => {
    describe('with a function', () => {
      it('should align the param names', () => {
        const originalCode = '<span class="token-keyword">func</span> <span class="token-identifier">components</span>(<span class="token-externalParam">_</span> <span class="token-internalParam">unitFlags</span>: NSCalendarUnit, <span class="token-externalParam">fromDate</span> <span class="token-internalParam">date</span>: NSDate) -&gt; NSDateComponents';
        const expectedCode = '<span class="token-keyword">func</span> <span class="token-identifier">components</span>(<span class="token-externalParam">_</span> <span class="token-internalParam">unitFlags</span>: NSCalendarUnit, <span class="token-externalParam">\n       fromDate</span> <span class="token-internalParam">date</span>: NSDate) -&gt; NSDateComponents\n';

        const code = prepare(originalCode);

        indentDeclaration(code, 'swift');

        expect(code.innerHTML).not.toEqual(originalCode);
        expect(code.innerHTML).toEqual(expectedCode);
      });
    });

    describe('with an initializer', () => {
      it('should add newlines for param names', () => {
        const originalCode = '<span class="token-keyword">init</span>(<span class="token-externalParam">foo</span> <span class="token-internalParam">foo</span>: Foo, <span class="token-externalParam">bar</span> <span class="internalParam">bar</span>: Bar)';
        const expectedCode = '<span class="token-keyword">init</span>(<span class="token-externalParam">foo</span> <span class="token-internalParam">foo</span>: Foo, <span class="token-externalParam">\n bar</span> <span class="internalParam">bar</span>: Bar)\n';

        const code = prepare(originalCode);

        indentDeclaration(code, 'swift');

        expect(code.innerHTML).not.toEqual(originalCode);
        expect(code.innerHTML).toEqual(expectedCode);
      });
    });

    describe('with a property', () => {
      it('should not add indentation', () => {
        const originalCode = '<span class="token-keyword">var</span> <span class="token-identifier">description</span>: <span class="token-type">String</span> { <span class="token-keyword">get</span>';

        const code = prepare(originalCode);

        indentDeclaration(code, 'swift');

        expect(code.innerHTML).toEqual(originalCode);
      });
    });
  });

  describe('occ', () => {
    describe('with a function', () => {
      it('should align the param names', () => {
        const originalCode = '- (<span class="token-keyword">void</span>)<span class="token-identifier">getObjects:</span>(<span class="token-type">ObjectType  _Nonnull []</span>)<span class="token-param-name">objects</span> <span class="token-identifier">range:</span>(<span class="token-type">NSRange</span>)<span class="token-param-name">range</span>;';
        const expectedCode = '- (<span class="token-keyword">void</span>)<span class="token-identifier">getObjects:</span>(<span class="token-type">ObjectType  _Nonnull []</span>)<span class="token-param-name">objects</span> <span class="token-identifier">\n             range:</span>(<span class="token-type">NSRange</span>)<span class="token-param-name">range</span>;\n';

        const code = prepare(originalCode);

        indentDeclaration(code, 'occ');

        expect(code.innerHTML).not.toEqual(originalCode);
        expect(code.innerHTML).toEqual(expectedCode);
      });
    });

    describe('with an initializer', () => {
      it('should align the param names', () => {
        const originalCode = '- (<span class="token-keyword">instancetype</span>)<span class="token-identifier">initWithObjects:</span>(<span class="token-type">const ObjectType  _Nonnull []</span>)<span class="token-param-name">objects</span> <span class="token-identifier">count:</span>(<span class="token-type">NSUInteger</span>)<span class="token-param-name">cnt</span>;';
        const expectedCode = '- (<span class="token-keyword">instancetype</span>)<span class="token-identifier">initWithObjects:</span>(<span class="token-type">const ObjectType  _Nonnull []</span>)<span class="token-param-name">objects</span> <span class="token-identifier">\n                          count:</span>(<span class="token-type">NSUInteger</span>)<span class="token-param-name">cnt</span>;\n';

        const code = prepare(originalCode);

        indentDeclaration(code, 'occ');

        expect(code.innerHTML).not.toEqual(originalCode);
        expect(code.innerHTML).toEqual(expectedCode);
      });
    });

    describe('with a property', () => {
      it('should not add indentation', () => {
        const originalCode = '@property(readonly) NSUInteger count;';

        const code = prepare(originalCode);

        indentDeclaration(code, 'occ');

        expect(code.innerHTML).toEqual(originalCode);
      });
    });
  });
});
