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
import MobileCodePreview from 'docc-render/components/Tutorial/MobileCodePreview.vue';
import CodeListing from 'docc-render/components/ContentNode/CodeListing.vue';
import MobileCodeListing from 'docc-render/components/ContentNode/MobileCodeListing.vue';
import GenericModal from 'docc-render/components/GenericModal.vue';
import TopicStore from 'docc-render/stores/TopicStore';

describe('MobileCodePreview', () => {
  const { PreviewToggle } = MobileCodePreview.components;

  let wrapper;

  const content = ['hello ', 'world'];
  const fileName = 'helloworld.swift';
  const syntax = 'swift';
  const highlights = [{ line: 1 }, { line: 2 }, { line: 3 }];

  const references = {
    mycode: {
      content,
      fileName,
      syntax,
      highlights,
    },
  };

  const defaultSlots = {
    default: '<img src="media.jpg" />',
  };

  const store = TopicStore;

  beforeEach(() => {
    wrapper = shallowMount(MobileCodePreview, {
      propsData: {
        code: 'mycode',
      },
      provide: {
        references,
        isTargetIDE: false,
        store,
      },
      slots: defaultSlots,
    });
  });

  it('renders a MobileCodeListing', () => {
    const codeListing = wrapper.find(MobileCodeListing);
    expect(codeListing.props('content')).toBe(content);
    expect(codeListing.props('fileName')).toBe(fileName);
    expect(codeListing.props('syntax')).toBe(syntax);
    expect(codeListing.props('highlights')).toBe(highlights);
  });

  it('displays a modal to show the full code listing when the file name is clicked', () => {
    const mobileCodeListing = wrapper.find(MobileCodeListing);
    expect(mobileCodeListing.exists()).toBe(true);

    mobileCodeListing.vm.$emit('file-name-click');

    const modal = wrapper.find('.full-code-listing-modal');
    expect(modal.exists()).toBe(true);
    expect(modal.props()).toHaveProperty('isFullscreen', true);
    expect(modal.props()).toHaveProperty('visible', true);

    const listing = modal.find(CodeListing);
    expect(listing.exists()).toBe(true);
    expect(listing.classes('full-code-listing')).toBe(true);
    expect(listing.props('content')).toBe(content);
    expect(listing.props('fileName')).toBe(fileName);
    expect(listing.props('syntax')).toBe(syntax);
    expect(listing.props('highlights')).toBe(highlights);
  });

  describe('runtime previews', () => {
    const mountWithPreview = (hasPreview) => {
      const slots = hasPreview ? ({
        default: '<img src="media.jpg" />',
      }) : null;

      return shallowMount(MobileCodePreview, {
        propsData: {
          code: 'mycode',
        },
        provide: {
          references,
          isTargetIDE: false,
          store,
        },
        slots,
      });
    };

    it('renders an actionable PreviewToggle when a runtime preview is provided', () => {
      wrapper = mountWithPreview(true);

      const mobilePreviewToggle = wrapper.find(PreviewToggle);
      expect(mobilePreviewToggle.exists()).toBe(true);
      expect(mobilePreviewToggle.props('isActionable'));
    });

    it('renders a disabled PreviewToggle when a runtime preview is not provided', () => {
      wrapper = mountWithPreview(false);

      const mobilePreviewToggle = wrapper.find(PreviewToggle);
      expect(mobilePreviewToggle.exists()).toBe(true);
      expect(mobilePreviewToggle.props('isActionable')).toBe(false);
    });

    it('displays a modal to show the media preview when the toggle is clicked', () => {
      const previewToggle = wrapper.find(PreviewToggle);
      expect(previewToggle.exists()).toBe(true);

      previewToggle.vm.$emit('click');

      const modal = wrapper.findAll(GenericModal).at(1);
      expect(modal.exists()).toBe(true);
      expect(modal.props()).toHaveProperty('isFullscreen', true);
      expect(modal.props()).toHaveProperty('visible', true);
      expect(modal.contains('img')).toBe(true);

      expect(modal.find('.runtime-preview-label').text()).toBe('Preview');
    });
  });

  describe('Modal themes', () => {
    const mountWithIDETarget = isTargetIDE => (
      shallowMount(MobileCodePreview, {
        propsData: { code: 'mycode' },
        provide: { references, isTargetIDE, store },
        slots: defaultSlots,
      })
    );

    it('uses the light theme for the code listing and runtime preview modal when isTargetIDE=false', () => {
      wrapper = mountWithIDETarget(false);

      const modals = wrapper.findAll(GenericModal);

      const fullCodeListingModal = modals.at(0);
      expect(fullCodeListingModal.props('theme')).toBe('light');

      const runtimePreviewModal = modals.at(1);
      expect(runtimePreviewModal.props('theme')).toBe('light');
    });

    it('uses the code/dynamic themes for the code listing and runtime preview modal when isTargetIDE=true', () => {
      wrapper = mountWithIDETarget(true);

      const modals = wrapper.findAll(GenericModal);

      const fullCodeListingModal = modals.at(0);
      expect(fullCodeListingModal.props('theme')).toBe('code');

      const runtimePreviewModal = modals.at(1);
      expect(runtimePreviewModal.props('theme')).toBe('dynamic');
    });
  });
});
