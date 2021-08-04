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
import CodeThemeStore from 'docc-render/stores/CodeThemeStore';
import CodeTheme from 'docc-render/components/Tutorial/CodeTheme.vue';

describe('CodeTheme', () => {
  let wrapper;

  const colors = {
    text: 'textColor',
    background: 'backgroundColor',
    lineHighlight: 'lineHighlightColor',
    commentURL: 'commentURLColor',
    comment: 'commentColor',
    keyword: 'keywordColor',
    stringLiteral: 'stringLiteralColor',
    typeAnnotation: 'typeAnnotationColor',
  };

  beforeEach(() => {
    CodeThemeStore.state.codeColors = colors;
    wrapper = shallowMount(CodeTheme);
  });

  afterEach(() => {
    CodeThemeStore.reset();
  });

  it('sets CSS variables for each color', () => {
    expect(wrapper.vm.codeStyle['--text']).toBe(colors.text);
    expect(wrapper.vm.codeStyle['--background']).toBe(colors.background);
    expect(wrapper.vm.codeStyle['--line-highlight']).toBe(colors.lineHighlight);
    expect(wrapper.vm.codeStyle['--url']).toBe(colors.commentURL);
    expect(wrapper.vm.codeStyle['--syntax-comment']).toBe(colors.comment);
    expect(wrapper.vm.codeStyle['--syntax-quote']).toBe(colors.comment);
    expect(wrapper.vm.codeStyle['--syntax-keyword']).toBe(colors.keyword);
    expect(wrapper.vm.codeStyle['--syntax-literal']).toBe(colors.keyword);
    expect(wrapper.vm.codeStyle['--syntax-selector-tag']).toBe(colors.keyword);
    expect(wrapper.vm.codeStyle['--syntax-string']).toBe(colors.stringLiteral);
    expect(wrapper.vm.codeStyle['--syntax-bullet']).toBe(colors.stringLiteral);
    expect(wrapper.vm.codeStyle['--syntax-meta']).toBe(colors.keyword);
    expect(wrapper.vm.codeStyle['--syntax-number']).toBe(colors.stringLiteral);
    expect(wrapper.vm.codeStyle['--syntax-symbol']).toBe(colors.stringLiteral);
    expect(wrapper.vm.codeStyle['--syntax-tag']).toBe(colors.stringLiteral);
    expect(wrapper.vm.codeStyle['--syntax-attr']).toBe(colors.typeAnnotation);
    expect(wrapper.vm.codeStyle['--syntax-built_in']).toBe(colors.typeAnnotation);
    expect(wrapper.vm.codeStyle['--syntax-builtin-name']).toBe(colors.typeAnnotation);
    expect(wrapper.vm.codeStyle['--syntax-class']).toBe(colors.typeAnnotation);
    expect(wrapper.vm.codeStyle['--syntax-params']).toBe(colors.typeAnnotation);
    expect(wrapper.vm.codeStyle['--syntax-section']).toBe(colors.typeAnnotation);
    expect(wrapper.vm.codeStyle['--syntax-title']).toBe(colors.typeAnnotation);
    expect(wrapper.vm.codeStyle['--syntax-type']).toBe(colors.typeAnnotation);
    expect(wrapper.vm.codeStyle['--syntax-attribute']).toBe(colors.keyword);
    expect(wrapper.vm.codeStyle['--syntax-identifier']).toBe(colors.text);
    expect(wrapper.vm.codeStyle['--syntax-subst']).toBe(colors.text);
  });

  describe('internal param name color', () => {
    it('is 25% lighter than the text color for light backgrounds', () => {
      wrapper.setData({
        codeThemeState: {
          codeColors: {
            background: 'rgba(255, 255, 255, 1)',
            text: 'rgba(0, 0, 0, 1)',
          },
        },
      });
      expect(wrapper.vm.codeStyle['--color-syntax-param-internal-name'])
        .toBe('rgba(64, 64, 64, 1)');
    });

    it('is 25% darker than the text color for dark backgrounds', () => {
      wrapper.setData({
        codeThemeState: {
          codeColors: {
            background: 'rgba(0, 0, 0, 1)',
            text: 'rgba(255, 255, 255, 1)',
          },
        },
      });
      expect(wrapper.vm.codeStyle['--color-syntax-param-internal-name'])
        .toBe('rgba(191, 191, 191, 1)');
    });

    it('falls back to the text color if any calculation crashes', () => {
      wrapper.setData({
        codeThemeState: {
          codeColors: {
            background: 'rgba(0, 0, 0, 1)',
            text: 'notrgbainput',
          },
        },
      });
      expect(wrapper.vm.codeStyle['--color-syntax-param-internal-name'])
        .toBe(colors.text);
    });
  });
});
