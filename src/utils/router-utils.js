/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import {
  baseNavHeight,
  baseNavHeightSmallBreakpoint,
} from 'docc-render/constants/nav';
import { documentationTopicName } from 'docc-render/constants/router';
import { BreakpointAttributes } from 'docc-render/utils/breakpoints';
import { waitFrames } from 'docc-render/utils/loading';
import { cssEscapeTopicIdHash } from 'docc-render/utils/strings';
import { areEquivalentLocations } from 'docc-render/utils/url-helper';
import getExtraScrollOffset from 'theme/utils/scroll-offset.js';

/**
 * Returns the current absolute location, eg: '/tutorials/swiftui/something'
 * @returns {string}
 */
export function getCurrentLocation() {
  const { location } = window;
  return location.pathname + location.search + location.hash;
}

function getBaseNavOffset() {
  const viewportWidth = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0,
  );
  return viewportWidth < BreakpointAttributes.nav.small.maxWidth
    ? baseNavHeightSmallBreakpoint
    : baseNavHeight;
}

export async function scrollBehavior(to, from, savedPosition) {
  if (savedPosition) {
    // Wait until the page has been rendered, then scroll to the saved
    // position. If we resolve too early, `savedPosition.y` could be
    // outside the bounds of the app's non-rendered page, which is
    // header + loading-placeholder + footer. This would result in the
    // browser displaying the top of the page and no scrolling to occur.
    await this.app.$nextTick();
    return savedPosition;
  }
  if (to.hash) {
    const { name, query, hash } = to;
    const isDocumentation = name.includes(documentationTopicName);
    const hasNavBarOpen = !!query.changes;
    const baseNavOffset = getBaseNavOffset();
    // if on docs and have API changes enabled
    const apiChangesNavHeight = (isDocumentation && hasNavBarOpen) ? baseNavOffset : 0;
    // compensate for the nav sticky height and add any extra scroll offset we may need
    const offset = baseNavOffset + apiChangesNavHeight + getExtraScrollOffset(to);

    const y = process.env.VUE_APP_TARGET === 'ide' ? 0 : offset;
    return { selector: cssEscapeTopicIdHash(hash), offset: { x: 0, y } };
  }
  if (areEquivalentLocations(to, from)) {
    // Do not change the scroll position if the location hasn't changed.
    return false;
  }
  return { x: 0, y: 0 };
}

export async function restoreScrollOnReload() {
  let scrollPosition = window.sessionStorage.getItem('scrollPosition');
  if (!scrollPosition) return;
  try {
    scrollPosition = JSON.parse(scrollPosition);
  } catch (err) {
    console.error('Error parsing scrollPosition from sessionStorage', err);
    return;
  }

  // in case any guard redirect somewhere else on initial navigation
  // we must ensure we are on the same page before the reload
  if (getCurrentLocation() === scrollPosition.location) {
    // one tick for the page to render
    // a second tick for the data to be rendered
    await waitFrames(2);
    window.scrollTo(scrollPosition.x, scrollPosition.y);
  }
}

export function saveScrollOnReload() {
  // avoid saving a location if an explicit hash selector is provided
  if (window.location.hash) return;
  sessionStorage.setItem(
    'scrollPosition',
    JSON.stringify({
      x: window.pageXOffset,
      y: window.pageYOffset,
      location: getCurrentLocation(),
    }),
  );
}
