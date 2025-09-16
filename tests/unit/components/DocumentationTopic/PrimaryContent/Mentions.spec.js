/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import Mentions from 'docc-render/components/DocumentationTopic/PrimaryContent/Mentions.vue';
import Mention from 'docc-render/components/DocumentationTopic/PrimaryContent/Mention.vue';

function createReferences(names) {
  return names.reduce((refs, name) => ({
    ...refs,
    [`doc://${name}`]: {
      abstract: [{ type: 'text', text: name }],
      identifier: `doc://${name}`,
      kind: 'article',
      role: 'article',
      title: name,
      url: `/${name}`,
    },
  }), {});
}

describe('Mentions', () => {
  it('renders a Mention link', () => {
    const references = createReferences(['foo', 'bar']);
    const mentions = Object.keys(references);
    const wrapper = shallowMount(Mentions, {
      propsData: {
        mentions,
      },
      provide: {
        store: {
          state: { references },
        },
      },
    });
    expect(wrapper.findComponent('linkableheading-stub').attributes()).toEqual({
      level: '2',
      anchor: 'mentions',
    });
    const mentionComponents = wrapper.findAllComponents(Mention);
    expect(mentionComponents.length).toBe(mentions.length);
    mentions.forEach((id, i) => {
      expect(mentionComponents.at(i).props()).toEqual({
        kind: references[id].kind,
        role: references[id].role,
        title: references[id].title,
        url: references[id].url,
      });
    });
  });

  it('renders at most 5 links', () => {
    const references = createReferences([...'abcdefghijklmnop']);
    const mentions = Object.keys(references);
    const wrapper = shallowMount(Mentions, {
      propsData: {
        mentions,
      },
      provide: {
        store: {
          state: { references },
        },
      },
    });

    expect(wrapper.findComponent('linkableheading-stub').attributes()).toEqual({
      level: '2',
      anchor: 'mentions',
    });
    const mentionComponents = wrapper.findAllComponents(Mention);
    expect(mentionComponents.length).toBe(5);
  });

  it('omits a "Mentioned In" section when no mention data is provided', () => {
    const wrapper = shallowMount(Mentions, {
      propsData: {
        mentions: [],
      },
      mentions: [],
    });
    expect(wrapper.findComponent('linkableheading-stub').exists()).toBe(false);
    expect(wrapper.findAllComponents(Mention).length).toBe(0);
  });

  it('omits a "Mentioned In" section when mentions are empty', () => {
    const wrapper = shallowMount(Mentions, {
      propsData: {
        mentions: [],
      },
      mentions: [],
    });
    expect(wrapper.findComponent('linkableheading-stub').exists()).toBe(false);
    expect(wrapper.findAllComponents(Mention).length).toBe(0);
  });
});
