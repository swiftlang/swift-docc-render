/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

/**
 * Utility functions for working with Assets
 */
import { baseUrl } from 'docc-render/utils/theme-settings';

/**
 * Separate array of variants by light/dark mode
 * @param {array} variants
 * @returns {{ light: [], dark: [] }}
 */
export function separateVariantsByAppearance(variants) {
  return variants.reduce((values, variant) => {
    if (variant.traits.includes('dark')) {
      values.dark.push(variant);
    } else {
      values.light.push(variant);
    }
    return values;
  }, { light: [], dark: [] });
}

/**
 * Splits asset variants by pixel density.
 * Most often used after separating assets by appearance {@see separateVariantsByAppearance}
 * @param {array} variants
 * @returns {{ density: string, src: string, size: string }[]}
 */
export function extractDensities(variants) {
  const pixelDensities = ['1x', '2x', '3x'];
  // Create a list of image souces for each pixel density from 1x to 3x (in that order).
  return pixelDensities.reduce((list, pixelDensity) => {
    const variant = variants.find(v => v.traits.includes(pixelDensity));
    if (variant) {
      return list.concat({
        density: pixelDensity,
        src: variant.url,
        size: variant.size,
      });
    }

    return list;
  }, []);
}

/**
 * Joins two URL paths, normalizing slashes, so we dont have double slashes.
 * Does not work with actual URLs.
 * @param {Array} parts - list of paths to join.
 * @return {String}
 */
export function pathJoin(parts) {
  const separator = '/';
  const replace = new RegExp(`${separator}+`, 'g');
  return parts.join(separator).replace(replace, separator);
}

/**
 * Normalizes asset urls, by prefixing the baseUrl path to them.
 * @param {String} url
 * @return {String}
 */
export function normalizeAssetUrl(url) {
  if (!url || typeof url !== 'string' || url.startsWith(baseUrl) || !url.startsWith('/')) {
    return url;
  }
  return pathJoin([baseUrl, url]);
}

/**
 * Transforms a URL string into a normalized css `url(/path)` format.
 * @param {String} url
 * @returns {string|undefined}
 */
export function toCSSUrl(url) { return url ? `url('${normalizeAssetUrl(url)}')` : undefined; }

/**
 * Loads an image and gets its dimensions
 * @param {String} src
 * @returns {Promise<{width: Number, height: Number}>}
 */
export function getIntrinsicDimensions(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onerror = reject;
    img.onload = () => resolve({
      width: img.width,
      height: img.height,
    });
  });
}
