/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import ColorScheme from 'docc-render/constants/ColorScheme';
import VideoAsset from 'docc-render/components/VideoAsset.vue';
import * as assetUtils from 'docc-render/utils/assets';
import DeviceFrame from '@/components/ContentNode/DeviceFrame.vue';
import ConditionalWrapper from '@/components/ConditionalWrapper.vue';
import { flushPromises } from '../../../test-utils';

const getIntrinsicDimensionsSpy = jest.spyOn(assetUtils, 'getIntrinsicDimensions').mockResolvedValue({
  width: 100,
  height: 100,
});

const data = () => ({
  appState: {
    preferredColorScheme: ColorScheme.auto,
    supportsAutoColorScheme: true,
    systemColorScheme: ColorScheme.light,
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
  alt: 'Text describing this video',
  id: 'videomp4',
  showsDefaultControls: false,
};

const altTextId = `${propsData.id}-alt`;

describe('VideoAsset', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(VideoAsset, { data, propsData, stubs: { ConditionalWrapper } });
  });

  it('renders a video', () => {
    const video = wrapper.findComponent('video');
    expect(video.exists()).toBe(true);
    expect(video.element.muted).toBe(false);
    expect(video.attributes('id')).toBe(propsData.id);
    expect(video.attributes('aria-roledescription')).toBe('video.title');
  });

  it('renders a hidden description with unique id for AX purposes if video provides an alt text', () => {
    const hiddenDesc = wrapper.findComponent('span[hidden=hidden]');
    expect(hiddenDesc.exists()).toBe(true);
    expect(hiddenDesc.attributes('id')).toBe(altTextId);
    expect(hiddenDesc.text()).toBe(`video.description ${propsData.alt}`);
  });

  it('adds a description reference to the `video` if showsDefaultControls is true', async () => {
    await wrapper.setProps({ showsDefaultControls: true });
    const video = wrapper.findComponent('video');
    expect(video.attributes('aria-labelledby')).toBe(altTextId);
  });

  it('does not add a description reference to the `video` if alt is not provided', async () => {
    await wrapper.setProps({ alt: null });
    expect(wrapper.findComponent('video').attributes()).not.toHaveProperty('aria-labelledby');
  });

  it('adds a poster to the `video`, using light by default', async () => {
    const video = wrapper.findComponent('video');
    expect(video.attributes('poster')).toEqual(propsData.posterVariants[0].url);
    expect(getIntrinsicDimensionsSpy).toHaveBeenCalledTimes(1);
    expect(getIntrinsicDimensionsSpy).toHaveBeenCalledWith(propsData.posterVariants[0].url);
    await flushPromises();
    expect(video.attributes()).toMatchObject({
      width: '100',
    });
  });

  it('applies a dark poster if available and target prefers dark', async () => {
    const video = wrapper.findComponent('video');
    expect(getIntrinsicDimensionsSpy).toHaveBeenCalledTimes(1);
    expect(getIntrinsicDimensionsSpy).toHaveBeenNthCalledWith(1, propsData.posterVariants[0].url);
    expect(video.attributes()).toMatchObject({
      width: '100',
    });
    await wrapper.setData({
      appState: { preferredColorScheme: ColorScheme.dark },
    });
    expect(wrapper.findComponent('video').attributes('poster')).toEqual(propsData.posterVariants[1].url);
    expect(getIntrinsicDimensionsSpy).toHaveBeenCalledTimes(2);
    expect(getIntrinsicDimensionsSpy).toHaveBeenNthCalledWith(2, propsData.posterVariants[1].url);
    await flushPromises();
    // dark image is 2x, so the width is half
    expect(wrapper.findComponent('video').attributes()).toMatchObject({
      width: '50',
    });
  });

  it('applies a light poster if there is no dark variant but target prefers dark', async () => {
    expect(getIntrinsicDimensionsSpy).toHaveBeenCalledTimes(1);
    await wrapper.setProps({
      posterVariants: [propsData.posterVariants[0]],
      variants: [propsData.variants[0]],
    });
    await wrapper.setData({
      appState: { preferredColorScheme: ColorScheme.dark },
    });
    await flushPromises();
    // the poster did not change, so the function was not called again
    expect(getIntrinsicDimensionsSpy).toHaveBeenCalledTimes(1);
    expect(wrapper.findComponent('video').attributes('poster')).toEqual(propsData.posterVariants[0].url);
  });

  it('renders no poster if no light poster is provided, even if dark one exists', async () => {
    expect(getIntrinsicDimensionsSpy).toHaveBeenCalledTimes(1);
    await wrapper.setProps({
      posterVariants: [propsData.posterVariants[1]],
    });
    expect(wrapper.findComponent('video').attributes('poster')).toEqual(undefined);
    // not called again
    expect(getIntrinsicDimensionsSpy).toHaveBeenCalledTimes(1);
    await flushPromises();
    expect(wrapper.attributes('width')).toBeFalsy();
    expect(wrapper.attributes('height')).toBeFalsy();
  });

  it('renders no poster if not available', async () => {
    expect(getIntrinsicDimensionsSpy).toHaveBeenCalledTimes(1);
    await wrapper.setProps({
      posterVariants: [],
    });
    expect(wrapper.findComponent('video').attributes('poster')).toEqual(undefined);
    await flushPromises();
    // not called again
    expect(getIntrinsicDimensionsSpy).toHaveBeenCalledTimes(1);
    expect(wrapper.attributes('width')).toBeFalsy();
    expect(wrapper.attributes('height')).toBeFalsy();
  });

  it('does not show controls when `showsDefaultControls=false`', async () => {
    await wrapper.setProps({
      showControls: false,
    });
    const source = wrapper.findComponent('video source');
    expect(source.attributes('controls')).toBe(undefined);
  });

  it('forwards `playing`, `pause` and `ended` events', () => {
    const video = wrapper.findComponent('video');

    video.trigger('playing');
    expect(wrapper.emitted().playing.length).toBe(1);

    video.trigger('pause');
    expect(wrapper.emitted().pause.length).toBe(1);

    video.trigger('ended');
    expect(wrapper.emitted().ended.length).toBe(1);
  });

  it('sets `autoplay` using `autoplays`', async () => {
    const video = wrapper.findComponent('video');

    expect(video.attributes('autoplay')).toBeFalsy();
    await wrapper.setProps({ autoplays: true });
    expect(video.attributes('autoplay')).toBe('autoplay');
  });

  it('sets `controls` using `showsDefaultControls`', async () => {
    const video = wrapper.findComponent('video');
    expect(video.attributes('controls')).toBe(undefined);
    await wrapper.setProps({ showsDefaultControls: true });
    expect(video.attributes('controls')).toBe('controls');
  });

  it('renders a source for the light variant when applicable', async () => {
    let source = wrapper.findComponent('source');
    expect(source.exists()).toBe(true);
    expect(source.attributes('src')).toBe(propsData.variants[0].url);

    await wrapper.setData({
      appState: {
        preferredColorScheme: ColorScheme.light,
      },
    });
    source = wrapper.findComponent('source');
    expect(source.exists()).toBe(true);
    expect(source.attributes('src')).toBe(propsData.variants[0].url);
  });

  it('renders a source for the dark variant when applicable', async () => {
    await wrapper.setData({
      appState: {
        preferredColorScheme: ColorScheme.dark,
      },
    });
    let source = wrapper.findComponent('source');
    expect(source.exists()).toBe(true);
    expect(source.attributes('src')).toBe(propsData.variants[1].url);

    await wrapper.setData({
      appState: {
        preferredColorScheme: ColorScheme.auto,
        systemColorScheme: ColorScheme.dark,
      },
    });
    source = wrapper.findComponent('source');
    expect(source.exists()).toBe(true);
    expect(source.attributes('src')).toBe(propsData.variants[1].url);
  });

  it('renders a video as none-muted', async () => {
    await wrapper.setProps({
      muted: false,
    });
    expect(wrapper.element.muted).toBeFalsy();
  });

  it('renders a `ConditionalWrapper` around the video', async () => {
    expect(wrapper.findComponent(DeviceFrame).exists()).toBeFalsy();
    await wrapper.setProps({
      deviceFrame: 'phone',
    });
    const frame = wrapper.findComponent(DeviceFrame);
    expect(frame.props()).toEqual({
      device: 'phone',
    });

    const video = frame.find('video');
    expect(video.exists()).toBe(true);
    expect(video.find('source').attributes('src')).toBe(propsData.variants[0].url);
  });

  it('sets the orientation after the metadata is loaded', async () => {
    const video = wrapper.findComponent('video');
    expect(video.attributes('data-orientation')).toBeFalsy();

    wrapper.vm.$refs.video = { videoWidth: 300, videoHeight: 200 };

    await video.trigger('loadedmetadata');
    expect(video.attributes('data-orientation')).toBe('landscape');
  });
});
