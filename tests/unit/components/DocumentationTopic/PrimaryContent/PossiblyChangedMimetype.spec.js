/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import PossiblyChangedMimetype
  from 'docc-render/components/DocumentationTopic/PrimaryContent/PossiblyChangedMimetype.vue';
import { shallowMount } from '@vue/test-utils';
import { ChangeTypes } from 'docc-render/constants/Changes';

const { RenderChanged } = PossiblyChangedMimetype.components;

const mimetype = 'foo';
const changes = {
  new: 'newVal',
  previous: 'oldVal',
};
const change = ChangeTypes.modified;

function createWrapper(props) {
  return shallowMount(PossiblyChangedMimetype, {
    propsData: {
      mimetype,
      changes,
      change,
      ...props,
    },
    stubs: {
      RenderChanged,
    },
  });
}

describe('PossiblyChangedMimetype', () => {
  it('renders a mimetype with default value', () => {
    const wrapper = createWrapper({ changes: {} });
    expect(wrapper.find('.response-mimetype').text()).toBe('Content-Type: foo');
  });

  it('renders two mimetypes, one for each change', () => {
    const wrapper = createWrapper();
    const mimeTypes = wrapper.findAll('.response-mimetype');
    expect(mimeTypes).toHaveLength(2);
    expect(mimeTypes.at(0).text()).toBe('Content-Type: newVal');
    expect(mimeTypes.at(1).text()).toBe('Content-Type: oldVal');
  });

  it('does not render a mimetype change, if the change is not of type "modified"', () => {
    const wrapper = createWrapper({
      change: ChangeTypes.added,
    });
    const mimeTypes = wrapper.findAll('.response-mimetype');
    expect(mimeTypes).toHaveLength(1);
    expect(mimeTypes.at(0).text()).toBe('Content-Type: foo');
  });

  it('does not render a mimetype change, if a string is provided as changes, when `change` is not `modified`', () => {
    const wrapper = createWrapper({
      changes: mimetype,
      change: ChangeTypes.added,
    });

    expect(wrapper.find('.response-mimetype').text()).toBe('Content-Type: foo');
  });

  it('does not render a mimetype change, if change is `modified` but the changes are still a `string`.', () => {
    const wrapper = createWrapper({
      changes: mimetype,
      change: ChangeTypes.modified,
    });

    expect(wrapper.find('.response-mimetype').text()).toBe('Content-Type: foo');
  });
});
