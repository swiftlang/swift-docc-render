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
import CodePreview from 'docc-render/components/Tutorial/CodePreview.vue';
import CodeListing from 'docc-render/components/ContentNode/CodeListing.vue';
import TopicStore from 'docc-render/stores/TopicStore';
import DiagonalArrowIcon from 'theme/components/Icons/DiagonalArrowIcon.vue';

describe('CodePreview', () => {
  let wrapper;

  const content = ['hello ', 'world'];
  const fileName = 'helloworld.swift';
  const syntax = 'swift';
  const highlights = [{ line: 1 }, { line: 2 }, { line: 3 }];

  const propsData = {
    code: 'mycode',
    preview: 'mypreview',
    isRuntimePreviewVisible: true,
  };

  const references = {
    [propsData.code]: {
      content,
      fileName,
      highlights,
      syntax,
    },
    [propsData.preview]: {
      variants: [
        {
          size: {
            width: 600,
            height: 1200,
          },
        },
      ],
    },
  };

  const referencesWithVariant = variants => ({
    ...references,
    [propsData.preview]: {
      variants,
    },
  });

  const provide = topicStore => ({
    isTargetIDE: false,
    store: topicStore,
  });
  const slots = {
    default: '<p>foo</p>',
  };

  beforeEach(() => {
    TopicStore.setReferences(references);
    wrapper = shallowMount(CodePreview, {
      propsData,
      provide: provide(TopicStore),
      slots,
    });
  });

  it('renders a CodeListing', () => {
    const codeListing = wrapper.findComponent(CodeListing);
    expect(codeListing.props('content')).toBe(content);
    expect(codeListing.props('fileName')).toBe(fileName);
    expect(codeListing.props('syntax')).toBe(syntax);
    expect(codeListing.props('highlights')).toBe(highlights);
  });

  it('renders the media preview', () => {
    const runtimePreview = wrapper.findComponent('.runtime-preview p');
    expect(runtimePreview.text()).toBe('foo');
  });

  describe('with image widths > 400px', () => {
    describe('in breakpoint other than "medium"', () => {
      it('renders the media preview at 1/3 scale', () => {
        TopicStore.updateBreakpoint('large');
        let runtimePreview = wrapper.findComponent('.runtime-preview');
        expect(runtimePreview.attributes('style')).toBe('width: 200px;');

        TopicStore.updateBreakpoint('small');
        runtimePreview = wrapper.findComponent('.runtime-preview');
        expect(runtimePreview.attributes('style')).toBe('width: 200px;');
      });
    });

    describe('in "medium" breakpoint', () => {
      it('renders the preview at 80% of 1/3 scale', () => {
        TopicStore.updateBreakpoint('medium');
        const runtimePreview = wrapper.findComponent('.runtime-preview');
        expect(runtimePreview.attributes('style')).toBe('width: 160px;');
      });
    });
  });

  it('hides/shows the media preview when the hide button is clicked', async () => {
    // Because preview asset is hidden by CSS, we check if the show/hide span exists
    const hideButton = wrapper.findComponent('.header');

    expect(hideButton.attributes('title')).toBeFalsy();

    await hideButton.trigger('click');
    expect(wrapper.emitted()['runtime-preview-toggle'][0]).toEqual([false]);
    let icon = wrapper.findComponent('.preview-icon');
    expect(icon.is(DiagonalArrowIcon)).toBe(true);
    expect(icon.classes()).toContain('preview-hide');
    expect(icon.classes()).not.toContain('preview-show');

    await wrapper.setProps({ isRuntimePreviewVisible: false });

    await hideButton.trigger('click');
    expect(wrapper.emitted()['runtime-preview-toggle'][1]).toEqual([true]);

    icon = wrapper.findComponent('.preview-icon');
    expect(icon.classes()).toContain('preview-show');
    expect(icon.classes()).not.toContain('preview-hide');
  });

  it('renders an image or video with a fallback size if size is not defined or it is empty', () => {
    const variantSizeEmpty = [
      {
        url: 'video.mp4',
        traits: [
          '1x',
          'light',
        ],
        size: {},
      },
    ];

    TopicStore.updateBreakpoint('large');
    TopicStore.setReferences(referencesWithVariant(variantSizeEmpty));
    wrapper = shallowMount(CodePreview, {
      propsData,
      provide: provide(TopicStore),
      slots,
    });

    let runtimePreview = wrapper.findComponent('.runtime-preview');
    expect(runtimePreview.attributes('style')).toBe('width: 300px;');

    const variantNoSize = [
      {
        url: 'video.mp4',
        traits: [
          '1x',
          'light',
        ],
      },
    ];

    TopicStore.setReferences(referencesWithVariant(variantNoSize));
    wrapper = shallowMount(CodePreview, {
      propsData,
      provide: provide(TopicStore),
      slots,
    });

    runtimePreview = wrapper.findComponent('.runtime-preview');
    expect(runtimePreview.attributes('style')).toBe('width: 300px;');
  });

  it('renders an image or video with only a width property defined in its size', () => {
    const variantWithOnlyWidth = [
      {
        size: {
          width: 1200,
        },
      },
    ];

    TopicStore.setReferences(referencesWithVariant(variantWithOnlyWidth));
    wrapper = shallowMount(CodePreview, {
      propsData,
      provide: provide(TopicStore),
      slots,
    });

    const runtimePreview = wrapper.findComponent('.runtime-preview');
    expect(runtimePreview.attributes('style')).toBe('width: 400px;');
  });

  it('renders an image or video with only a height property defined in its size', () => {
    const variantWithOnlyHeight = [
      {
        size: {
          height: 1200,
        },
      },
    ];

    TopicStore.setReferences(referencesWithVariant(variantWithOnlyHeight));
    wrapper = shallowMount(CodePreview, {
      propsData,
      provide: provide(TopicStore),
      slots,
    });

    const runtimePreview = wrapper.findComponent('.runtime-preview');
    // no height is defined at all
    expect(runtimePreview.attributes('style')).toBeFalsy();
  });

  describe('collapsed', () => {
    const mountWithPreviewVisible = (isRuntimePreviewVisible, hasRuntimePreview = true) => (
      shallowMount(CodePreview, {
        propsData: {
          ...propsData,
          isRuntimePreviewVisible,
          preview: hasRuntimePreview ? propsData.preview : undefined,
        },
        provide: provide(TopicStore),
        slots,
      })
    );

    it('does not add the "collapsed" class if the preview is visible', () => {
      wrapper = mountWithPreviewVisible(false);
      const runtimePreview = wrapper.findComponent('.runtime-preview');
      expect(runtimePreview.classes('collapsed')).toBe(true);

      const runtimePreviewAsset = wrapper.findComponent('.runtime-preview-asset');
      expect(runtimePreviewAsset.attributes('style')).toContain('display: none');
    });

    it('does not add the "collapsed" class if there is no preview', () => {
      wrapper = mountWithPreviewVisible(false, false);
      const runtimePreview = wrapper.findComponent('.runtime-preview');
      expect(runtimePreview.classes('collapsed')).toBe(true);

      const runtimePreviewAsset = wrapper.findComponent('.runtime-preview-asset');
      expect(runtimePreviewAsset.attributes('style')).toContain('display: none');
    });

    it('adds the "collapsed" class if the preview is visible', () => {
      wrapper = mountWithPreviewVisible(true);
      const runtimePreview = wrapper.findComponent('.runtime-preview');
      expect(runtimePreview.classes('collapsed')).toBe(false);

      const runtimePreviewAsset = wrapper.findComponent('.runtime-preview-asset');
      expect(runtimePreviewAsset.attributes('style')).toBeFalsy();
    });

    it('renders the collapsed preview button at proper dimensions', () => {
      wrapper = mountWithPreviewVisible(false);
      const runtimePreview = wrapper.findComponent('.runtime-preview');
      expect(runtimePreview.attributes('style')).toBe('width: 102px;');
    });
  });

  describe('with image widths <= 400px', () => {
    beforeEach(() => {
      const variantSmallImage = [
        {
          size: {
            width: 350,
            height: 700,
          },
        },
      ];

      TopicStore.setReferences(referencesWithVariant(variantSmallImage));
      wrapper = shallowMount(CodePreview, {
        propsData,
        provide: provide(TopicStore),
        slots,
      });
    });

    describe('in breakpoint other than "medium"', () => {
      it('renders the preview at 1/1.75 scale', () => {
        TopicStore.updateBreakpoint('large');
        let runtimePreview = wrapper.findComponent('.runtime-preview');
        expect(runtimePreview.attributes('style')).toBe('width: 200px;');

        TopicStore.updateBreakpoint('small');
        runtimePreview = wrapper.findComponent('.runtime-preview');
        expect(runtimePreview.attributes('style')).toBe('width: 200px;');
      });
    });

    describe('in "medium" breakpoint', () => {
      it('renders the preview at 80% of 1/1.75 scale', () => {
        TopicStore.updateBreakpoint('medium');
        const runtimePreview = wrapper.findComponent('.runtime-preview');
        expect(runtimePreview.attributes('style')).toBe('width: 160px;');
      });
    });
  });

  describe('with `isTargetIDE`', () => {
    beforeEach(() => {
      TopicStore.setReferences(references);
      wrapper = shallowMount(CodePreview, {
        propsData,
        provide: {
          ...provide(TopicStore),
          isTargetIDE: true,
        },
        slots,
      });
    });

    it('adds the "runtime-preview-ide" class to the runtime preview', () => {
      expect(wrapper.find('.runtime-preview.runtime-preview-ide').exists()).toBe(true);
    });
  });

  describe('without a runtime preview', () => {
    beforeEach(async () => {
      await wrapper.setProps({ preview: undefined });
    });

    it('renders the preview with a disabled state', () => {
      const preview = wrapper.findComponent('.runtime-preview');
      expect(preview.classes('disabled')).toBe(true);
      expect(preview.attributes('style')).toBe('width: 102px;');

      const button = preview.find('button');
      expect(button.attributes('disabled')).toBe('disabled');
      expect(button.attributes('title')).toBe('tutorials.preview.no-preview-available-step');

      expect(wrapper.find('.preview-hide').exists()).toBe(false);
      expect(wrapper.find('.preview-show').exists()).toBe(true);
    });

    it('does not emit `runtime-preview-toggle` events', () => {
      const button = wrapper.findComponent('button');
      button.trigger('click');
      expect(wrapper.emitted()['runtime-preview-toggle']).toBeUndefined();
    });
  });
});
