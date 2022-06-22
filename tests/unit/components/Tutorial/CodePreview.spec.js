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
  const provide = {
    isTargetIDE: false,
    references: {
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
    },
    store: TopicStore,
  };
  const slots = {
    default: '<p>foo</p>',
  };

  const mountWithVariant = variants => (
    shallowMount(CodePreview, {
      propsData,
      provide: {
        ...provide,
        references: {
          ...provide.references,
          [propsData.preview]: {
            variants,
          },
        },
      },
      slots,
    })
  );

  beforeEach(() => {
    TopicStore.reset();
    wrapper = shallowMount(CodePreview, {
      propsData,
      provide,
      slots,
    });
  });

  it('renders a CodeListing', () => {
    const codeListing = wrapper.find(CodeListing);
    expect(codeListing.props('content')).toBe(content);
    expect(codeListing.props('fileName')).toBe(fileName);
    expect(codeListing.props('syntax')).toBe(syntax);
    expect(codeListing.props('highlights')).toBe(highlights);
  });

  it('renders the media preview', () => {
    const runtimePreview = wrapper.find('.runtime-preview p');
    expect(runtimePreview.text()).toBe('foo');
  });

  describe('with image widths > 400px', () => {
    describe('in breakpoint other than "medium"', () => {
      it('renders the media preview at 1/3 scale', () => {
        TopicStore.updateBreakpoint('large');
        let runtimePreview = wrapper.find('.runtime-preview');
        expect(runtimePreview.attributes('style')).toBe('width: 200px;');

        TopicStore.updateBreakpoint('small');
        runtimePreview = wrapper.find('.runtime-preview');
        expect(runtimePreview.attributes('style')).toBe('width: 200px;');
      });
    });

    describe('in "medium" breakpoint', () => {
      it('renders the preview at 80% of 1/3 scale', () => {
        TopicStore.updateBreakpoint('medium');
        const runtimePreview = wrapper.find('.runtime-preview');
        expect(runtimePreview.attributes('style')).toBe('width: 160px;');
      });
    });
  });

  it('hides/shows the media preview when the hide button is clicked', () => {
    // Because preview asset is hidden by CSS, we check if the show/hide span exists
    const hideButton = wrapper.find('.header');

    expect(hideButton.attributes('title')).toBeFalsy();

    hideButton.trigger('click');
    expect(wrapper.emitted()['runtime-preview-toggle'][0]).toEqual([false]);
    let icon = wrapper.find('.preview-icon');
    expect(icon.is(DiagonalArrowIcon)).toBe(true);
    expect(icon.classes()).toContain('preview-hide');
    expect(icon.classes()).not.toContain('preview-show');

    wrapper.setProps({ isRuntimePreviewVisible: false });

    hideButton.trigger('click');
    expect(wrapper.emitted()['runtime-preview-toggle'][1]).toEqual([true]);

    icon = wrapper.find('.preview-icon');
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

    wrapper = mountWithVariant(variantSizeEmpty);

    let runtimePreview = wrapper.find('.runtime-preview');
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

    wrapper = mountWithVariant(variantNoSize);

    runtimePreview = wrapper.find('.runtime-preview');
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

    wrapper = mountWithVariant(variantWithOnlyWidth);

    const runtimePreview = wrapper.find('.runtime-preview');
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

    wrapper = mountWithVariant(variantWithOnlyHeight);

    const runtimePreview = wrapper.find('.runtime-preview');
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
        provide,
        slots,
      })
    );

    it('does not add the "collapsed" class if the preview is visible', () => {
      wrapper = mountWithPreviewVisible(false);
      const runtimePreview = wrapper.find('.runtime-preview');
      expect(runtimePreview.classes('collapsed')).toBe(true);

      const runtimePreviewAsset = wrapper.find('.runtime-preview-asset');
      expect(runtimePreviewAsset.attributes('style')).toContain('display: none');
    });

    it('does not add the "collapsed" class if there is no preview', () => {
      wrapper = mountWithPreviewVisible(false, false);
      const runtimePreview = wrapper.find('.runtime-preview');
      expect(runtimePreview.classes('collapsed')).toBe(true);

      const runtimePreviewAsset = wrapper.find('.runtime-preview-asset');
      expect(runtimePreviewAsset.attributes('style')).toContain('display: none');
    });

    it('adds the "collapsed" class if the preview is visible', () => {
      wrapper = mountWithPreviewVisible(true);
      const runtimePreview = wrapper.find('.runtime-preview');
      expect(runtimePreview.classes('collapsed')).toBe(false);

      const runtimePreviewAsset = wrapper.find('.runtime-preview-asset');
      expect(runtimePreviewAsset.attributes('style')).toBeFalsy();
    });

    it('renders the collapsed preview button at proper dimensions', () => {
      wrapper = mountWithPreviewVisible(false);
      const runtimePreview = wrapper.find('.runtime-preview');
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

      wrapper = mountWithVariant(variantSmallImage);
    });

    describe('in breakpoint other than "medium"', () => {
      it('renders the preview at 1/1.75 scale', () => {
        TopicStore.updateBreakpoint('large');
        let runtimePreview = wrapper.find('.runtime-preview');
        expect(runtimePreview.attributes('style')).toBe('width: 200px;');

        TopicStore.updateBreakpoint('small');
        runtimePreview = wrapper.find('.runtime-preview');
        expect(runtimePreview.attributes('style')).toBe('width: 200px;');
      });
    });

    describe('in "medium" breakpoint', () => {
      it('renders the preview at 80% of 1/1.75 scale', () => {
        TopicStore.updateBreakpoint('medium');
        const runtimePreview = wrapper.find('.runtime-preview');
        expect(runtimePreview.attributes('style')).toBe('width: 160px;');
      });
    });
  });

  describe('with `isTargetIDE`', () => {
    beforeEach(() => {
      wrapper = shallowMount(CodePreview, {
        propsData,
        provide: {
          ...provide,
          isTargetIDE: true,
        },
        slots,
      });
    });

    it('adds the "runtime-preview-ide" class to the runtime preview', () => {
      expect(wrapper.contains('.runtime-preview.runtime-preview-ide')).toBe(true);
    });
  });

  describe('without a runtime preview', () => {
    beforeEach(() => {
      wrapper.setProps({ preview: undefined });
    });

    it('renders the preview with a disabled state', () => {
      const preview = wrapper.find('.runtime-preview');
      expect(preview.classes('disabled')).toBe(true);
      expect(preview.attributes('style')).toBe('width: 102px;');

      const button = preview.find('button');
      expect(button.attributes('disabled')).toBe('disabled');
      expect(button.attributes('title')).toBe('No preview available for this step.');

      expect(wrapper.contains('.preview-hide')).toBe(false);
      expect(wrapper.contains('.preview-show')).toBe(true);
    });

    it('does not emit `runtime-preview-toggle` events', () => {
      const button = wrapper.find('button');
      button.trigger('click');
      expect(wrapper.emitted()['runtime-preview-toggle']).toBeUndefined();
    });
  });
});
