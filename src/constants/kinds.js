/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

// eslint-disable-next-line import/prefer-default-export
export const TopicKind = {
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

export const TopicKindAliases = {
  [TopicKind.init]: TopicKind.method,
  [TopicKind.typeMethod]: TopicKind.method,
  [TopicKind.typeProperty]: TopicKind.property,
  [TopicKind.enumCase]: TopicKind.enum,
  [TopicKind.operator]: TopicKind.funcOp,
  [TopicKind.propertyListKeyReference]: TopicKind.propertyListKey,
};

export const TopicKindColors = {
  blue: 'blue',
  teal: 'teal',
  orange: 'orange',
  purple: 'purple',
  green: 'green',
  sky: 'sky',
  pink: 'pink',
};

export const TopicKindColorsMap = {
  [TopicKind.article]: TopicKindColors.teal,
  [TopicKind.init]: TopicKindColors.blue,
  [TopicKind.typeMethod]: TopicKindColors.blue,
  [TopicKind.typeProperty]: TopicKindColors.teal,
  [TopicKind.enumCase]: TopicKindColors.orange,
  [TopicKind.class]: TopicKindColors.purple,
  [TopicKind.dictionarySymbol]: TopicKindColors.purple,
  [TopicKind.enum]: TopicKindColors.orange,
  [TopicKind.extension]: TopicKindColors.orange,
  [TopicKind.func]: TopicKindColors.green,
  [TopicKind.funcOp]: TopicKindColors.green,
  [TopicKind.operator]: TopicKindColors.green,
  [TopicKind.httpRequest]: TopicKindColors.green,
  [TopicKind.module]: TopicKindColors.sky,
  [TopicKind.method]: TopicKindColors.blue,
  [TopicKind.macro]: TopicKindColors.pink,
  [TopicKind.protocol]: TopicKindColors.purple,
  [TopicKind.property]: TopicKindColors.teal,
  [TopicKind.propertyListKey]: TopicKindColors.green,
  [TopicKind.propertyListKeyReference]: TopicKindColors.green,
  [TopicKind.struct]: TopicKindColors.purple,
  [TopicKind.subscript]: TopicKindColors.blue,
  [TopicKind.typealias]: TopicKindColors.orange,
  [TopicKind.union]: TopicKindColors.purple,
  [TopicKind.var]: TopicKindColors.purple,
};
