/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

/* eslint-disable */

import {
  LanguageAliasEntries,
  SupportedLanguagesSet,
  sanitizeMultilineNodes,
} from "docc-render/utils/syntax-highlight";

let hljs;
let highlightContent;
let highlight;
let registerHighlightLanguage;
let LanguageAliasCacheMap;

/**
 *
 * @param {string[]} content
 * @param {string} language
 * @returns {Promise<{ highlightedCode: string, sanitizedCode: string }>}
 */
async function prepare(content, language) {
  // register the language with highlightjs
  await registerHighlightLanguage(language);
  // use this for a reference
  const highlightedCode = highlight(content.join("\n"), language);
  const tempElement = document.createElement("code");
  tempElement.innerHTML = highlightedCode;

  // transform the content
  const sanitizedCode = highlightContent(content, language);
  return {
    highlightedCode: tempElement.innerHTML,
    sanitizedCode: sanitizedCode.join("\n"), // revert back to string
  };
}

const tryHighlight = (code, lang) => () => highlight(code, lang);

describe("syntax-highlight", () => {
  // reset the imported modules between tests
  beforeEach(async () => {
    jest.resetModules();
    hljs = await import("highlight.js/lib/core");
    ({ highlightContent, highlight, registerHighlightLanguage, LanguageAliasCacheMap } =
      await import("docc-render/utils/syntax-highlight"));
  });

  it("does nothing to single row syntax", async () => {
    const content = ['let name = "Rosa"', 'let personalizedGreeting = "Welcome, \\(name)!"'];
    const { highlightedCode, sanitizedCode } = await prepare(content, "swift");
    expect(sanitizedCode).toEqual(highlightedCode);
    expect(sanitizedCode).toMatchInlineSnapshot(`
      <span class="syntax-keyword">let</span> name <span class="syntax-operator">=</span> <span class="syntax-string">"Rosa"</span>
      <span class="syntax-keyword">let</span> personalizedGreeting <span class="syntax-operator">=</span> <span class="syntax-string">"Welcome, <span class="syntax-subst">\\(name)</span>!"</span>
    `);
  });

  it("wraps multiline blocks into in the same tag as the parent", async () => {
    const content = [
      'let banner = """',
      "          __,",
      "         (           o  /) _/_",
      "          `.  , , , ,  //  /",
      "        (___)(_(_/_(_ //_ (__",
      "                     /)",
      "                    (/",
      '        """',
    ];
    const { highlightedCode, sanitizedCode } = await prepare(content, "swift");
    expect(sanitizedCode).not.toEqual(highlightedCode);
    expect(sanitizedCode).toMatchInlineSnapshot(`
      <span class="syntax-keyword">let</span> banner <span class="syntax-operator">=</span> <span class="syntax-string">"""</span>
      <span class="syntax-string">          __,</span>
      <span class="syntax-string">         (           o  /) _/_</span>
      <span class="syntax-string">          \`.  , , , ,  //  /</span>
      <span class="syntax-string">        (___)(_(_/_(_ //_ (__</span>
      <span class="syntax-string">                     /)</span>
      <span class="syntax-string">                    (/</span>
      <span class="syntax-string">        """</span>
    `);
  });

  it("wraps multiline nested highlighted blocks", async () => {
    const content = [
      "function someName(foo,",
      "          bar,",
      "          baz) {",
      "  foo()",
      "}",
    ];
    const { highlightedCode, sanitizedCode } = await prepare(content, "js");
    expect(sanitizedCode).not.toEqual(highlightedCode);
    expect(sanitizedCode).toMatchInlineSnapshot(`
      <span class="syntax-keyword">function</span> <span class="syntax-title function_">someName</span>(<span class="syntax-params">foo,</span>
      <span class="syntax-params">          bar,</span>
      <span class="syntax-params">          baz</span>) {
      <span class="syntax-title function_">foo</span>()
      }
    `);
  });

  it("wraps multiline nested html elements", () => {
    const code = document.createElement("CODE");
    code.innerHTML = `<span class="syntax-function">function <span class="syntax-title function_">someName</span>(<span class="syntax-params">foo,
          bar,
          baz</span>)</span> <span class="syntax-function-body">{
<span class="syntax-title function_">foo</span>()
}</span>`;
    sanitizeMultilineNodes(code);
    expect(code.innerHTML).toMatchInlineSnapshot(`
      <span class="syntax-function">function <span class="syntax-title function_">someName</span>(<span class="syntax-params">foo,</span></span>
      <span class="syntax-function"><span class="syntax-params">          bar,</span></span>
      <span class="syntax-function"><span class="syntax-params">          baz</span>)</span> <span class="syntax-function-body">{</span>
      <span class="syntax-function-body"><span class="syntax-title function_">foo</span>()</span>
      <span class="syntax-function-body">}</span>
    `);
  });

  it("tokenizes swift class functions correctly", async () => {
    const content = ["class func foo() async throws -> [Bar]"];
    const { highlightedCode } = await prepare(content, "swift");
    expect(highlightedCode).toMatchInlineSnapshot(
      `<span class="syntax-keyword">class</span> <span class="syntax-keyword">func</span> <span class="syntax-title function_">foo</span>() <span class="syntax-keyword">async</span> <span class="syntax-keyword">throws</span> -&gt; [<span class="syntax-type">Bar</span>]`
    );
  });

  it("does not tokenize swift keywords inside words", async () => {
    const content = [
      "var protocolMock = true  // 'protocol' is not highlighted",
      "var myenum = true  // 'enum' is not highlighted",
      "if FooConfig.supportsReconstruction(.someClassification) {",
      "    configuration.fooReconstruction = .someprotocolextensionclass",
      "}",
    ];
    const { highlightedCode } = await prepare(content, "swift");
    expect(highlightedCode).toMatchInlineSnapshot(`
      <span class="syntax-keyword">var</span> protocolMock <span class="syntax-operator">=</span> <span class="syntax-literal">true</span> <span class="syntax-comment">// 'protocol' is not highlighted</span>
      <span class="syntax-keyword">var</span> myenum <span class="syntax-operator">=</span> <span class="syntax-literal">true</span> <span class="syntax-comment">// 'enum' is not highlighted</span>
      <span class="syntax-keyword">if</span> <span class="syntax-type">FooConfig</span>.supportsReconstruction(.someClassification) {
      configuration.fooReconstruction <span class="syntax-operator">=</span> .someprotocolextensionclass
      }
    `);
  });

  it('tokenizes docc "documentation markup" for markdown language', async () => {
    const content = [
      "# h1",
      "## h2",
      "### h3",
      "",
      "paragraph with _italics_ and **bold** and `code`",
      "",
      "[link](https://example.com) and ![image](/path/to/image.jpg)",
      "",
      "* unordered",
      "* list",
      "",
      "1. ordered",
      "2. list",
      "",
      "> Note:",
      "> This is a note.",
      "",
      "> Experiment:",
      "> This is an experiment.",
      "",
      "> Tip:",
      "> This is a tip.",
      "",
      "> Warning:",
      "> This is a warning.",
      "",
      "> Other:",
      "> This is a normal blockquote",
      "",
      "@Directive(time: 42, files: example.zip) {",
      "  @NestedDirective",
      "}",
      "",
      "``FakeSymbol``",
      "",
      "<doc:FakeSymbol>",
      "",
      "<doc:/path/to/fakesymbol>",
    ];
    const { highlightedCode } = await prepare(content, "markdown");
    expect(highlightedCode).toMatchInlineSnapshot(`
      <span class="syntax-section"># h1</span>
      <span class="syntax-section">## h2</span>
      <span class="syntax-section">### h3</span>

      paragraph with <span class="syntax-emphasis">_italics_</span> and <span class="syntax-strong">**bold**</span> and <span class="syntax-code">\`code\`</span>

      [<span class="syntax-string">link</span>](<span class="syntax-link">https://example.com</span>) and ![<span class="syntax-string">image</span>](<span class="syntax-link">/path/to/image.jpg</span>)

      <span class="syntax-bullet">*</span> unordered
      <span class="syntax-bullet">*</span> list

      <span class="syntax-bullet">1.</span> ordered
      <span class="syntax-bullet">2.</span> list

      <span class="syntax-quote">&gt; </span><span class="syntax-type">Note:</span><span class="syntax-quote">
      &gt; This is a note.</span>

      <span class="syntax-quote">&gt; </span><span class="syntax-type">Experiment:</span><span class="syntax-quote">
      &gt; This is an experiment.</span>

      <span class="syntax-quote">&gt; </span><span class="syntax-type">Tip:</span><span class="syntax-quote">
      &gt; This is a tip.</span>

      <span class="syntax-quote">&gt; </span><span class="syntax-type">Warning:</span><span class="syntax-quote">
      &gt; This is a warning.</span>

      <span class="syntax-quote">&gt; Other:</span>
      <span class="syntax-quote">&gt; </span><span class="syntax-quote">This is a normal blockquote</span>

      <span class="syntax-title">@Directive</span>(time: <span class="syntax-number">42</span>, files: example.zip) {
      <span class="syntax-title">@NestedDirective</span>
      }

      \`\`<span class="syntax-link">FakeSymbol</span>\`\`

      &lt;<span class="syntax-link">doc:FakeSymbol</span>&gt;

      &lt;<span class="syntax-link">doc:/path/to/fakesymbol</span>&gt;
    `);
  });

  it("returns false if the language is not supported", async () => {
    expect(await registerHighlightLanguage("pascal")).toBe(false);
  });

  it("returns false if already registered", async () => {
    expect(hljs.listLanguages().includes("swift")).toBe(false);
    expect(await registerHighlightLanguage("swift")).toBe(true);
    expect(await registerHighlightLanguage("swift")).toBe(false);
  });

  describe("language aliases", () => {
    it("registers a primary language, by its alias", async () => {
      const [firstAlias] = LanguageAliasEntries;
      const [language, aliases] = firstAlias;
      // assert the language is not registered
      expect(hljs.listLanguages().includes(language)).toBe(false);
      // register the first alias
      expect(await registerHighlightLanguage(aliases[0])).toBe(true);
      // assert the language is registered
      expect(hljs.listLanguages().includes(language)).toBe(true);
    });

    it("once an alias language registered, it silently fails, if registering another alias from the same list", async () => {
      const [firstAlias] = LanguageAliasEntries;
      const [language, aliases] = firstAlias;
      // assert the language is not registered
      expect(await registerHighlightLanguage(aliases[0])).toBe(true);
      expect(hljs.listLanguages().includes(language)).toBe(true);
      // register the second alias, and assert it returns false
      expect(await registerHighlightLanguage(aliases[1])).toBe(false);
    });

    it("caches alias searches for improved performance", async () => {
      const [firstAlias, secondAlias] = LanguageAliasEntries;
      const [firstLanguage, firstAliases] = firstAlias;
      const [secondLanguage, secondAliases] = secondAlias;
      // assert the language is not registered
      expect(await registerHighlightLanguage(firstAliases[0])).toBe(true);
      expect(LanguageAliasCacheMap.get(firstAliases[0])).toBe(firstLanguage);
      // register the second alias, and assert it returns false
      expect(await registerHighlightLanguage(firstAliases[1])).toBe(false);
      expect(LanguageAliasCacheMap.get(firstAliases[1])).toBe(firstLanguage);
      expect(await registerHighlightLanguage("invalid")).toBe(false);
      expect(LanguageAliasCacheMap.get("invalid")).toBe(null);
      expect(await registerHighlightLanguage(secondAliases[0])).toBe(true);
      expect(LanguageAliasCacheMap.get(secondAliases[0])).toBe(secondLanguage);
    });
  });

  it.each([...SupportedLanguagesSet])(
    'does not thrown an error when the language is "%s"',
    async (language) => {
      await registerHighlightLanguage(language);
      expect(tryHighlight("foo", language)).not.toThrow();
    }
  );

  describe("custom aliases", () => {
    it('does not throw an error when the language is "objective-c"', async () => {
      const language = "objective-c";
      await registerHighlightLanguage(language);
      expect(tryHighlight("foo", language)).not.toThrow();
    });
  });

  it("throws an error for unsupported languages", () => {
    expect(tryHighlight("foo", "bash")).toThrowError(
      /Unsupported language for syntax highlighting: bash/
    );
    expect(tryHighlight("foo", "fakelanguage")).toThrowError(
      /Unsupported language for syntax highlighting: fakelanguage/
    );
  });
});
