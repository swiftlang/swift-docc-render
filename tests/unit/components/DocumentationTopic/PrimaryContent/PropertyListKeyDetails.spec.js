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
import PropertyListKeyDetails from 'docc-render/components/DocumentationTopic/PrimaryContent/PropertyListKeyDetails.vue';

const {
  OnThisPageSection,
  PropertyListKeyType,
} = PropertyListKeyDetails.components;

describe('PropertyKeyListDetails', () => {
  let wrapper;

  const propsData = {
    details: {
      name: 'com.example.developer.networking.networkextension',
      value: [
        {
          baseType: 'string',
          arrayMode: 'required',
        },
      ],
      platforms: ['iOS', 'macOS'],
      ideTitle: 'Network Extensions Entitlement',
      titleStyle: 'title',
    },
  };

  beforeEach(() => {
    wrapper = shallowMount(PropertyListKeyDetails, { propsData });
  });

  it('renders an `OnThisPageSection`', () => {
    expect(wrapper.is('.details')).toBe(true);

    const section = wrapper.find(OnThisPageSection);
    expect(section.exists()).toBe(true);
    expect(section.classes('details')).toBe(true);
    expect(section.props()).toEqual({
      anchor: 'details',
      title: 'Details',
    });
  });

  it('renders an h2 with "Details"', () => {
    const h2 = wrapper.find('h2');
    expect(h2.exists()).toBe(true);
    expect(h2.text()).toBe('Details');
  });

  it('renders a <dl>', () => {
    const dl = wrapper.find('dl');
    expect(dl.exists()).toBe(true);
  });

  it('renders a <dt> with the name or key ', () => {
    let detailType = wrapper.find('dl dt.detail-type');
    expect(detailType.exists()).toBe(true);
    expect(detailType.text()).toBe('Key');

    wrapper.setProps({
      details: {
        ...propsData.details,
        titleStyle: 'symbol',
      },
    });
    detailType = wrapper.find('dl dt.detail-type');
    expect(detailType.exists()).toBe(true);
    expect(detailType.text()).toBe('Name');
  });

  it('only renders a single <dt> for type when there is no xcode title', () => {
    expect(wrapper.findAll('dl dt.detail-type').length).toBe(2);

    const {
      ideTitle,
      ...otherDetails
    } = propsData.details;
    wrapper.setProps({ details: otherDetails });

    const detailTypes = wrapper.findAll('dl dt.detail-type');
    expect(detailTypes.length).toBe(1);
    expect(detailTypes.at(0).text).not.toBe('Key');
    expect(detailTypes.at(0).text).not.toBe('Name');
  });

  it('renders a <dd> with the content related to the name or key ', () => {
    const detailContent = wrapper.find('dl dd.detail-content');
    expect(detailContent.exists()).toBe(true);
    expect(detailContent.text()).toBe(propsData.details.name);
  });

  it('renders a <dd> with the Property List Key Type ', () => {
    const pListKeyType = wrapper.find(PropertyListKeyType);
    expect(pListKeyType.exists()).toBe(true);
    expect(pListKeyType.typeOutput).toEqual(propsData.details.value.baseType);
  });
});
