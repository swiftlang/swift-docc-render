/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/
import { TopicTypes } from 'docc-render/constants/TopicTypes';
import { TopicRole } from 'docc-render/constants/roles';

export const HeroColors = {
  blue: 'blue',
  teal: 'teal',
  orange: 'orange',
  purple: 'purple',
  green: 'green',
  sky: 'sky',
  pink: 'pink',
};

export const HeroColorsMap = {
  [TopicTypes.article]: HeroColors.teal,
  [TopicTypes.init]: HeroColors.blue,
  [TopicTypes.case]: HeroColors.orange,
  [TopicTypes.class]: HeroColors.purple,
  [TopicTypes.collection]: HeroColors.pink,
  [TopicRole.collectionGroup]: HeroColors.teal,
  [TopicTypes.dictionarySymbol]: HeroColors.purple,
  [TopicTypes.enum]: HeroColors.orange,
  [TopicTypes.extension]: HeroColors.orange,
  [TopicTypes.func]: HeroColors.green,
  [TopicTypes.op]: HeroColors.green,
  [TopicTypes.httpRequest]: HeroColors.green,
  [TopicTypes.module]: HeroColors.sky,
  [TopicTypes.method]: HeroColors.blue,
  [TopicTypes.macro]: HeroColors.pink,
  [TopicTypes.protocol]: HeroColors.purple,
  [TopicTypes.property]: HeroColors.teal,
  [TopicTypes.propertyListKey]: HeroColors.green,
  [TopicTypes.propertyListKeyReference]: HeroColors.green,
  [TopicTypes.sampleCode]: HeroColors.purple,
  [TopicTypes.struct]: HeroColors.purple,
  [TopicTypes.subscript]: HeroColors.blue,
  [TopicTypes.typealias]: HeroColors.orange,
  [TopicTypes.union]: HeroColors.purple,
  [TopicTypes.var]: HeroColors.purple,
};
