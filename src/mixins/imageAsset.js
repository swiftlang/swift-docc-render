/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { extractDensities, separateVariantsByAppearance } from 'docc-render/utils/assets';

export default {
  props: {
    variants: {
      type: Array,
      required: true,
    },
  },
  computed: {
    variantsGroupedByAppearance() {
      return separateVariantsByAppearance(this.variants);
    },
    lightVariants() {
      return extractDensities(this.variantsGroupedByAppearance.light);
    },
    darkVariants() {
      return extractDensities(this.variantsGroupedByAppearance.dark);
    },
  },
};
