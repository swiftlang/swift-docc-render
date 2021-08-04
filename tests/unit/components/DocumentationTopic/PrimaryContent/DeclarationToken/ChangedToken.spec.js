/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import ChangedToken
  from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationToken/ChangedToken.vue';
import { shallowMount } from '@vue/test-utils';
import DeclarationToken from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationToken.vue';

const propsData = {
  kind: 'removed',
  tokens: [{
    kind: 'text',
    text: 'abc',
  }, {
    kind: 'text',
    text: 'bar',
  }],
};
describe('ChangedToken', () => {
  it('applies token-removed classes to the ChangedToken', () => {
    const wrapper = shallowMount(ChangedToken, { propsData });
    expect(wrapper.classes()).toContain('token-removed');
    expect(wrapper.classes()).toContain('token-changed');
  });

  it('applies token-added classes to the ChangedToken', () => {
    const wrapper = shallowMount(ChangedToken, { propsData: { ...propsData, kind: 'added' } });
    expect(wrapper.classes()).toContain('token-added');
    expect(wrapper.classes()).toContain('token-changed');
  });

  it('renders DeclarationToken for each token', () => {
    const wrapper = shallowMount(ChangedToken, { propsData });

    const tokens = wrapper.findAll(DeclarationToken);
    expect(tokens).toHaveLength(2);
    expect(tokens.at(0).props()).toEqual(expect.objectContaining(propsData.tokens[0]));
  });
});
