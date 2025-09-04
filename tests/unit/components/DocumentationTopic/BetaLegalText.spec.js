/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
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
    expect(wrapper.findComponent(GridRow).exists()).toBe(true);
    expect(wrapper.findComponent(GridColumn).exists()).toBe(true);
    expect(wrapper.findComponent(GridColumn).props('span')).toEqual({ large: 12 });
  });

  it('renders a title', () => {
    expect(wrapper.findComponent('.betainfo-label').text()).toEqual('metadata.beta.software');
  });

  it('renders default content in the content slot', () => {
    const content = wrapper.findComponent('.betainfo-content');
    expect(content.exists()).toBe(true);
    expect(content.text()).toContain('metadata.beta.legal');
  });

  it('exposes a content slot', () => {
    wrapper = shallowMount(BetaLegalText, {
      slots: {
        content: '<div class="foo">Foo</div>',
      },
    });
    const content = wrapper.findComponent('.foo');
    expect(content.exists()).toBe(true);
    expect(content.text()).toContain('Foo');
  });

  it('exposes an `after` slot', () => {
    wrapper = shallowMount(BetaLegalText, {
      slots: {
        content: '<div class="after">After</div>',
      },
    });
    const content = wrapper.findComponent('.after');
    expect(content.exists()).toBe(true);
    expect(content.text()).toContain('After');
  });
});
