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
import ImageAsset from 'docc-render/components/ImageAsset.vue';

import { flushPromises } from '../../../test-utils';

jest.mock('docc-render/stores/AppStore', () => ({
  state: {
    preferredColorScheme: 'auto',
    supportsAutoColorScheme: true,
    setPreferredColorScheme: jest.fn(),
  },
}));

describe('ImageAsset', () => {
  it('renders an image that has one light variant', () => {
    const url = 'https://www.example.com/image.png';
    const alt = 'This is alt text.';
    const wrapper = shallowMount(ImageAsset, {
      propsData: {
        variants: [
          {
            traits: [
              '2x',
              'light',
            ],
            url,
            size: {
              width: 1202,
              height: 630,
            },
          },
        ],
        alt,
      },
    });

    const picture = wrapper.find('picture');
    expect(picture.contains('source')).toBe(false);

    const image = picture.find('img');

    expect(image.attributes('src')).toBe(url);
    expect(image.attributes('srcset')).toBe(`${url} 2x`);
    expect(image.attributes('width')).toBe('1202');
    expect(image.attributes('height')).toBe('auto');
    expect(image.attributes('alt')).toBe(alt);
    expect(image.attributes('decoding')).toBe('async');
  });

  it('renders an image that has one variant with no appearance trait', () => {
    const url = 'https://www.example.com/image.png';
    const wrapper = shallowMount(ImageAsset, {
      propsData: {
        variants: [
          {
            traits: [
              '1x',
            ],
            url,
            size: {
              width: 300,
              height: 200,
            },
          },
        ],
      },
    });

    const picture = wrapper.find('picture');
    expect(picture.contains('source')).toBe(false);

    const image = picture.find('img');

    expect(image.attributes('src')).toBe(url);
    expect(image.attributes('srcset')).toBe(`${url} 1x`);
    expect(image.attributes('width')).toBe('300');
    expect(image.attributes('height')).toBe('auto');
    expect(image.attributes('alt')).toBe('');
    expect(image.attributes('decoding')).toBe('async');
  });

  it('renders an image that has two light variants', () => {
    const url2x = 'https://www.example.com/image-2x.png';
    const url3x = 'https://www.example.com/image-3x.png';
    const wrapper = shallowMount(ImageAsset, {
      propsData: {
        variants: [
          {
            traits: [
              '3x',
              'light',
            ],
            url: url3x,
            size: {
              width: 1202,
              height: 630,
            },
          },
          {
            traits: [
              '2x',
              'light',
            ],
            url: url2x,
            size: {
              width: 1202,
              height: 630,
            },
          },
        ],
      },
    });

    const picture = wrapper.find('picture');
    expect(picture.contains('source')).toBe(false);

    const image = wrapper.find('img');

    expect(image.attributes('src')).toBe(url2x);
    expect(image.attributes('srcset')).toBe(`${url2x} 2x, ${url3x} 3x`);
    expect(image.attributes('width')).toBe('1202');
    expect(image.attributes('height')).toBe('auto');
    expect(image.attributes('decoding')).toBe('async');
  });

  it('renders an image that has two dark variants', () => {
    const url2x = 'https://www.example.com/image-2x.png';
    const url3x = 'https://www.example.com/image-3x.png';
    const wrapper = shallowMount(ImageAsset, {
      propsData: {
        variants: [
          {
            traits: [
              '3x',
              'dark',
            ],
            url: url3x,
            size: {
              width: 1202,
              height: 630,
            },
          },
          {
            traits: [
              '2x',
              'dark',
            ],
            url: url2x,
            size: {
              width: 1202,
              height: 630,
            },
          },
        ],
      },
    });

    const picture = wrapper.find('picture');
    const source = picture.find('source');

    expect(source.attributes('media')).toBe('(prefers-color-scheme: dark)');
    expect(source.attributes('srcset')).toBe(`${url2x} 2x, ${url3x} 3x`);

    const image = wrapper.find('img');

    // The img tag should have the dark variant's attributes.
    expect(image.attributes('src')).toBe(url2x);
    expect(image.attributes('srcset')).toBe(`${url2x} 2x, ${url3x} 3x`);
    expect(image.attributes('width')).toBe('1202');
    expect(image.attributes('height')).toBe('auto');
  });

  it('renders an image that has light and dark variants', () => {
    const url1x = 'https://www.example.com/image-1x.png';
    const url2x = 'https://www.example.com/image-2x.png';
    const url3x = 'https://www.example.com/image-3x.png';
    const wrapper = shallowMount(ImageAsset, {
      propsData: {
        variants: [
          {
            traits: [
              '1x',
              'light',
            ],
            url: url1x,
            size: {
              width: 1202,
              height: 630,
            },
          },
          {
            traits: [
              '3x',
            ],
            url: url3x,
            size: {
              width: 1202,
              height: 630,
            },
          },
          {
            traits: [
              '2x',
              'dark',
            ],
            url: url2x,
            size: {
              width: 1202,
              height: 630,
            },
          },
        ],
      },
    });

    const picture = wrapper.find('picture');
    const source = picture.find('source');

    expect(source.attributes('media')).toBe('(prefers-color-scheme: dark)');
    expect(source.attributes('srcset')).toBe(`${url2x} 2x`);

    const image = wrapper.find('img');

    expect(image.attributes('src')).toBe(url1x);
    expect(image.attributes('srcset')).toBe(`${url1x} 1x, ${url3x} 3x`);
    expect(image.attributes('width')).toBe('1202');
    expect(image.attributes('height')).toBe('auto');
  });

  it('renders a fallback image if the specified one does not load', () => {
    const url = 'https://www.example.com/image.png';
    const alt = 'This is alt text.';
    const wrapper = shallowMount(ImageAsset, {
      propsData: {
        variants: [
          {
            traits: [
              '2x',
              'light',
            ],
            url,
            size: {
              width: 1202,
              height: 630,
            },
          },
        ],
        alt,
      },
    });

    const picture = wrapper.find('picture');
    expect(picture.exists()).toBe(true);
    const img = picture.find('img');
    expect(img.exists()).toBe(true);
    expect(img.classes('fallback')).toBe(false);

    // simulate an error loading the real image
    img.trigger('error');

    expect(wrapper.find('picture').exists()).toBe(false);
    const fallbackImg = wrapper.find('img');
    expect(fallbackImg.exists()).toBe(true);
    expect(fallbackImg.classes('fallback')).toBe(true);
    expect(fallbackImg.attributes('alt')).toBe(alt);
    expect(fallbackImg.attributes('title')).toBe('Image failed to load');
  });

  it('calculates an optimal width after image loads when no size is provided', async () => {
    const url = 'https://www.example.com/image.png';
    const traits = ['2x'];
    const intrinsicWidth = 84;
    const intrinsicHeight = intrinsicWidth;
    const optimalDisplayWidth = intrinsicWidth / 2;

    Object.defineProperty(HTMLImageElement.prototype, 'currentSrc', {
      get: () => url,
    });

    Object.defineProperty(Image.prototype, 'width', {
      get: () => intrinsicWidth,
    });
    Object.defineProperty(Image.prototype, 'height', {
      get: () => intrinsicHeight,
    });
    Object.defineProperty(Image.prototype, 'onload', {
      get() {
        return this.$onload;
      },
      set(fn) {
        this.$onload = fn;
        this.$onload(); // call immediately for unit test performance purposes
      },
    });

    // describe the image with a 2x trait (since it has an intrinsic width of 84
    // pixels wide, it should be displayed as 42 pixels wide)
    const wrapper = shallowMount(ImageAsset, {
      propsData: {
        variants: [
          {
            traits,
            url,
          },
        ],
      },
    });

    const img = wrapper.find('img');
    expect(img.attributes('src')).toBe(url);
    expect(img.attributes('srcset')).toBe(`${url} 2x`);
    expect(img.attributes('width')).toBeFalsy();
    expect(img.attributes('height')).toBeFalsy();

    img.trigger('load');
    await flushPromises();
    expect(img.attributes('width')).toBe(`${optimalDisplayWidth}`);
    expect(img.attributes('height')).toBe('auto');
  });

  it('does not calculate widths, if the element unmounts just as it gets loaded', async () => {
    const url = 'https://www.example.com/image.png';
    const traits = ['2x'];

    // describe the image with a 2x trait (since it has an intrinsic width of 84
    // pixels wide, it should be displayed as 42 pixels wide)
    const wrapper = shallowMount(ImageAsset, {
      propsData: {
        variants: [
          {
            traits,
            url,
          },
        ],
      },
    });

    const calculateOptimalWidthSpy = jest.spyOn(wrapper.vm, 'calculateOptimalWidth')
      .mockReturnValue(99);
    const img = wrapper.find('img');

    expect(img.attributes('width')).toBeFalsy();
    expect(img.attributes('height')).toBeFalsy();

    wrapper.destroy();
    img.trigger('load');
    await flushPromises();
    expect(img.attributes('width')).toBeFalsy();
    expect(img.attributes('height')).toBeFalsy();
    expect(calculateOptimalWidthSpy).toHaveBeenCalledTimes(0);
  });

  it('allows disabling the optimal-width calculation', async () => {
    const url = 'https://www.example.com/image.png';
    const traits = ['2x'];
    const wrapper = shallowMount(ImageAsset, {
      propsData: {
        variants: [
          {
            traits,
            url,
          },
        ],
        shouldCalculateOptimalWidth: false,
      },
    });
    const img = wrapper.find('img');
    img.trigger('load');
    await flushPromises();
    expect(img.attributes('width')).toBeFalsy();
  });

  it('logs an error when unable to calculate the optimal width for an image', async () => {
    const url = 'https://www.example.com/image.png';
    const traits = ['2x'];

    Object.defineProperty(HTMLImageElement.prototype, 'currentSrc', {
      get: () => url,
    });

    Object.defineProperty(Image.prototype, 'onerror', {
      get() {
        return this.$onerror;
      },
      set(fn) {
        this.$onerror = fn;
        this.$onerror(); // simulate an immediate error
      },
    });

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const wrapper = shallowMount(ImageAsset, {
      propsData: {
        variants: [
          {
            traits,
            url,
          },
        ],
      },
    });

    const img = wrapper.find('img');
    expect(img.attributes('src')).toBe(url);
    expect(img.attributes('srcset')).toBe(`${url} 2x`);
    expect(img.attributes('width')).toBeFalsy();
    expect(img.attributes('height')).toBeFalsy();

    img.trigger('load');
    await flushPromises();
    expect(img.attributes('width')).toBeFalsy();
    expect(img.attributes('height')).toBeFalsy();
    expect(console.error).toHaveBeenCalledWith('Unable to calculate optimal image width');

    consoleSpy.mockRestore();
  });
});
