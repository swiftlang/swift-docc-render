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
import HeroMetadata from 'docc-render/components/Tutorial/HeroMetadata.vue';

const i18nStub = {
  name: 'i18n',
  template: '<div><slot name="number"/><slot name="minutes"/></div>',
};

const mountWithProps = props => shallowMount(HeroMetadata, {
  propsData: props,
  stubs: { i18n: i18nStub },
  provide: { isTargetIDE: false },
});

describe('HeroMetadata', () => {
  const {
    DownloadIcon,
    XcodeIcon,
  } = HeroMetadata.components;

  it('renders a div.metadata wrapper', () => {
    const wrapper = mountWithProps();

    const content = wrapper.find('div.metadata');
    expect(content.exists()).toBe(true);
  });

  it('does not render any items if there are no props', () => {
    const wrapper = mountWithProps({});

    const item = wrapper.find('div.metadata div.item');
    expect(item.exists()).toBe(false);
  });

  it('renders projectFilesUrl if present', () => {
    const projectFilesUrl = 'myProjectFiles.zip';

    const wrapper = mountWithProps({
      projectFilesUrl,
    });

    expect(wrapper.contains(DownloadIcon)).toBe(true);

    const anchor = wrapper.find('div.metadata div.item div.content a.project-download');
    expect(anchor.attributes('href')).toBe(projectFilesUrl);
  });

  it('renders estimatedTimeInMinutes if present', () => {
    const estimatedTimeInMinutes = 20;

    const wrapper = mountWithProps({
      estimatedTimeInMinutes,
    });

    const durationDiv = wrapper.find('div.metadata div.item div.content div.duration');
    expect(durationDiv.exists()).toBe(true);
    expect(durationDiv.text()).toMatch(new RegExp(`${estimatedTimeInMinutes}\\s*tutorials\\.time\\.minutes\\.short`));
  });

  it('renders requirements icon if requirements present', () => {
    const wrapper = mountWithProps({
      xcodeRequirement: {
        url: 'url',
        title: 'xcode',
      },
    });
    expect(wrapper.contains(XcodeIcon)).toBe(true);
  });

  it('does not render requirements icon if there are no requirements', () => {
    const wrapper = mountWithProps({});
    expect(wrapper.contains(XcodeIcon)).toBe(false);
  });

  it('renders metadata in the expected order: [time]|[files]|[xcode]', () => {
    const wrapper = mountWithProps({
      projectFilesUrl: 'foo.bar',
      estimatedTimeInMinutes: 42,
      xcodeRequirement: {
        title: 'Xcode',
      },
    });

    const items = wrapper.findAll('.item');
    expect(items.length).toBe(3);

    expect(items.at(0).text())
      .toEqual(expect.stringContaining('tutorials.estimated-time'));
    expect(items.at(1).text())
      .toEqual(expect.stringContaining('tutorials.project-files'));
    expect(items.at(2).text())
      .toEqual(expect.stringContaining('Xcode'));
  });

  it('renders non-link text for the xcode requirement with `isTargetIDE`', () => {
    const wrapper = shallowMount(HeroMetadata, {
      propsData: {
        xcodeRequirement: {
          url: 'https://developer.apple.com',
          title: 'Xcode',
        },
      },
      stubs: { i18n: i18nStub },
      provide: { isTargetIDE: true },
    });

    expect(wrapper.contains(XcodeIcon)).toBe(true);

    const items = wrapper.findAll('.item');
    const item = items.at(items.length - 1);
    expect(item.contains('a')).toBe(false);

    const span = item.find('span');
    expect(span.exists()).toBe(true);
    expect(span.text()).toBe('Xcode');
  });
});
