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
import Asset from 'docc-render/components/Asset.vue';
import ImageAsset from 'docc-render/components/ImageAsset.vue';
import VideoAsset from 'docc-render/components/VideoAsset.vue';
import ReplayableVideoAsset from 'docc-render/components/ReplayableVideoAsset.vue';

describe('Asset', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
      })),
    });
  });

  const mountAsset = (identifier, references = {}) => (
    shallowMount(Asset, {
      propsData: { identifier },
      provide: { references },
    })
  );

  it('renders a div.asset', () => {
    const wrapper = mountAsset('foo.bar');
    expect(wrapper.is('div.asset')).toBe(true);
    expect(wrapper.isEmpty()).toBe(true);
  });

  it('renders an `ImageAsset` for images', () => {
    const foo = {
      type: 'image',
      alt: 'blah',
      variants: [
        {
          url: 'foo.png',
          traits: ['2x'],
          size: {
            width: 42,
            height: 42,
          },
        },
      ],
    };
    const wrapper = mountAsset('foo', { foo });

    const imageAsset = wrapper.find(ImageAsset);
    expect(imageAsset.props('alt')).toBe(foo.alt);
    expect(imageAsset.props('variants')).toBe(foo.variants);
  });

  it('renders a `VideoAsset` for video', () => {
    const foo = {
      type: 'video',
      poster: 'image',
      variants: [
        {
          url: 'foo.mp4',
          traits: ['2x'],
          size: {
            width: 42,
            height: 42,
          },
        },
      ],
    };
    const image = {
      type: 'image',
      variants: [
        {
          url: 'image.jpg',
          traits: ['2x', 'light'],
        },
      ],
    };
    const wrapper = mountAsset('foo', { foo, image });

    const videoAsset = wrapper.find(VideoAsset);
    expect(videoAsset.props('variants')).toBe(foo.variants);
    expect(videoAsset.props('posterVariants')).toBe(image.variants);
    expect(videoAsset.props('showsControls')).toBe(true);
    expect(videoAsset.props('autoplays')).toBe(true);

    // Check that 'ended' events emitted by a `VideoAsset` are re-emitted.
    videoAsset.vm.$emit('ended');
    expect(wrapper.emitted().videoEnded[0]).toBeTruthy();
  });

  it('renders a `VideoAsset` without poster variants', () => {
    const foo = {
      type: 'video',
      poster: 'image',
      variants: [
        {
          url: 'foo.mp4',
          traits: ['2x'],
          size: {
            width: 42,
            height: 42,
          },
        },
      ],
    };
    const videoAsset = mountAsset('foo', { foo }).find(VideoAsset);
    expect(videoAsset.props('variants')).toBe(foo.variants);
    expect(videoAsset.props('posterVariants')).toEqual([]);
  });

  it('renders a `ReplayableVideoAsset` for video with `showsReplayButton=true`', () => {
    const foo = {
      type: 'video',
      variants: [
        {
          url: 'foo.mp4',
          traits: ['2x'],
          size: {
            width: 42,
            height: 42,
          },
        },
      ],
    };
    const wrapper = shallowMount(Asset, {
      propsData: {
        identifier: 'foo',
        showsReplayButton: true,
        showsVideoControls: true,
      },
      provide: { references: { foo } },
    });

    const videoAsset = wrapper.find(ReplayableVideoAsset);
    expect(videoAsset.props('variants')).toBe(foo.variants);
    expect(videoAsset.props('showsControls')).toBe(true);
  });

  describe('ReduceMotion aware', () => {
    const video = {
      type: 'video',
      poster: 'image',
      variants: [
        {
          url: 'foo.mp4',
          traits: ['2x'],
          size: {
            width: 42,
            height: 42,
          },
        },
      ],
    };
    const image = {
      type: 'image',
      alt: 'blah',
      variants: [
        {
          url: 'foo.png',
          traits: ['2x'],
          size: {
            width: 42,
            height: 42,
          },
        },
      ],
    };

    beforeEach(() => {
      window.matchMedia.mockImplementationOnce(() => ({ matches: true }));
    });

    it('renders an `ImageAsset` for videos when reduceMotion setting is chosen', () => {
      const wrapper = mountAsset('video', { video, image });
      const asset = wrapper.find(ImageAsset);

      expect(asset.exists()).toBe(true);
      expect(asset.props()).toEqual({
        alt: image.alt,
        variants: image.variants,
      });
    });

    it('renders with ReduceMotion only if type is video', () => {
      const wrapper = mountAsset('image', { video, image });
      const asset = wrapper.find(ImageAsset);
      expect(asset.props()).toEqual({
        alt: image.alt,
        variants: image.variants,
      });
    });

    it('falls back to video asset if no static image is found', () => {
      const wrapper = mountAsset('video', { video });
      const asset = wrapper.find(ImageAsset);
      expect(asset.exists()).toBe(false);
      expect(wrapper.find(VideoAsset).props('variants')).toEqual(video.variants);
      expect(wrapper.find(VideoAsset).props('autoplays')).toEqual(false);
    });
  });
});
