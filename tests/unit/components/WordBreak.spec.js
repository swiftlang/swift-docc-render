/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { mount, shallowMount } from '@vue/test-utils';
import WordBreak from 'docc-render/components/WordBreak.vue';

describe('WordBreak', () => {
  const mountWithText = (text, options = {}) => shallowMount(WordBreak, {
    ...options,
    slots: { default: text },
  });

  describe('without content', () => {
    it('renders an empty span', () => {
      const wrapper = shallowMount(WordBreak);
      expect(wrapper.is('span')).toBe(true);
      expect(wrapper.isEmpty()).toBe(true);
    });
  });

  it('passes properties transparently', () => {
    const wrapper = mount({
      template: `<word-break
        class="static"
        :class="['dynamic', { dynamic2: true}]"
        aria-label="Foo"
        style="display: block;"
        :style="{ color: 'white' }"
        tag="code"
      >
        FooBar
      </word-break>`,
      components: { WordBreak },
    });
    expect(wrapper.is('code')).toBeTruthy();
    expect(wrapper.classes()).toEqual(['static', 'dynamic', 'dynamic2']);
    expect(wrapper.attributes()).toHaveProperty('aria-label', 'Foo');
    expect(wrapper.attributes()).toHaveProperty('style', 'display: block; color: white;');
  });

  describe('without any safe boundaries', () => {
    it('renders with unchanged content', () => {
      const wrapper = mountWithText('foobarbazqux');
      expect(wrapper.is('span')).toBe(true);
      expect(wrapper.text()).toBe('foobarbazqux');
    });
  });

  describe('with camelCase character pairs', () => {
    it('renders with <wbr> inserted between the pairs', () => {
      expect(mountWithText(
        'fooBarBazQux',
      ).html()).toBe(
        '<span>foo<wbr>Bar<wbr>Baz<wbr>Qux</span>',
      );
    });
  });

  describe('with ":" character boundaries', () => {
    it('renders with <wbr> inserted after the ":"', () => {
      expect(mountWithText(
        'foo:bar:baz:qux',
      ).html()).toBe(
        '<span>foo:<wbr>bar:<wbr>baz:<wbr>qux</span>',
      );
    });
  });

  describe('with "." character boundaries', () => {
    it('renders with <wbr> inserted before the "."', () => {
      expect(mountWithText(
        'Foo.Bar.Baz.Qux',
      ).html()).toBe(
        '<span>Foo<wbr>.Bar<wbr>.Baz<wbr>.Qux</span>',
      );
    });

    it('ignores hanging "." boundaries', () => {
      expect(mountWithText('foo.').html()).toBe('<span>foo.</span>');
      expect(mountWithText('.foo').html()).toBe('<span>.foo</span>');
      expect(mountWithText('.foo.').html()).toBe('<span>.foo.</span>');
      expect(mountWithText('foo. bar').html()).toBe('<span>foo. bar</span>');
    });
  });

  describe('with a camelCase, multi-param API symbol', () => {
    it('renders with <wbr> inserted at both camelCase and "." boundaries', () => {
      expect(mountWithText(
        'writeToFile:atomically:encoding:error:',
      ).html()).toBe(
        '<span>write<wbr>To<wbr>File:<wbr>atomically:<wbr>encoding:<wbr>error:</span>',
      );
    });
  });

  describe('with snake case boundaries', () => {
    it('renders with <wbr> inserted before the "_"', () => {
      expect(mountWithText(
        'foo_bar_baz_qux',
      ).html()).toBe(
        '<span>foo<wbr>_bar<wbr>_baz<wbr>_qux</span>',
      );
      expect(mountWithText(
        'Foo_Bar_Baz_Qux',
      ).html()).toBe(
        '<span>Foo<wbr>_Bar<wbr>_Baz<wbr>_Qux</span>',
      );
      expect(mountWithText(
        'FOO_bar_BAZ_qux',
      ).html()).toBe(
        '<span>FOO<wbr>_bar<wbr>_BAZ<wbr>_qux</span>',
      );
    });

    it('ignores hanging "_" boundaries', () => {
      expect(mountWithText('foo_').html()).toBe('<span>foo_</span>');
      expect(mountWithText('_foo').html()).toBe('<span>_foo</span>');
      expect(mountWithText('_foo_').html()).toBe('<span>_foo_</span>');
      expect(mountWithText('foo_ bar').html()).toBe('<span>foo_ bar</span>');
    });
  });

  describe('with a `tag` prop', () => {
    const mountWithTextAndTag = (text, tag) => mountWithText(text, {
      context: { props: { tag } },
    });

    it('renders with that tag instead of <span>', () => {
      expect(mountWithTextAndTag(
        'fooBar',
        'code',
      ).html()).toBe(
        '<code>foo<wbr>Bar</code>',
      );
    });
  });

  describe('with non-string slots', () => {
    it('does not modify the content', () => {
      const wrapper = shallowMount(WordBreak, {
        slots: { default: '<em>fooBar</em>' },
      });
      expect(wrapper.html()).toBe('<span><em>fooBar</em></span>');
    });
  });

  describe('with mixed content slot', () => {
    it('does not modify the content', () => {
      const wrapper = shallowMount(WordBreak, {
        slots: { default: 'foo<em>barBaz</em>' },
      });
      expect(wrapper.html()).toBe('<span>foo<em>barBaz</em></span>');
    });
  });

  describe('with a custom `safeBoundaryPattern`', () => {
    it('renders with <wbr> inserted where appropriate given the pattern', () => {
      expect(mountWithText(
        'https://foo.bar/baz/qux',
        { context: { props: { safeBoundaryPattern: /(\w(?=\.\w)|\w(?=\/))/g } } },
      ).html()).toBe(
        '<span>https://foo<wbr>.bar<wbr>/baz<wbr>/qux</span>',
      );
    });
  });
});
