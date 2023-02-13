/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import SwiftDocCRenderPlugin from './src/setup-utils/SwiftDocCRenderPlugin';
import createRouterInstance from './src/setup-utils/SwiftDocCRenderRouter';
import createi18nInstance from './src/setup-utils/SwiftDocCRenderi18n';
import defaultRoutes from './src/routes';

export {
  SwiftDocCRenderPlugin, createRouterInstance, createi18nInstance, defaultRoutes,
};
