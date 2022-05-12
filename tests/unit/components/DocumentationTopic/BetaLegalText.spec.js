/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import BetaLegalText from 'docc-render/components/DocumentationTopic/BetaLegalText.vue';
import { shallowMount } from '@vue/test-utils';
import GridRow from 'docc-render/components/GridRow.vue';
import GridColumn from 'docc-render/components/GridColumn.vue';

describe('BetaLegalText', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(BetaLegalText);
  });
  it('renders the BetaLegalText inside a grid', () => {
    expect(wrapper.find(GridRow).exists()).toBe(true);
    expect(wrapper.find(GridColumn).exists()).toBe(true);
    expect(wrapper.find(GridColumn).props('span')).toEqual({ large: 12 });
  });

  it('renders a title', () => {
    expect(wrapper.find('.betainfo-label').text()).toEqual('Beta Software');
  });

  it('renders default content in the content slot', () => {
    const content = wrapper.find('.betainfo-content');
    expect(content.exists()).toBe(true);
    expect(content.text()).toContain('This documentation refers to beta software and may be changed.');
  });

  it('exposes a content slot', () => {
    wrapper = shallowMount(BetaLegalText, {
      slots: {
        content: '<div class="foo">Foo</div>',
      },
    });
    const content = wrapper.find('.foo');
    expect(content.exists()).toBe(true);
    expect(content.text()).toContain('Foo');
  });

  it('exposes an `after` slot', () => {
    wrapper = shallowMount(BetaLegalText, {
      slots: {
        content: '<div class="after">After</div>',
      },
    });
    const content = wrapper.find('.after');
    expect(content.exists()).toBe(true);
    expect(content.text()).toContain('After');
  });
});
