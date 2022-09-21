/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import OnThisPageRegistrator from '@/components/DocumentationTopic/OnThisPageRegistrator.vue';
import { shallowMount } from '@vue/test-utils';
import { SectionKind } from '@/constants/PrimaryContentSection';
import onThisPageSectionsStoreBase from '@/stores/OnThisPageSectionsStoreBase';

const contentSections = [
  {
    type: 'heading',
    level: 2,
    text: 'Heading Level 2',
    anchor: 'provided-heading-anchor',
  },
  {
    type: 'text',
    text: 'Some Content',
  },
  {
    type: 'heading',
    level: 3,
    text: 'Heading Level 3',
  },
  {
    type: 'heading',
    level: 4,
    text: 'Heading Level 4',
  },
];

const defaultProps = {
  topicData: {
    primaryContentSections: [
      {
        kind: SectionKind.content,
        content: contentSections,
      }, {
        kind: SectionKind.properties,
        title: 'Properties Title',
      }, {
        kind: SectionKind.restBody,
        title: 'restBody Title',
      }, {
        kind: SectionKind.restCookies,
        title: 'restCookies Title',
      }, {
        kind: SectionKind.restEndpoint,
        title: 'restEndpoint Title',
      }, {
        kind: SectionKind.restHeaders,
        title: 'restHeaders Title',
      }, {
        kind: SectionKind.restParameters,
        title: 'restParameters Title',
      }, {
        kind: SectionKind.restResponses,
        title: 'restResponses Title',
      }, {
        kind: SectionKind.declarations,
        content: ['foo'],
      }, {
        kind: SectionKind.details,
        content: ['foo'],
      }, {
        kind: SectionKind.parameters,
        content: ['foo'],
      }, {
        kind: SectionKind.possibleValues,
        content: ['foo'],
      },
    ],
    topicSections: [],
    defaultImplementations: [],
    relationshipsSections: [],
    seeAlsoSections: [],
  },
};

const createWrapper = ({ propsData, ...others } = {}) => shallowMount(OnThisPageRegistrator, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  provide: { store: onThisPageSectionsStoreBase },
  ...others,
});

describe('OnThisPageRegistrator', () => {
  beforeEach(() => {
    onThisPageSectionsStoreBase.resetPageSections();
  });

  it('extracts the sections from the JSON', () => {
    createWrapper();
    expect(onThisPageSectionsStoreBase.state.onThisPageSections).toMatchSnapshot();
  });

  it('only stores headings up to level 3, anchorising `title` if no `anchor` is provided', () => {
    createWrapper({
      propsData: {
        topicData: {
          primaryContentSections: [
            {
              kind: SectionKind.content,
              content: [
                ...contentSections,
                {
                  type: 'heading',
                  level: 5,
                  text: 'Heading Level 5',
                },
              ],
            },
          ],
        },
      },
    });
    expect(onThisPageSectionsStoreBase.state.onThisPageSections).toEqual([
      {
        anchor: 'provided-heading-anchor',
        level: 2,
        title: 'Heading Level 2',
      },
      {
        anchor: 'heading-level-3',
        level: 3,
        title: 'Heading Level 3',
      },
    ]);
  });

  it('watches for changes, clears the store and extracts sections again', () => {
    const wrapper = createWrapper();
    expect(onThisPageSectionsStoreBase.state.onThisPageSections).toHaveLength(16);
    wrapper.setProps({
      topicData: {
        primaryContentSections: [
          {
            kind: SectionKind.content,
            content: contentSections,
          },
        ],
      },
    });
    expect(onThisPageSectionsStoreBase.state.onThisPageSections).toHaveLength(2);
  });
});
