<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div />
</template>

<script>
import { SectionKind } from '@/constants/PrimaryContentSection';
import { anchorize } from '@/utils/strings';
import {
  MainContentSectionAnchors,
  PrimaryContentSectionAnchors,
} from '@/constants/ContentSectionAnchors';

export default {
  name: 'OnThisPageRegistrator',
  inject: ['store'],
  props: {
    topicData: {
      type: Object,
      required: true,
    },
  },
  watch: {
    topicData: {
      immediate: true,
      handler: 'extractOnThisPageSections',
    },
  },
  methods: {
    extractOnThisPageSections(topicData) {
      if (!topicData) return;
      // unregister old items
      this.store.resetPageSections();
      // register new ones
      const {
        primaryContentSections,
        topicSections,
        defaultImplementationsSections,
        relationshipsSections,
        seeAlsoSections,
      } = topicData;
      if (primaryContentSections) {
        primaryContentSections.forEach((section) => {
          switch (section.kind) {
          case SectionKind.content:
            section.content.forEach((subSection) => {
              if (subSection.type === 'heading' && subSection.level < 4) {
                this.store.addOnThisPageSection({
                  title: subSection.text,
                  anchor: subSection.anchor || anchorize(subSection.text),
                  level: subSection.level,
                });
              }
            });
            break;
          case SectionKind.properties:
          case SectionKind.restBody:
          case SectionKind.restCookies:
          case SectionKind.restEndpoint:
          case SectionKind.restHeaders:
          case SectionKind.restParameters:
          case SectionKind.restResponses:
            this.store.addOnThisPageSection({
              title: section.title, anchor: anchorize(section.title), level: 2,
            });
            break;
          default:
            this.store.addOnThisPageSection(PrimaryContentSectionAnchors[section.kind]);
          }
        });
      }
      if (topicSections) {
        this.store.addOnThisPageSection(MainContentSectionAnchors.topics);
      }
      if (defaultImplementationsSections) {
        this.store.addOnThisPageSection(MainContentSectionAnchors.defaultImplementations);
      }
      if (relationshipsSections) {
        this.store.addOnThisPageSection(MainContentSectionAnchors.relationships);
      }
      if (seeAlsoSections) {
        this.store.addOnThisPageSection(MainContentSectionAnchors.seeAlso);
      }
    },
  },
};
</script>
