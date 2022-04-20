/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

export const TopicTypes = {
  article: 'article',
  associatedtype: 'associatedtype',
  buildSetting: 'buildSetting',
  case: 'case',
  collection: 'collection',
  class: 'class',
  container: 'container',
  dictionarySymbol: 'dictionarySymbol',
  enum: 'enum',
  extension: 'extension',
  func: 'func',
  groupMarker: 'groupMarker',
  httpRequest: 'httpRequest',
  init: 'init',
  languageGroup: 'languageGroup',
  learn: 'learn',
  macro: 'macro',
  method: 'method',
  module: 'module',
  op: 'op',
  overview: 'overview',
  project: 'project',
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
  typealias: 'typealias',
  union: 'union',
  var: 'var',
};

export const TopicTypeAliases = {
  [TopicTypes.init]: TopicTypes.method,
  [TopicTypes.case]: TopicTypes.enum,
  [TopicTypes.propertyListKeyReference]: TopicTypes.propertyListKey,
  [TopicTypes.project]: TopicTypes.tutorial,
};
