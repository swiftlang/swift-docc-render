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
import ColorScheme from 'docc-render/constants/ColorScheme';
import VideoAsset from 'docc-render/components/VideoAsset.vue';
import * as assetUtils from 'docc-render/utils/assets';
import { flushPromises } from '../../../test-utils';

const getIntrinsicDimensionsSpy = jest.spyOn(assetUtils, 'getIntrinsicDimensions').mockResolvedValue({
  width: 100,
  height: 100,
});

const data = () => ({
  appState: {
    preferredColorScheme: ColorScheme.auto.value,
    supportsAutoColorScheme: true,
    systemColorScheme: ColorScheme.light.value,
  },
});

const propsData = {
  posterVariants: [
    { traits: ['light', '1x'], url: 'https://www.example.com/image.png' },
    { traits: ['dark', '2x'], url: 'https://www.example.com/image~dark.png' },
  ],
  variants: [
    { traits: ['light', '1x'], url: 'https://www.example.com/video.mp4' },
    { traits: ['dark', '1x'], url: 'https://www.example.com/video~dark.mp4' },
  ],
};

describe('VideoAsset', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(VideoAsset, { data, propsData });
  });

  it('renders a video', () => {
    expect(wrapper.is('video')).toBe(true);
    expect(wrapper.element.muted).toBe(true);
  });

  it('adds a poster to the `video`, using light by default', async () => {
    expect(wrapper.find('video').attributes('poster')).toEqual(propsData.posterVariants[0].url);
    expect(getIntrinsicDimensionsSpy).toHaveBeenCalledTimes(1);
    expect(getIntrinsicDimensionsSpy).toHaveBeenCalledWith(propsData.posterVariants[0].url);
    await flushPromises();
    expect(wrapper.attributes()).toMatchObject({
      width: '100',
    });
  });

  it('applies a dark poster if available and target prefers dark', async () => {
    expect(getIntrinsicDimensionsSpy).toHaveBeenCalledTimes(1);
    expect(getIntrinsicDimensionsSpy).toHaveBeenNthCalledWith(1, propsData.posterVariants[0].url);
    expect(wrapper.attributes()).toMatchObject({
      width: '100',
    });
    wrapper.setData({
      appState: { preferredColorScheme: ColorScheme.dark.value },
    });
    expect(wrapper.find('video').attributes('poster')).toEqual(propsData.posterVariants[1].url);
    expect(getIntrinsicDimensionsSpy).toHaveBeenCalledTimes(2);
    expect(getIntrinsicDimensionsSpy).toHaveBeenNthCalledWith(2, propsData.posterVariants[1].url);
    await flushPromises();
    // dark image is 2x, so the width is half
    expect(wrapper.attributes()).toMatchObject({
      width: '50',
    });
  });

  it('applies a light poster if there is no dark variant but target prefers dark', async () => {
    expect(getIntrinsicDimensionsSpy).toHaveBeenCalledTimes(1);
    wrapper.setProps({
      posterVariants: [propsData.posterVariants[0]],
      variants: [propsData.variants[0]],
    });
    wrapper.setData({
      appState: { preferredColorScheme: ColorScheme.dark.value },
    });
    await flushPromises();
    // the poster did not change, so the function was not called again
    expect(getIntrinsicDimensionsSpy).toHaveBeenCalledTimes(1);
    expect(wrapper.find('video').attributes('poster')).toEqual(propsData.posterVariants[0].url);
  });

  it('renders no poster if no light poster is provided, even if dark one exists', async () => {
    expect(getIntrinsicDimensionsSpy).toHaveBeenCalledTimes(1);
    wrapper.setProps({
      posterVariants: [propsData.posterVariants[1]],
    });
    expect(wrapper.find('video').attributes('poster')).toEqual(undefined);
    // not called again
    expect(getIntrinsicDimensionsSpy).toHaveBeenCalledTimes(1);
    await flushPromises();
    expect(wrapper.attributes('width')).toBeFalsy();
    expect(wrapper.attributes('height')).toBeFalsy();
  });

  it('renders no poster if not available', async () => {
    expect(getIntrinsicDimensionsSpy).toHaveBeenCalledTimes(1);
    wrapper.setProps({
      posterVariants: [],
    });
    expect(wrapper.find('video').attributes('poster')).toEqual(undefined);
    await flushPromises();
    // not called again
    expect(getIntrinsicDimensionsSpy).toHaveBeenCalledTimes(1);
    expect(wrapper.attributes('width')).toBeFalsy();
    expect(wrapper.attributes('height')).toBeFalsy();
  });

  it('does not show controls when `showsControls=false`', () => {
    wrapper.setProps({
      showControls: false,
    });
    const source = wrapper.find('video source');
    expect(source.attributes('controls')).toBe(undefined);
  });

  it('forwards `playing`, `pause` and `ended` events', () => {
    const video = wrapper.find('video');

    video.trigger('playing');
    expect(wrapper.emitted().playing.length).toBe(1);

    video.trigger('pause');
    expect(wrapper.emitted().pause.length).toBe(1);

    video.trigger('ended');
    expect(wrapper.emitted().ended.length).toBe(1);
  });

  it('sets `autoplay` using `autoplays`', () => {
    expect(wrapper.attributes('autoplay')).toBe('autoplay');
    wrapper.setProps({ autoplays: false });
    expect(wrapper.attributes('autoplay')).toBe(undefined);
  });

  it('sets `controls` using `showsControls`', () => {
    expect(wrapper.attributes('controls')).toBe('controls');
    wrapper.setProps({ showsControls: false });
    expect(wrapper.attributes('controls')).toBe(undefined);
  });

  it('renders a source for the light variant when applicable', () => {
    let source = wrapper.find('source');
    expect(source.exists()).toBe(true);
    expect(source.attributes('src')).toBe(propsData.variants[0].url);

    wrapper.setData({
      appState: {
        preferredColorScheme: ColorScheme.light.value,
      },
    });
    source = wrapper.find('source');
    expect(source.exists()).toBe(true);
    expect(source.attributes('src')).toBe(propsData.variants[0].url);
  });

  it('renders a source for the dark variant when applicable', () => {
    wrapper.setData({
      appState: {
        preferredColorScheme: ColorScheme.dark.value,
      },
    });
    let source = wrapper.find('source');
    expect(source.exists()).toBe(true);
    expect(source.attributes('src')).toBe(propsData.variants[1].url);

    wrapper.setData({
      appState: {
        preferredColorScheme: ColorScheme.auto.value,
        systemColorScheme: ColorScheme.dark.value,
      },
    });
    source = wrapper.find('source');
    expect(source.exists()).toBe(true);
    expect(source.attributes('src')).toBe(propsData.variants[1].url);
  });

  it('renders a video as none-muted', () => {
    wrapper.setProps({
      muted: false,
    });
    expect(wrapper.element.muted).toBeFalsy();
  });
});
