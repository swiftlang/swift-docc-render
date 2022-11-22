/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { SectionKind } from 'docc-render/constants/PrimaryContentSection';
import { anchorize } from 'docc-render/utils/strings';
import { BlockType } from 'docc-render/components/ContentNode.vue';
import {
  MainContentSectionAnchors,
  PrimaryContentSectionAnchors,
} from 'docc-render/constants/ContentSectionAnchors';
import ContentNode from 'docc-render/components/DocumentationTopic/ContentNode.vue';
import { AppTopID } from 'docc-render/constants/AppTopID';

/**
 * Crawls the `topicData` of a page, and extracts onThisPage sections.
 */
export default {
  watch: {
    topicData: {
      immediate: true,
      handler: 'extractOnThisPageSections',
    },
  },
  methods: {
    shouldRegisterContentSection(subSection) {
      return subSection.type === BlockType.heading && subSection.level < 4;
    },
    extractOnThisPageSections(topicData) {
      if (!topicData) return;
      // unregister old items
      this.store.resetPageSections();
      // register new ones
      const {
        metadata: { title },
        primaryContentSections,
        topicSections,
        defaultImplementationsSections,
        relationshipsSections,
        seeAlsoSections,
      } = topicData;
      this.store.addOnThisPageSection({
        title,
        anchor: AppTopID,
        level: 1,
      });
      if (primaryContentSections) {
        primaryContentSections.forEach((section) => {
          switch (section.kind) {
          case SectionKind.content:
            // call the ContentNode foreach method, passing the section as context
            ContentNode.methods.forEach.call(section, (subSection) => {
              if (this.shouldRegisterContentSection(subSection)) {
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
