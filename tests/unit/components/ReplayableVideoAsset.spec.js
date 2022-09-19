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
import ReplayableVideoAsset from 'docc-render/components/ReplayableVideoAsset.vue';
import VideoAsset from 'docc-render/components/VideoAsset.vue';
import InlineReplayIcon from 'theme/components/Icons/InlineReplayIcon.vue';
import PlayIcon from '@/components/Icons/PlayIcon.vue';
import { flushPromises } from '../../../test-utils';

const variants = [{ traits: ['dark', '1x'], url: 'https://www.example.com/myvideo.mp4' }];
const posterVariants = [{ traits: ['dark', '1x'], url: 'https://www.example.com/image.jpg' }];

const propsData = {
  variants,
  posterVariants,
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

  beforeAll(() => {
    window.matchMedia = () => ({ matches: false });
    window.HTMLMediaElement.prototype.play = playMock;
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes the `url` prop to `VideoAsset`', () => {
    const wrapper = mountWithProps();

    const video = wrapper.find(VideoAsset);
    expect(video.props('variants')).toBe(variants);
    expect(video.props('posterVariants')).toBe(posterVariants);
    expect(video.props('showsControls')).toBe(true);
    expect(video.props('autoplays')).toBe(true);
  });

  it('displays the replay button when the video has ended', async () => {
    const wrapper = mountWithProps();

    const replayButton = wrapper.find('.replay-button');

    // Initially, the replay button should not be displayed.
    expect(replayButton.exists()).toBe(true);
    expect(replayButton.classes('visible')).toBe(false);

    expect(replayButton.find('.replay-icon').is(PlayIcon)).toBe(true);
    const video = wrapper.find(VideoAsset);
    video.vm.$emit('ended');

    expect(replayButton.classes('visible')).toBe(true);
    expect(wrapper.find('.replay-icon').is(InlineReplayIcon)).toBe(true);

    // When the video is playing, the replay button should be hidden.
    replayButton.trigger('click');
    await flushPromises();
    expect(replayButton.classes('visible')).toBe(false);
  });

  it('plays the video if replay button is clicked', async () => {
    const wrapper = mountWithProps();

    expect(playMock).toHaveBeenCalledTimes(0);
    wrapper.find('.replay-button').trigger('click');
    await flushPromises();
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it('shows the Replay on first mount, if not set to autoplay', async () => {
    const wrapper = mountWithProps({
      autoplays: false,
    });
    const replay = wrapper.find('.replay-button');
    expect(replay.text()).toBe('Play');
    expect(replay.classes()).toContain('visible');
    replay.trigger('click');
    await flushPromises();
    // text is not changed, but its invisible
    expect(replay.text()).toBe('Play');
    expect(replay.classes()).not.toContain('visible');
    // now end the video
    wrapper.find({ ref: 'asset' }).trigger('ended');
    // assert text changed and its visible
    expect(replay.text()).toBe('Replay');
    expect(replay.classes()).toContain('visible');
  });

  it('shows the Replay on `pause` if no `showsControls` is false', async () => {
    const wrapper = mountWithProps({
      autoplays: false,
      showsControls: false,
    });
    const replay = wrapper.find('.replay-button');
    expect(replay.classes()).toContain('visible');
    // play
    replay.trigger('click');
    await flushPromises();
    // assert button is hidden
    expect(replay.classes()).not.toContain('visible');
    // pause
    wrapper.find({ ref: 'asset' }).trigger('pause');
    // assert button is visible again
    expect(replay.classes()).toContain('visible');
  });

  it('hides the button when @playing fired', () => {
    const wrapper = mountWithProps({
      autoplays: false,
    });
    const replay = wrapper.find('.replay-button');
    expect(replay.classes()).toContain('visible');
    // Simulate browser starts playing
    wrapper.find({ ref: 'asset' }).trigger('playing');
    // assert button is hidden
    expect(replay.classes()).not.toContain('visible');
  });
});
