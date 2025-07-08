/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import EndpointExample from 'docc-render/components/ContentNode/EndpointExample.vue';

const {
  CollapsibleCodeListing, Tabnav, TabnavItem, InlinePlusCircleSolidIcon, InlineMinusCircleSolidIcon,
} = EndpointExample.components;
const { Tab } = EndpointExample.constants;

describe('EndpointExample', () => {
  let wrapper;

  const propsData = {
    request: {
      content: [
        {
          collapsible: false,
          code: [
            'POST /resources HTTP/1.1',
            'Host: example.com',
            'content-type: multipart/form-data; boundary=abc',
            'Content-Length: 4',
            '',
            '--abc',
            'content-type: text/plain',
            'Content-Disposition: form-data; name=metadata',
            '',
            'blah',
          ],
        },
      ],
    },
    response: {
      content: [
        {
          collapsible: true,
          code: [
            '',
          ],
        },
      ],
    },
  };

  beforeEach(() => {
    wrapper = shallowMount(EndpointExample, {
      propsData,
      stubs: { InlinePlusCircleSolidIcon, InlineMinusCircleSolidIcon },
    });
  });

  it('renders tabs for request/response links', () => {
    const tabnav = wrapper.findComponent(Tabnav);
    const tabnavLinks = wrapper.findAll(TabnavItem);
    expect(tabnav.props()).toHaveProperty('value', Tab.request);
    expect(tabnavLinks.length).toBe(2);
    expect(tabnavLinks.at(0).props('value')).toBe(Tab.request);
    expect(tabnavLinks.at(0).text()).toBe('tab.request');
    expect(tabnavLinks.at(1).props('value')).toBe(Tab.response);
    expect(tabnavLinks.at(1).text()).toBe('tab.response');
  });

  it('renders a collapsed CollapsibleCodeListing as an output for Request/Response', () => {
    const codeListing = wrapper.findComponent(CollapsibleCodeListing);
    expect(codeListing.props('content')).toBe(propsData.request.content);
    expect(codeListing.props('collapsed')).toBe(true);
  });

  it('toggles the current tab when selected', async () => {
    wrapper.findComponent(Tabnav).vm.$emit('input', Tab.response);
    await wrapper.vm.$nextTick();
    const codeListing = wrapper.findComponent(CollapsibleCodeListing);
    expect(codeListing.props('content')).toBe(propsData.response.content);
  });

  it('hides the `controls` if content is not collapsible', () => {
    expect(wrapper.findComponent('.controls').exists()).toBe(false);
  });

  it('expands/collapses the CollapsibleCodeListing when the more/less toggle is clicked', async () => {
    // show the response, as it is collapsible
    wrapper.findComponent(Tabnav).vm.$emit('input', Tab.response);
    await wrapper.vm.$nextTick();

    const codeListing = wrapper.findComponent(CollapsibleCodeListing);

    await wrapper.findComponent('.toggle').trigger('click');

    expect(codeListing.props('collapsed')).toBe(false);
    expect(wrapper.findComponent('.toggle').text()).toBe('less');
    expect(wrapper.findComponent(InlineMinusCircleSolidIcon).exists()).toBe(true);

    await wrapper.findComponent('.toggle').trigger('click');

    expect(codeListing.props('collapsed')).toBe(true);
    expect(wrapper.findComponent('.toggle').text()).toBe('more');
    expect(wrapper.findComponent(InlinePlusCircleSolidIcon).exists()).toBe(true);
  });

  it('renders the provided slot content', () => {
    wrapper = shallowMount(EndpointExample, {
      propsData,
      slots: { default: '<div class="foo">Foo</div>' },
    });
    expect(wrapper.findComponent('.foo').text()).toEqual('Foo');
  });
});
