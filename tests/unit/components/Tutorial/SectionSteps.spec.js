/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import {
  config, mount, shallowMount, TransitionStub,
} from '@vue/test-utils';
import ContentNode from 'docc-render/components/ContentNode.vue';
import Step from 'docc-render/components/Tutorial/Step.vue';
import SectionSteps from 'docc-render/components/Tutorial/SectionSteps.vue';
import Asset from 'docc-render/components/Asset.vue';
import CodePreview from 'docc-render/components/Tutorial/CodePreview.vue';
import BackgroundTheme from 'docc-render/components/Tutorial/BackgroundTheme.vue';
import TopicStore from 'docc-render/stores/TopicStore';

// mock out the intersection observer
jest.mock('docc-render/mixins/onIntersect', () => ({
  constants: {
    IntersectionDirections: {
      up: 'up',
      down: 'down',
    },
  },
}));
jest.mock('docc-render/utils/loading', () => ({ waitFrames: jest.fn() }));

const onIntersect = jest.requireActual('docc-render/mixins/onIntersect');
const { constants: { IntersectionDirections } } = onIntersect.default;
const { IntersectionMargins } = SectionSteps.constants;

describe('SectionSteps', () => {
  let wrapper;

  const target = val => ({ getAttribute: () => val });

  const createParagraph = text => ({
    type: 'paragraph',
    inlineContent: [
      {
        type: 'text',
        text,
      },
    ],
  });

  const createStep = content => ({
    type: 'step',
    content,
  });

  const exampleParagraph = createParagraph('example');

  const exampleStepWithMedia = {
    ...createStep([createParagraph('example media step')]),
    media: 'media.jpg',
  };

  const exampleStepWithCode = {
    ...createStep([createParagraph('example code step')]),
    code: 'code.swift',
    runtimePreview: 'preview.jpg',
  };

  const exampleStepWithCodeNoRuntimePreview = {
    ...createStep([createParagraph('example code step')]),
    code: 'code2.swift',
    runtimePreview: null,
  };

  const exampleStepWithNoMediaNorCode = {
    ...createStep([createParagraph('example step with no media nor code')]),
    media: null,
    code: null,
    runtimePreview: null,
  };

  const exampleStepWithVideo = {
    ...createStep([createParagraph('last step with video')]),
    media: 'video.m3u8',
  };

  const propsData = {
    content: [
      exampleParagraph,
      exampleStepWithMedia,
      exampleStepWithCode,
      exampleStepWithCodeNoRuntimePreview,
      exampleStepWithNoMediaNorCode,
      exampleStepWithVideo,
    ],
    sectionNumber: 2,
  };

  beforeEach(() => {
    // Disable Vue's default behavior of stubbing the <transition> components
    // in tests to work around the bug reported here:
    // https://github.com/vuejs/vue/issues/9822
    config.stubs.transition = false;

    TopicStore.updateBreakpoint('medium');

    wrapper = shallowMount(SectionSteps, {
      propsData,
      provide: {
        isTargetIDE: false,
        store: TopicStore,
      },
    });
  });

  afterEach(() => {
    // Re-enable Vue's default behavior of stubbing <transition> components
    config.stubs.transition = TransitionStub;

    TopicStore.reset();
  });

  it('renders a div.steps with a .content-container and .asset-container', () => {
    expect(wrapper.is('div.steps')).toBe(true);
    expect(wrapper.contains('div.content-container')).toBe(true);

    const backgroundTheme = wrapper.find(BackgroundTheme);
    expect(backgroundTheme.exists()).toBe(true);
    expect(backgroundTheme.classes('asset-container')).toBe(true);
  });

  it('renders a `ContentNode` for a non-"step" node', () => {
    const node = wrapper.find(ContentNode);
    expect(node.exists()).toBe(true);
    expect(node.props('content')).toEqual([exampleParagraph]);
  });

  it('renders a `Step` for "step" nodes', () => {
    const steps = wrapper.findAll(Step);
    expect(steps.length).toBe(5);

    let step = steps.at(0);
    expect(step.props('content')).toBe(exampleStepWithMedia.content);
    expect(step.props('media')).toBe(exampleStepWithMedia.media);
    expect(step.props('currentIndex')).toBe(1);

    step = steps.at(1);
    expect(step.props('code')).toBe(exampleStepWithCode.code);
    expect(step.props('content')).toBe(exampleStepWithCode.content);
    expect(step.props('runtimePreview')).toBe(exampleStepWithCode.runtimePreview);
    expect(step.props('currentIndex')).toBe(1);
  });

  it('defines an `intersectionMargin` for the entire screen, minus the `nav`', () => {
    expect(wrapper.vm.intersectionRootMargin).toEqual(IntersectionMargins);
  });

  it('by default, assigns the first step section index as active', () => {
    // assert the active step is the second element in the content, which is the first step
    expect(wrapper.vm.activeStep).toBe(1);
    const nodes = wrapper.findAll({ ref: 'contentNodes' });
    // the first node is not a step
    expect(nodes.at(0).props()).not.toHaveProperty('currentIndex');
    // second node gets the current index
    expect(nodes.at(1).props()).toHaveProperty('currentIndex', 1);
  });

  it('provides a custom array of intersectionTargets, with each content node step', async () => {
    // do a full mount, to assert correct intersection targets
    wrapper = mount(SectionSteps, {
      propsData,
      provide: {
        isTargetIDE: false,
        store: TopicStore,
        isClientMobile: false,
        references: {},
      },
      stubs: {
        Asset: true,
        CodeListing: true,
        MobileCodeListing: true,
        GenericModal: true,
      },
    });
    await wrapper.vm.$nextTick();
    const intersectionTargets = wrapper.vm.getIntersectionTargets();
    expect(intersectionTargets).toHaveLength(5);
    expect(intersectionTargets[0].getAttribute('data-index')).toBe('1');
    expect(intersectionTargets[1].getAttribute('data-index')).toBe('2');
    expect(intersectionTargets[2].getAttribute('data-index')).toBe('3');
    expect(intersectionTargets[3].getAttribute('data-index')).toBe('4');
    expect(intersectionTargets[4].getAttribute('data-index')).toBe('5');
    expect(intersectionTargets.every(el => el.classList.contains('step'))).toBe(true);
  });

  it('on mount, finds the closest step and assigns it as an active one.', async () => {
    wrapper.destroy();
    const getBoundingClientRect = jest.fn();
    window.HTMLElement.prototype.getBoundingClientRect = getBoundingClientRect;
    getBoundingClientRect.mockReturnValue({ top: 500, bottom: 700 });
    getBoundingClientRect.mockReturnValueOnce({ top: 20, bottom: 100 });
    // closest one to 1/3 breakpoint (768*0,333 = 255px)
    getBoundingClientRect.mockReturnValueOnce({ top: 300, bottom: 400 });
    getBoundingClientRect.mockReturnValueOnce({ top: 400, bottom: 500 });
    wrapper = mount(SectionSteps, {
      propsData,
      provide: {
        isTargetIDE: false,
        store: TopicStore,
        isClientMobile: false,
        references: {},
      },
      stubs: {
        Asset: true,
        CodeListing: true,
        MobileCodeListing: true,
        GenericModal: true,
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.activeStep).toBe(2);
  });

  describe('intersection', () => {
    // simulate a few targets
    const target1 = target(1);
    const target2 = target(2);

    it('updates the active element, on each intersection change', async () => {
      // simulate intersection. Target 1 is most visible
      wrapper.vm.onIntersect({ target: target1, isIntersecting: true });
      expect(wrapper.vm.activeStep).toBe(1);
      // target 2 is less visible than 1
      wrapper.vm.onIntersect({ target: target2, isIntersecting: true });
      expect(wrapper.vm.activeStep).toBe(2);
    });

    describe('entering a section from the bottom', () => {
      let playMock;

      beforeEach(() => {
        playMock = jest.fn(() => new Promise(jest.fn));
        window.HTMLMediaElement.prototype.play = playMock;
      });

      it('if the last step has a video, plays the last step video from the beginning', async () => {
        wrapper = shallowMount(SectionSteps, {
          // simulate scrolling down
          data: () => ({ intersectionScrollDirection: IntersectionDirections.down }),
          propsData,
          provide: {
            isTargetIDE: false,
            store: TopicStore,
          },
          stubs: {
            Asset: {
              template: '<div><video/></div>',
            },
          },
        });
        // simulate step is visible
        wrapper.vm.onIntersect({ target: target(5), isIntersecting: true });
        // assert the mock is called
        expect(playMock).toHaveBeenCalledTimes(1);
      });

      const assertNotPlaying = async (key) => {
        // intersect only the element
        wrapper.vm.onIntersect({ target: target(key), isIntersecting: true });
        expect(playMock).not.toHaveBeenCalled();
      };

      it('if the last step does not have a video, does not play any video', async () => {
        wrapper = shallowMount(SectionSteps, {
          data: () => ({ intersectionScrollDirection: IntersectionDirections.down }),
          propsData: {
            ...propsData,
            content: [
              exampleParagraph,
              exampleStepWithMedia,
            ],
          },
          provide: {
            isTargetIDE: false,
            store: TopicStore,
          },
          stubs: {
            GenericModal: true,
            Asset: {
              template: '<div><img/></div>',
            },
          },
        });
        // Last step is code.
        await assertNotPlaying(1);
        // Last step has an image asset.
        wrapper.setProps({
          content: [
            exampleParagraph,
            exampleStepWithMedia,
          ],
        });
        await assertNotPlaying(1);
        // Last step has no asset nor code.
        wrapper.setProps({
          content: [
            exampleParagraph,
            exampleStepWithNoMediaNorCode,
          ],
        });
        await assertNotPlaying(1);
      });
    });
  });

  describe('when a media step is active', () => {
    const key = 1;

    beforeEach(() => {
      wrapper.vm.onIntersect({ target: target(key), intersectionRatio: 0.7 });
    });

    it('renders the media', () => {
      const container = wrapper.find('.asset-container');

      const asset = container.find(Asset);
      expect(asset.exists()).toBe(true);
      expect(asset.props('identifier')).toBe(exampleStepWithMedia.media);
      expect(asset.props('showsReplayButton')).toBe(true);
      expect(asset.props('showsVideoControls')).toBe(false);
    });
  });

  describe('when a code step is active', () => {
    const key = 2;

    beforeEach(() => {
      wrapper.vm.onIntersect({ target: target(key), isIntersecting: true });
    });

    it('renders the code with the preview', () => {
      const container = wrapper.find('.asset-container');

      const preview = container.find(CodePreview);
      expect(preview.exists()).toBe(true);
      expect(preview.props('code')).toBe(exampleStepWithCode.code);

      const asset = preview.find(Asset);
      expect(asset.exists()).toBe(true);
      expect(asset.props('identifier')).toBe(exampleStepWithCode.runtimePreview);
    });
  });

  describe('when a code step with no runtime preview is active', () => {
    const key = 3;

    beforeEach(() => {
      wrapper.vm.onIntersect({ target: target(key), isIntersecting: true });
    });

    it('renders the code preview without the runtime preview', () => {
      const container = wrapper.find('.asset-container');

      const preview = container.find(CodePreview);
      expect(preview.exists()).toBe(true);
      expect(preview.props('code')).toBe(exampleStepWithCodeNoRuntimePreview.code);

      const asset = wrapper.find(Asset);
      expect(asset.exists()).toBe(false);
    });
  });

  describe('when a code step with no media nor code is active', () => {
    const key = 4;

    beforeEach(() => {
      wrapper.vm.onIntersect({ target: target(key), isIntersecting: true });
    });

    it('renders the code with the preview', () => {
      const container = wrapper.find('.asset-container');

      const asset = container.find(Asset);
      expect(asset.exists()).toBe(false);

      const codePreview = container.find(CodePreview);
      expect(codePreview.exists()).toBe(false);
    });
  });

  describe('when a `CodePreview` emits a "runtime-preview-toggle" event', () => {
    const key = 2;

    beforeEach(() => {
      wrapper.vm.onIntersect({ target: target(key), isIntersecting: true });
      wrapper.find(CodePreview).vm.$emit('runtime-preview-toggle', false);
    });

    it('emits the event as well with the same value', () => {
      expect(wrapper.emitted('runtime-preview-toggle')[0]).toEqual([false]);
    });
  });

  describe('with isTargetIDE', () => {
    beforeEach(() => {
      wrapper = shallowMount(SectionSteps, {
        propsData,
        provide: {
          isTargetIDE: true,
          store: TopicStore,
        },
      });
    });

    it('adds the "ide" class to the asset container', () => {
      expect(wrapper.contains('.asset-container.ide')).toBe(true);
    });
  });

  describe('sections with no steps', () => {
    beforeEach(() => {
      wrapper = shallowMount(SectionSteps, {
        propsData: {
          content: [
            exampleParagraph,
          ],
          sectionNumber: 3,
        },
        provide: {
          isTargetIDE: false,
          store: TopicStore,
        },
      });
    });

    it('still displays non-step content', () => {
      const node = wrapper.find(ContentNode);
      expect(node.exists()).toBe(true);
      expect(node.props('content')).toEqual([exampleParagraph]);
    });
  });

  describe('small breakpoint', () => {
    beforeEach(() => {
      TopicStore.updateBreakpoint('small');

      wrapper = shallowMount(SectionSteps, {
        propsData,
        provide: {
          isTargetIDE: false,
          store: TopicStore,
        },
      });
    });

    afterEach(() => {
      TopicStore.reset();
    });

    it('does not render an asset container in S', () => {
      expect(wrapper.find('.asset-container').exists()).toBe(false);
    });
  });
});
