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
import CallToAction from 'docc-render/components/Article/CallToAction.vue';
// eslint-disable-next-line import/no-named-default
import { default as TutorialCTA } from 'docc-render/components/Tutorial/CallToAction.vue';

describe('CallToAction', () => {
  let wrapper;

  const propsData = {
    abstract: [
      {
        type: 'text',
        text: 'foobar',
      },
    ],
    action: {
      identifier: 'topic://foo.bar',
      overridingTitle: 'Get started',
    },
    media: 'foo.bar',
    title: 'Fooing the bar',
  };

  beforeEach(() => {
    wrapper = shallowMount(CallToAction, { propsData });
  });

  it('renders a `TutorialCTA`', () => {
    const cta = wrapper.find(TutorialCTA);
    expect(cta.exists()).toBe(true);
    expect(cta.props()).toEqual(propsData);
  });
});
