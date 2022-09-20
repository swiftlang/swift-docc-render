import OnThisPageRegistrator from '@/components/DocumentationTopic/OnThisPageRegistrator.vue';
import { shallowMount } from '@vue/test-utils';
import { SectionKind } from '@/constants/PrimaryContentSection';
import onThisPageSectionsStoreBase from '@/stores/OnThisPageSectionsStoreBase';

const defaultProps = {
  topicData: {
    primaryContentSections: [
      {
        kind: SectionKind.content,
        content: [
          {
            type: 'heading',
            level: 2,
            text: 'Heading Level 2',
          },
          {
            type: 'text',
            text: 'Some Content',
          },
          {
            type: 'heading',
            level: 4,
            text: 'Heading Level 4',
          },
        ],
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
    const wrapper = createWrapper();
  });

  it('watches for changes, clears the store and extracts sections again', () => {

  });

  it('only stores headings up to level 3', () => {

  });

  it('anchorises heading titles, if no anchor provided', () => {

  });
});
