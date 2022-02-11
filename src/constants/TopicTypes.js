/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

export const TopicTypes = {
  article: 'article',
  associatedtype: 'associatedtype',
  buildSetting: 'buildSetting',
  class: 'class',
  container: 'container',
  dictionarySymbol: 'dictionarySymbol',
  enum: 'enum',
  enumCase: 'enum.case',
  extension: 'extension',
  func: 'func',
  funcOp: 'func.op',
  operator: 'op',
  groupMarker: 'groupMarker',
  httpRequest: 'httpRequest',
  init: 'init',
  languageGroup: 'languageGroup',
  learn: 'learn',
  macro: 'macro',
  method: 'method',
  module: 'module',
  overview: 'overview',
  property: 'property',
  propertyListKey: 'propertyListKey',
  propertyListKeyReference: 'propertyListKeyReference',
  protocol: 'protocol',
  resources: 'resources',
  root: 'root',
  sampleCode: 'sampleCode',
  section: 'section',
  struct: 'struct',
  subscript: 'subscript',
  symbol: 'symbol',
  tutorial: 'tutorial',
  typeMethod: 'type.method',
  typeProperty: 'type.property',
  typealias: 'typealias',
  union: 'union',
  var: 'var',
};

export const TopicTypeAliases = {
  [TopicTypes.init]: TopicTypes.method,
  [TopicTypes.typeMethod]: TopicTypes.method,
  [TopicTypes.typeProperty]: TopicTypes.property,
  [TopicTypes.enumCase]: TopicTypes.enum,
  [TopicTypes.operator]: TopicTypes.funcOp,
  [TopicTypes.propertyListKeyReference]: TopicTypes.propertyListKey,
};

export const TopicTypeColors = {
  blue: 'blue',
  teal: 'teal',
  orange: 'orange',
  purple: 'purple',
  green: 'green',
  sky: 'sky',
  pink: 'pink',
};

export const TopicTypeColorsMap = {
  [TopicTypes.init]: TopicTypeColors.blue,
  [TopicTypes.typeMethod]: TopicTypeColors.blue,
  [TopicTypes.typeProperty]: TopicTypeColors.teal,
  [TopicTypes.enumCase]: TopicTypeColors.orange,
  [TopicTypes.class]: TopicTypeColors.purple,
  [TopicTypes.dictionarySymbol]: TopicTypeColors.purple,
  [TopicTypes.enum]: TopicTypeColors.orange,
  [TopicTypes.extension]: TopicTypeColors.orange,
  [TopicTypes.func]: TopicTypeColors.green,
  [TopicTypes.funcOp]: TopicTypeColors.green,
  [TopicTypes.operator]: TopicTypeColors.green,
  [TopicTypes.httpRequest]: TopicTypeColors.green,
  [TopicTypes.module]: TopicTypeColors.sky,
  [TopicTypes.method]: TopicTypeColors.blue,
  [TopicTypes.macro]: TopicTypeColors.pink,
  [TopicTypes.protocol]: TopicTypeColors.purple,
  [TopicTypes.property]: TopicTypeColors.teal,
  [TopicTypes.propertyListKey]: TopicTypeColors.green,
  [TopicTypes.propertyListKeyReference]: TopicTypeColors.green,
  [TopicTypes.struct]: TopicTypeColors.purple,
  [TopicTypes.subscript]: TopicTypeColors.blue,
  [TopicTypes.typealias]: TopicTypeColors.orange,
  [TopicTypes.union]: TopicTypeColors.purple,
  [TopicTypes.var]: TopicTypeColors.purple,
};
