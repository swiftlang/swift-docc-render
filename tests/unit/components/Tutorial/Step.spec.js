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
import Step from 'docc-render/components/Tutorial/Step.vue';

import TopicStore from 'docc-render/stores/TopicStore';

const {
  Asset,
  MobileCodePreview,
  ContentNode,
} = Step.components;

const paragraph = text => ({
  type: 'paragraph',
  inlineContent: [
    {
      type: 'text',
      text,
    },
  ],
});

describe('Step', () => {
  let wrapper;

  const stepNumber = 1;
  const sectionNumber = 1;
  const numberOfSteps = 5;
  const isTargetIDE = false;
  const currentIndex = 1;

  const defaultProps = {
    currentIndex,
    stepNumber,
    numberOfSteps,
    sectionNumber,
  };

  const provide = {
    isTargetIDE,
    isClientMobile: false,
    store: TopicStore,
  };

  describe('default', () => {
    const content = [paragraph('foo')];

    beforeEach(() => {
      TopicStore.updateBreakpoint('medium');
      wrapper = shallowMount(Step, {
        propsData: {
          ...defaultProps,
          content,
          numberOfSteps,
          index: 0,
        },
        provide,
      });
    });

    afterEach(() => {
      TopicStore.reset();
    });

    it('renders a div.step-container', () => {
      expect(wrapper.is('div.step-container')).toBe(true);
    });

    it('adds a `focused` class if `isActive`', () => {
      expect(wrapper.find('.step').classes()).not.toContain('focused');
      wrapper.setProps({ currentIndex: 0 });
      expect(wrapper.find('.step').classes()).toContain('focused');
    });

    it('adds a data-index property to the `step`', () => {
      wrapper.setProps({ index: 1 });
      expect(wrapper.find('.step').attributes('data-index')).toBe('1');
    });

    it('renders a div.step with a `ContentNode`', () => {
      const step = wrapper.find('div.step');
      expect(step.classes('focused')).toBe(false);

      const node = step.find(ContentNode);
      expect(node.props('content')).toEqual(content);
    });

    it('does not render the mobile layout on non-S breakpoints in IDE mode', () => {
      wrapper = shallowMount(Step, {
        propsData: {
          ...defaultProps,
          content,
          numberOfSteps,
          index: 0,
        },
        provide: {
          ...provide,
          isTargetIDE: true,
        },
      });
      expect(wrapper.contains('div.media-container')).toBe(false);
    });

    it('renders the mobile layout on non-S breakpoints in Web mode', () => {
      expect(wrapper.contains('div.media-container')).toBe(true);
    });

    describe('with a caption', () => {
      const caption = [paragraph('bar')];

      beforeEach(() => {
        wrapper.setProps({ caption });
      });

      it('renders a `ContentNode` for the caption', () => {
        const nodes = wrapper.findAll(ContentNode);
        expect(nodes.length).toBe(2);

        const captionNode = nodes.at(1);
        expect(captionNode.props('content')).toEqual(caption);
        expect(captionNode.classes('caption')).toBe(true);
      });
    });
  });

  describe('small breakpoint', () => {
    beforeEach(() => {
      TopicStore.updateBreakpoint('small');
    });

    afterEach(() => {
      TopicStore.reset();
    });

    it('renders a div.media-container', () => {
      wrapper = shallowMount(Step, {
        propsData: {
          ...defaultProps,
          content: [],
          numberOfSteps,
          index: 0,
        },
        provide: {
          ...provide,
          isTargetIDE: true,
        },
      });
      expect(wrapper.contains('div.media-container')).toBe(true);
    });

    describe('with media', () => {
      const mountWithMobileClient = isClientMobile => (
        shallowMount(Step, {
          propsData: {
            ...defaultProps,
            content: [paragraph('foobar')],
            media: 'media.jpg',
            index: 0,
          },
          provide: {
            ...provide,
            isClientMobile,
            isTargetIDE: true,
          },
        })
      );

      it('when using a mobile client, it renders an `Asset` with `showsVideoControls=true`', () => {
        wrapper = mountWithMobileClient(true);

        const mediaContainer = wrapper.find('.media-container');
        const asset = mediaContainer.find(Asset);
        expect(asset.exists()).toBe(true);
        expect(asset.props('identifier')).toBe('media.jpg');
        expect(asset.props('showsVideoControls')).toBe(true);
        expect(asset.props('showsReplayButton')).toBe(false);
        expect(asset.props('videoAutoplays')).toBe(false);
      });

      it('when using a desktop client, it renders an `Asset` with `showsVideoControls=false`', () => {
        wrapper = mountWithMobileClient(false);

        const mediaContainer = wrapper.find('.media-container');
        const asset = mediaContainer.find(Asset);
        expect(asset.exists()).toBe(true);
        expect(asset.props('identifier')).toBe('media.jpg');
        expect(asset.props('showsVideoControls')).toBe(false);
        expect(asset.props('showsReplayButton')).toBe(true);
        expect(asset.props('videoAutoplays')).toBe(true);
      });
    });

    describe('with code', () => {
      let mediaContainer;

      beforeEach(() => {
        wrapper = shallowMount(Step, {
          propsData: {
            ...defaultProps,
            code: 'test.swift',
            content: [paragraph('foobar')],
            runtimePreview: 'preview.jpg',
            index: 0,
          },
          provide: {
            ...provide,
            isTargetIDE: true,
          },
        });
        mediaContainer = wrapper.find('.media-container');
      });

      it('renders a `MobileCodePreview`', () => {
        const preview = mediaContainer.find(MobileCodePreview);
        expect(preview.exists()).toBe(true);
        expect(preview.props('code')).toBe('test.swift');

        const asset = preview.find(Asset);
        expect(asset.exists()).toBe(true);
        expect(asset.props('identifier')).toBe('preview.jpg');
      });
    });
  });
});
