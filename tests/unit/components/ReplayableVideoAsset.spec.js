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
import ReplayableVideoAsset from 'docc-render/components/ReplayableVideoAsset.vue';
import VideoAsset from 'docc-render/components/VideoAsset.vue';
import InlineReplayIcon from 'theme/components/Icons/InlineReplayIcon.vue';
import PlayIcon from '@/components/Icons/PlayIcon.vue';
import PauseIcon from '@/components/Icons/PauseIcon.vue';
import { flushPromises } from '../../../test-utils';

const variants = [{ traits: ['dark', '1x'], url: 'https://www.example.com/myvideo.mp4' }];
const posterVariants = [{ traits: ['dark', '1x'], url: 'https://www.example.com/image.jpg' }];

const propsData = {
  variants,
  posterVariants,
  showsControls: false,
  alt: 'Text describing this video',
  id: 'video.mp4',
};
describe('ReplayableVideoAsset', () => {
  const mountWithProps = props => shallowMount(ReplayableVideoAsset, {
    provide: {
      isTargetIDE: false,
    },
    stubs: { VideoAsset },
    propsData: {
      ...propsData,
      ...props,
    },
  });

  const playMock = jest.fn().mockResolvedValue(undefined);
  const pauseMock = jest.fn().mockResolvedValue(undefined);

  beforeAll(() => {
    window.matchMedia = () => ({ matches: false });
    window.HTMLMediaElement.prototype.play = playMock;
    window.HTMLMediaElement.prototype.pause = pauseMock;
    Object.defineProperties(window.HTMLMediaElement.prototype, {
      paused: {
        value: false,
        writable: true,
      },
      ended: {
        value: false,
        writable: true,
      },
    });
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes the `url` prop to `VideoAsset`', () => {
    const wrapper = mountWithProps();

    const video = wrapper.find(VideoAsset);
    expect(video.props('variants')).toBe(variants);
    expect(video.props('posterVariants')).toBe(posterVariants);
    expect(video.props('showsControls')).toBe(false);
    expect(video.props('autoplays')).toBe(false);
    expect(video.props('id')).toBe(propsData.id);
    expect(video.props('alt')).toBe(propsData.alt);
    expect(wrapper.find('.control-button').exists()).toBe(true);
  });

  it('does not show the `.control-button` if `showsControls` is `true`', () => {
    const wrapper = mountWithProps({
      showsControls: true,
    });
    const video = wrapper.find(VideoAsset);
    expect(video.props('showsControls')).toBe(true);
    expect(wrapper.find('.control-button').exists()).toBe(false);
  });

  it('changes the control button text, while the video is changing states', async () => {
    const wrapper = mountWithProps();

    const replayButton = wrapper.find('.control-button');

    expect(replayButton.exists()).toBe(true);
    expect(replayButton.text()).toBe('video.play');

    expect(replayButton.find('.control-icon').is(PlayIcon)).toBe(true);
    const video = wrapper.find(VideoAsset);
    await video.vm.$emit('ended');

    expect(wrapper.find('.control-icon').is(InlineReplayIcon)).toBe(true);
    expect(replayButton.text()).toBe('video.replay');

    // start playing
    await replayButton.trigger('click');
    await video.vm.$emit('playing');
    const videoEl = video.find('video').element;
    videoEl.paused = false;
    videoEl.ended = false;
    await flushPromises();
    expect(replayButton.text()).toBe('video.pause');
    expect(wrapper.find('.control-icon').is(PauseIcon)).toBe(true);
    await replayButton.trigger('click');
    videoEl.paused = true;
    await video.vm.$emit('pause');
    expect(replayButton.text()).toBe('video.play');
  });

  it('plays the video if replay button is clicked', async () => {
    const wrapper = mountWithProps();

    expect(playMock).toHaveBeenCalledTimes(0);
    expect(pauseMock).toHaveBeenCalledTimes(0);
    const button = wrapper.find('.control-button');
    await button.trigger('click');
    await wrapper.find(VideoAsset).vm.$emit('playing');
    await flushPromises();
    expect(pauseMock).toHaveBeenCalledTimes(0);
    expect(playMock).toHaveBeenCalledTimes(1);
    await button.trigger('click');
    expect(pauseMock).toHaveBeenCalledTimes(1);
  });

  it('shows the play button on first mount, if not set to autoplay', async () => {
    const wrapper = mountWithProps({
      autoplays: false,
    });
    const video = wrapper.find({ ref: 'asset' });
    const control = wrapper.find('.control-button');
    expect(control.text()).toBe('video.play');
    control.trigger('click');
    video.vm.$emit('playing');
    await flushPromises();
    // text is changed
    expect(control.text()).toBe('video.pause');
    // now end the video
    video.vm.$emit('ended');
    // assert text changed and its visible
    expect(control.text()).toBe('video.replay');
  });

  it('provides the DeviceFrame down to the Video', () => {
    const wrapper = mountWithProps({
      deviceFrame: 'phone',
    });
    expect(wrapper.find(VideoAsset).props()).toMatchObject({
      deviceFrame: 'phone',
    });
  });
});
