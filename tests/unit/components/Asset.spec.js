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
    const image = {
      type: 'image',
      variants: [
        {
          url: 'image.jpg',
          traits: ['2x', 'light'],
        },
      ],
    };
    const wrapper = mountAsset('video', { video, image });

    const videoAsset = wrapper.find(VideoAsset);
    expect(videoAsset.props('variants')).toBe(video.variants);
    expect(videoAsset.props('posterVariants')).toBe(image.variants);
    expect(videoAsset.props('showsControls')).toBe(true);
    expect(videoAsset.props('autoplays')).toBe(true);

    // Check that 'ended' events emitted by a `VideoAsset` are re-emitted.
    videoAsset.vm.$emit('ended');
    expect(wrapper.emitted().videoEnded[0]).toBeTruthy();
  });

  it('renders a `VideoAsset` without poster variants', () => {
    const videoAsset = mountAsset('video', { video }).find(VideoAsset);
    expect(videoAsset.props('variants')).toBe(video.variants);
    expect(videoAsset.props('posterVariants')).toEqual([]);
  });

  it('renders a `ReplayableVideoAsset` for video with `showsReplayButton=true`', () => {
    const wrapper = shallowMount(Asset, {
      propsData: {
        identifier: 'video',
        showsReplayButton: true,
        showsVideoControls: true,
      },
      provide: { references: { video } },
    });

    const videoAsset = wrapper.find(ReplayableVideoAsset);
    expect(videoAsset.props('variants')).toBe(video.variants);
    expect(videoAsset.props('showsControls')).toBe(true);
    expect(videoAsset.props('muted')).toBe(true);
  });

  it('renders a `VideoAsset`, without muting it', () => {
    const wrapper = shallowMount(Asset, {
      propsData: {
        identifier: 'video',
        showsVideoControls: true,
        videoAutoplays: true,
        videoMuted: false,
      },
      provide: { references: { video } },
    });

    expect(wrapper.find(ReplayableVideoAsset).exists()).toBe(false);
    const videoAsset = wrapper.find(VideoAsset);
    expect(videoAsset.props('variants')).toBe(video.variants);
    expect(videoAsset.props('showsControls')).toBe(true);
    expect(videoAsset.props('muted')).toBe(false);
    expect(videoAsset.props('autoplays')).toBe(true);
  });

  it('renders a `ReplayableVideoAsset` without it being muted', () => {
    const wrapper = shallowMount(Asset, {
      propsData: {
        identifier: 'video',
        showsReplayButton: true,
        showsVideoControls: true,
        videoMuted: false,
      },
      provide: { references: { video } },
    });

    const videoAsset = wrapper.find(ReplayableVideoAsset);
    expect(videoAsset.props('showsControls')).toBe(true);
    expect(videoAsset.props('muted')).toBe(false);
  });

  describe('ReduceMotion aware', () => {
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
        loading: 'lazy',
        variants: image.variants,
        shouldCalculateOptimalWidth: true,
      });
    });

    it('renders with ReduceMotion only if type is video', () => {
      const wrapper = mountAsset('image', { video, image });
      const asset = wrapper.find(ImageAsset);
      expect(asset.props()).toEqual({
        alt: image.alt,
        loading: 'lazy',
        variants: image.variants,
        shouldCalculateOptimalWidth: true,
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
