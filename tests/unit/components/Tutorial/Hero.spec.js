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
import Hero from 'docc-render/components/Tutorial/Hero.vue';
import Headline from 'docc-render/components/Headline.vue';
import HeroMetadata from 'docc-render/components/Tutorial/HeroMetadata.vue';
import Asset from 'docc-render/components/Asset.vue';
import GenericModal from 'docc-render/components/GenericModal.vue';

const mountWithProps = (props, references = {}, others) => {
  const defaultProps = {
    backgroundImage: 'defaultBackground',
    title: 'defaultTitle',
    subtitle: 'defaultSubtitle',
    projectFiles: 'defaultProjectFiles',
    estimatedTimeInMinutes: 10,
    video: 'defaultVideo',
  };

  const defaultReferences = {
    defaultBackground: {
      variants: [
        {
          url: 'defaultBackgroundUrlDark',
          traits: ['2x', 'dark'],
        },
        {
          url: 'defaultBackgroundUrlLight',
          traits: ['2x', 'light'],
        },
      ],
    },
    defaultProjectFiles: {
      url: 'defaultProjectFilesUrl',
    },
  };

  return shallowMount(Hero, {
    propsData: {
      ...defaultProps,
      ...props,
    },
    provide: {
      references: {
        ...defaultReferences,
        ...references,
      },
    },
    ...others,
  });
};

describe('Hero', () => {
  it('renders a headline with the correct title', () => {
    const title = 'mytitle';
    const wrapper = mountWithProps({
      title,
    });

    const headline = wrapper.find(Headline);
    expect(headline.text()).toBe(title);
  });

  it('renders an eyebrow with the correct title', () => {
    const chapter = 'myChapter';
    const wrapper = mountWithProps({
      chapter,
    });

    const headline = wrapper.find(Headline);
    expect(headline.text()).toContain(chapter);
  });

  it('renders metadata with the correct information', () => {
    const estimatedTimeInMinutes = 10;
    const projectFiles = 'myProjectFiles';
    const projectFilesUrl = 'myProjectFiles.zip';

    const xcodeRequirementIdentifier = 'xcode';
    const xcodeRequirementReference = {
      title: xcodeRequirementIdentifier,
      url: 'url',
    };

    const references = {
      [projectFiles]: { url: projectFilesUrl },
      [xcodeRequirementIdentifier]: xcodeRequirementReference,
    };

    const wrapper = mountWithProps({
      projectFiles,
      xcodeRequirement: xcodeRequirementIdentifier,
      estimatedTimeInMinutes,
    }, references);

    const metadata = wrapper.find(HeroMetadata);
    expect(metadata.props('estimatedTimeInMinutes')).toBe(estimatedTimeInMinutes);
    expect(metadata.props('projectFilesUrl')).toBe(projectFilesUrl);
    expect(metadata.props('xcodeRequirement')).toEqual(xcodeRequirementReference);
  });

  it('renders a div for the background and selects the light variant', () => {
    const wrapper = mountWithProps();

    const bg = wrapper.find('div.bg');
    expect(bg.exists()).toBe(true);
    expect(wrapper.vm.bgStyle).toEqual({
      backgroundImage: 'url(\'defaultBackgroundUrlLight\')',
    });
  });

  it('displays the call-to-action modal when the link is clicked', () => {
    const wrapper = mountWithProps();
    const link = wrapper.find('a.call-to-action');
    expect(wrapper.find(Asset).isVisible()).toBe(false);
    link.trigger('click');
    expect(wrapper.find(Asset).isVisible()).toBe(true);
    const modal = wrapper.find(GenericModal);
    expect(modal.props()).toHaveProperty('visible', true);
  });

  it('exposes a `above-title` slot', () => {
    const wrapper = mountWithProps({
      title: 'Title',
    }, {}, {
      slots: {
        'above-title': 'Above Title Content',
      },
    });
    expect(wrapper.text()).toContain('Above Title Content');
  });

  describe('video modal dismissed', () => {
    let pauseMock;
    let wrapper;

    beforeEach(() => {
      pauseMock = jest.fn();
      wrapper = mountWithProps();
    });

    const withPlayReturning = (returnValue, testFunction) => {
      const { querySelector } = global.Element.prototype;

      global.Element.prototype.querySelector = () => ({
        play() {
          return returnValue;
        },
        pause() {
          pauseMock();
        },
      });

      testFunction();

      global.Element.prototype.querySelector = querySelector;
    };

    it('does not pause if play returned undefined', (done) => {
      withPlayReturning(undefined, async () => {
        const link = wrapper.find('a.call-to-action');
        link.trigger('click');
        expect(wrapper.find(Asset).isVisible()).toBe(true);

        const asset = wrapper.find(Asset);
        asset.vm.$emit('videoEnded');

        // Wait for the `playPromise.then` to be executed.
        await wrapper.vm.$nextTick();

        expect(pauseMock).not.toHaveBeenCalled();

        done();
      });
    });
  });
});
