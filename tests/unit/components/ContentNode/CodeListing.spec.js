/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import CodeListing from 'docc-render/components/ContentNode/CodeListing.vue';
import { flushPromises } from '../../../../test-utils';

describe('CodeListing', () => {
  const { Filename } = CodeListing.components;

  it('renders the file name if provided', () => {
    const fileName = 'myfile';
    const isFileNameActionable = true;

    const wrapper = shallowMount(CodeListing, {
      propsData: {
        syntax: 'swift',
        fileType: 'swift',
        content: ['hello ', 'world'],
        fileName,
        isFileNameActionable,
      },
    });

    const fileNameComponent = wrapper.find(Filename);
    expect(fileNameComponent.exists()).toBe(true);
    expect(fileNameComponent.props('isActionable')).toBe(isFileNameActionable);
    expect(fileNameComponent.props('fileType')).toBe('swift');
    expect(fileNameComponent.text()).toBe(fileName);

    // Test that an event is emitted when the file name is clicked.
    fileNameComponent.vm.$emit('click');
    expect(wrapper.emitted()['file-name-click']).toBeTruthy();
  });

  it('renders a <span> with <pre><code>', async () => {
    const wrapper = shallowMount(CodeListing, {
      propsData: {
        syntax: 'swift',
        fileType: 'swift',
        content: ['hello ', 'world'],
      },
    });

    await flushPromises();

    const listing = wrapper.find('div.code-listing');
    expect(listing.attributes('data-syntax')).toBe('swift');

    const codeLineContainer = listing.find('span.code-line-container');
    const codeNumber = codeLineContainer.find('.code-number');
    // Code Number content should be empty to not get copied during user select
    expect(codeNumber.text()).toBe('');

    const codeLine = codeLineContainer.find('.code-line');
    expect(codeLine.text()).toBe('hello');
  });

  it('creates a span per line and highlights the correct lines', async () => {
    const content = ['a', 'b', 'c', 'd', 'e'];
    const highlights = [{ line: 1 }, { line: 3 }];

    const wrapper = shallowMount(CodeListing, {
      propsData: {
        content,
        highlights,
        showLineNumbers: true,
      },
    });

    await flushPromises();

    const pre = wrapper.find('pre');
    expect(pre.exists()).toBe(true);

    const codeLineContainers = wrapper.findAll('pre code span.code-line-container');
    expect(codeLineContainers.length).toBe(content.length);

    content.forEach((line, index) => {
      const codeLineContainer = codeLineContainers.at(index);
      const shouldBeHighlighted = highlights.map(h => h.line).includes(index + 1);

      const codeNumber = codeLineContainer.find('.code-number');
      // expect(codeNumber.text()).toBe(`${index + 1}`);

      expect(codeNumber.attributes('data-line-number')).toBe(`${index + 1}`);

      const codeLine = codeLineContainer.find('.code-line');
      expect(codeLine.text()).toBe(line);

      expect(codeLineContainer.classes('highlighted')).toBe(shouldBeHighlighted);
    });
  });

  it('syntax highlights code for Swift', async () => {
    const wrapper = shallowMount(CodeListing, {
      propsData: {
        syntax: 'swift',
        content: ['let foo = "bar"'],
      },
    });
    await flushPromises();

    const syntaxToken = wrapper.find('.syntax-keyword');
    expect(syntaxToken.exists()).toBe(true);
    expect(syntaxToken.text()).toBe('let');
  });

  it('syntax highlights occ as objc', async () => {
    const wrapper = shallowMount(CodeListing, {
      propsData: {
        syntax: 'occ',
        content: ['typedef enum { Foo = 1 } Bar;'],
      },
    });

    await flushPromises();

    const syntaxToken = wrapper.find('.syntax-keyword');
    expect(syntaxToken.exists()).toBe(true);
    expect(syntaxToken.text()).toBe('typedef');
    expect(wrapper.attributes('data-syntax')).toBe('objc');
  });

  it('does not crash when trying to highlight unknown syntax', () => {
    const wrapper = shallowMount(CodeListing, {
      propsData: {
        syntax: 'other',
        content: ['let foo = "bar"'],
      },
    });
    const syntaxToken = wrapper.find('.syntax-keyword');
    expect(syntaxToken.exists()).toBe(false);
    expect(wrapper.html().includes('.syntax')).toBe(false);
  });

  it('renders code with empty spaces', async () => {
    const wrapper = shallowMount(CodeListing, {
      propsData: {
        syntax: 'other',
        content: ['let foo = "bar"', '', 'const baz = true'],
      },
    });
    await flushPromises();

    const codeLines = wrapper.findAll('.code-line');
    expect(codeLines).toHaveLength(3);
    expect(codeLines.at(0).text()).toEqual('let foo = "bar"');
    // make sure a new line is added
    expect(codeLines.at(1).element.textContent).toEqual('\n');
    expect(codeLines.at(2).text()).toEqual('const baz = true');
  });

  it('escapes html when highlighting code with unknown syntax', async () => {
    const wrapper = shallowMount(CodeListing, {
      propsData: {
        syntax: 'other',
        content: ['<marquee>foobar</marquee>'],
      },
    });
    await flushPromises();

    expect(wrapper.html().includes('<marquee>foobar</marquee>')).toBe(false);
    expect(wrapper.html().includes('&lt;marquee&gt;foobar&lt;/marquee&gt;')).toBe(true);
  });

  it('re-highlights content if it changes', async () => {
    const wrapper = shallowMount(CodeListing, {
      propsData: {
        syntax: 'swift',
        content: ['let foo = "bar"'],
      },
    });
    await flushPromises();

    expect(wrapper.find('.syntax-keyword').text()).toBe('let');
    wrapper.setProps({
      content: ['print("Some Text")'],
    });
    await flushPromises();
    expect(wrapper.find('.syntax-built_in').text()).toBe('print');
  });

  it('adds a class `single-line` if only one line of code is provided', async () => {
    const content = ['let foo = "bar"', '', 'const baz = true'];
    const wrapper = shallowMount(CodeListing, {
      propsData: {
        syntax: 'other',
        content,
      },
    });
    await flushPromises();

    expect(wrapper.classes()).not.toContain('single-line');
    wrapper.setProps({
      content: content.slice(0, 1),
    });

    await flushPromises();

    expect(wrapper.classes()).toContain('single-line');
  });
});
