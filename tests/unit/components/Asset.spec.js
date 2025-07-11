/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

/* eslint-disable no-useless-escape */
import { shallowMount } from '@vue/test-utils';
import Asset from 'docc-render/components/Asset.vue';
import ImageAsset from 'docc-render/components/ImageAsset.vue';
import VideoAsset from 'docc-render/components/VideoAsset.vue';
import ReplayableVideoAsset from 'docc-render/components/ReplayableVideoAsset.vue';

const video = {
  type: 'video',
  poster: 'image',
  alt: 'Text describing this video',
  variants: [
    {
      url: 'foo\.mp4',
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
      provide: {
        store: {
          state: { references },
        },
      },
    })
  );

  it('renders a div.asset', () => {
    const wrapper = mountAsset('foo.bar');
    expect(wrapper.element.matches('div.asset')).toBe(true);
    expect(wrapper.isEmpty()).toBe(true);
  });

  it('renders an `ImageAsset` for images', () => {
    const foo = {
      type: 'image',
      alt: 'blah',
      variants: [
        {
          url: 'foo\.png',
          traits: ['2x'],
          size: {
            width: 42,
            height: 42,
          },
        },
      ],
    };
    const wrapper = mountAsset('foo', { foo });

    const imageAsset = wrapper.findComponent(ImageAsset);
    expect(imageAsset.props('alt')).toBe(foo.alt);
    expect(imageAsset.props('variants')).toBe(foo.variants);
  });

  it('renders a `ReplayableVideoAsset` for video', async () => {
    const image = {
      type: 'image',
      variants: [
        {
          url: 'image\.jpg',
          traits: ['2x', 'light'],
        },
      ],
    };
    const wrapper = mountAsset('video', { video, image });

    const videoAsset = wrapper.findComponent(ReplayableVideoAsset);
    expect(videoAsset.props('variants')).toBe(video.variants);
    expect(videoAsset.props('posterVariants')).toBe(image.variants);
    expect(videoAsset.props('showsDefaultControls')).toBe(false);
    expect(videoAsset.props('autoplays')).toBe(false);

    // Check that 'ended' events emitted by a `VideoAsset` are re-emitted.
    videoAsset.vm.$emit('ended');
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().videoEnded[0]).toBeTruthy();
  });

  it('renders a `ReplayableVideoAsset` without poster variants', () => {
    const identifier = 'video';
    const videoAsset = mountAsset(identifier, { video }).findComponent(ReplayableVideoAsset);
    expect(videoAsset.props('variants')).toBe(video.variants);
    expect(videoAsset.props('posterVariants')).toEqual([]);
    expect(videoAsset.props('id')).toBe(identifier);
    expect(videoAsset.props('alt')).toBe(video.alt);
  });

  it('passes down `deviceFrame` to `ReplayableVideoAsset`', async () => {
    const wrapper = mountAsset('video', { video });
    let videoAsset = wrapper.findComponent(ReplayableVideoAsset);
    expect(videoAsset.props('deviceFrame')).toBeFalsy();
    await wrapper.setProps({
      deviceFrame: 'phone',
    });
    videoAsset = wrapper.findComponent(ReplayableVideoAsset);
    expect(videoAsset.props('deviceFrame')).toBe('phone');
  });

  it('renders a `VideoAsset` for video with `showsReplayButton=false`', () => {
    const identifier = 'video';

    const wrapper = shallowMount(Asset, {
      propsData: {
        identifier,
        showsReplayButton: false,
        showsVideoControls: true,
      },
      provide: {
        store: {
          state: { references: { [identifier]: video } },
        },
      },
    });

    const videoAsset = wrapper.findComponent(VideoAsset);
    expect(videoAsset.props()).toEqual(expect.objectContaining({
      variants: video.variants,
      showsDefaultControls: true,
      muted: false,
      id: identifier,
      alt: video.alt,
    }));
  });

  it('renders a `ReplayableVideoAsset` with deviceFrame', () => {
    const identifier = 'video';

    const wrapper = shallowMount(Asset, {
      propsData: {
        identifier,
        showsReplayButton: true,
        showsVideoControls: true,
        deviceFrame: 'phone',
      },
      provide: {
        store: {
          state: { references: { video } },
        },
      },
    });

    const videoAsset = wrapper.findComponent(ReplayableVideoAsset);
    expect(videoAsset.props()).toEqual({
      autoplays: false,
      deviceFrame: 'phone',
      muted: false,
      posterVariants: [],
      showsDefaultControls: true,
      variants: video.variants,
      id: identifier,
      alt: video.alt,
    });
  });

  it('renders a `ReplayableVideoAsset`, without muting it', () => {
    const wrapper = shallowMount(Asset, {
      propsData: {
        identifier: 'video',
        showsVideoControls: true,
        videoAutoplays: true,
        videoMuted: false,
      },
      provide: {
        store: {
          state: { references: { video } },
        },
      },
    });

    const videoAsset = wrapper.findComponent(ReplayableVideoAsset);
    expect(videoAsset.props('variants')).toBe(video.variants);
    expect(videoAsset.props('showsDefaultControls')).toBe(true);
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
      provide: {
        store: {
          state: { references: { video } },
        },
      },
    });

    const videoAsset = wrapper.findComponent(ReplayableVideoAsset);
    expect(videoAsset.props('showsDefaultControls')).toBe(true);
    expect(videoAsset.props('muted')).toBe(false);
  });

  describe('ReduceMotion aware', () => {
    const image = {
      type: 'image',
      alt: 'blah',
      variants: [
        {
          url: 'foo\.png',
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
      const asset = wrapper.findComponent(ImageAsset);

      expect(asset.exists()).toBe(true);
      expect(asset.props()).toEqual({
        alt: image.alt,
        variants: image.variants,
        shouldCalculateOptimalWidth: true,
      });
    });

    it('renders with ReduceMotion only if type is video', () => {
      const wrapper = mountAsset('image', { video, image });
      const asset = wrapper.findComponent(ImageAsset);
      expect(asset.props()).toEqual({
        alt: image.alt,
        variants: image.variants,
        shouldCalculateOptimalWidth: true,
      });
    });

    it('falls back to video asset if no static image is found', () => {
      const wrapper = mountAsset('video', { video });
      const asset = wrapper.findComponent(ImageAsset);
      expect(asset.exists()).toBe(false);
      expect(wrapper.findComponent(ReplayableVideoAsset).props('variants')).toEqual(video.variants);
      expect(wrapper.findComponent(ReplayableVideoAsset).props('autoplays')).toEqual(false);
    });
  });
});
