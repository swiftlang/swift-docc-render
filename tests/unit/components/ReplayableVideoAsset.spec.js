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
  showsDefaultControls: false,
  alt: 'Text describing this video',
  id: 'videomp4',
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

    const video = wrapper.findComponent(VideoAsset);
    expect(video.props('variants')).toBe(variants);
    expect(video.props('posterVariants')).toBe(posterVariants);
    expect(video.props('showsDefaultControls')).toBe(false);
    expect(video.props('autoplays')).toBe(false);
    expect(video.props('id')).toBe(propsData.id);
    expect(video.props('alt')).toBe(propsData.alt);
    expect(wrapper.findComponent('.control-button').exists()).toBe(true);
  });

  it('renders a video-replay-container as a group with AX aria tags', () => {
    const wrapper = mountWithProps();
    const ariaLabelledByContainer = `${propsData.id}-custom-controls ${propsData.id}-alt`;

    const container = wrapper.findComponent('.video-replay-container');
    expect(container.attributes('role')).toBe('group');
    expect(container.attributes('aria-labelledby')).toBe(ariaLabelledByContainer);

    const customControlsDescription = wrapper.findComponent(`#${propsData.id}-custom-controls`);
    expect(customControlsDescription.exists()).toBe(true);
    expect(customControlsDescription.attributes('hidden')).toBe('hidden');
    expect(customControlsDescription.text()).toBe('video.custom-controls');
  });

  it('does not render the reference to the alt id in video-replay-container if alt does not exit', () => {
    const wrapper = mountWithProps({
      alt: '',
    });
    const ariaLabelledByContainer = `${propsData.id}-custom-controls`;

    const container = wrapper.findComponent('.video-replay-container');
    expect(container.attributes('aria-labelledby')).toBe(ariaLabelledByContainer);
  });

  it('renders a video-replay-container without "aria-labelledby" if showsDefaultControls is true', () => {
    const wrapper = mountWithProps({
      showsDefaultControls: true,
    });

    const container = wrapper.findComponent('.video-replay-container');
    expect(container.attributes()).not.toHaveProperty('aria-labelledby');
  });

  it('does not show the `.control-button` if `showsDefaultControls` is `true`', () => {
    const wrapper = mountWithProps({
      showsDefaultControls: true,
    });
    const video = wrapper.findComponent(VideoAsset);
    expect(video.props('showsDefaultControls')).toBe(true);
    expect(wrapper.findComponent('.control-button').exists()).toBe(false);
  });

  it('adds an aria-controls referring to the video id in `.control-button`', () => {
    const wrapper = mountWithProps();
    const controlButton = wrapper.findComponent('.control-button');
    expect(controlButton.attributes('aria-controls')).toBe(propsData.id);
  });

  it('does not add a description reference to `.control-button` if alt is not provided', () => {
    const wrapper = mountWithProps({ alt: null });
    const controlButton = wrapper.findComponent('.control-button');
    expect(controlButton.attributes()).not.toHaveProperty('aria-describedby');
  });

  it('changes the control button text, while the video is changing states', async () => {
    const wrapper = mountWithProps();

    const replayButton = wrapper.findComponent('.control-button');

    expect(replayButton.exists()).toBe(true);
    expect(replayButton.text()).toBe('video.play');

    expect(replayButton.find('.control-icon').is(PlayIcon)).toBe(true);
    const video = wrapper.findComponent(VideoAsset);
    await video.vm.$emit('ended');

    expect(wrapper.findComponent('.control-icon').is(InlineReplayIcon)).toBe(true);
    expect(replayButton.text()).toBe('video.replay');

    // start playing
    await replayButton.trigger('click');
    await video.vm.$emit('playing');
    const videoEl = video.find('video').element;
    videoEl.paused = false;
    videoEl.ended = false;
    await flushPromises();
    expect(replayButton.text()).toBe('video.pause');
    expect(wrapper.findComponent('.control-icon').is(PauseIcon)).toBe(true);
    await replayButton.trigger('click');
    videoEl.paused = true;
    await video.vm.$emit('pause');
    expect(replayButton.text()).toBe('video.play');
  });

  it('plays the video if replay button is clicked', async () => {
    const wrapper = mountWithProps();

    expect(playMock).toHaveBeenCalledTimes(0);
    expect(pauseMock).toHaveBeenCalledTimes(0);
    const button = wrapper.findComponent('.control-button');
    await button.trigger('click');
    await wrapper.findComponent(VideoAsset).vm.$emit('playing');
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
    const video = wrapper.findComponent({ ref: 'asset' });
    const control = wrapper.findComponent('.control-button');
    expect(control.text()).toBe('video.play');
    control.trigger('click');
    video.vm.$emit('playing');
    await flushPromises();
    // text is changed
    expect(control.text()).toBe('video.pause');
    // now end the video
    video.vm.$emit('ended');
    await flushPromises();
    // assert text changed and its visible
    expect(control.text()).toBe('video.replay');
  });

  it('provides the DeviceFrame down to the Video', () => {
    const wrapper = mountWithProps({
      deviceFrame: 'phone',
    });
    expect(wrapper.findComponent(VideoAsset).props()).toMatchObject({
      deviceFrame: 'phone',
    });
  });
});
