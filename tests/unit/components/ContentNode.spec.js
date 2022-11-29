/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount, mount } from '@vue/test-utils';
import Aside from 'docc-render/components/ContentNode/Aside.vue';
import CodeListing from 'docc-render/components/ContentNode/CodeListing.vue';
import CodeVoice from 'docc-render/components/ContentNode/CodeVoice.vue';
import ContentNode from 'docc-render/components/ContentNode.vue';
import DictionaryExample from 'docc-render/components/ContentNode/DictionaryExample.vue';
import EndpointExample from 'docc-render/components/ContentNode/EndpointExample.vue';
import Figure from 'docc-render/components/ContentNode/Figure.vue';
import FigureCaption from 'docc-render/components/ContentNode/FigureCaption.vue';
import InlineImage from 'docc-render/components/ContentNode/InlineImage.vue';
import Reference from 'docc-render/components/ContentNode/Reference.vue';
import Table from 'docc-render/components/ContentNode/Table.vue';
import LinkableHeading from 'docc-render/components/ContentNode/LinkableHeading.vue';
import StrikeThrough from 'docc-render/components/ContentNode/StrikeThrough.vue';
import Small from '@/components/ContentNode/Small.vue';
import BlockVideo from '@/components/ContentNode/BlockVideo.vue';
import Row from '@/components/ContentNode/Row.vue';
import Column from '@/components/ContentNode/Column.vue';
import TabNavigator from '@/components/ContentNode/TabNavigator.vue';
import TaskList from 'docc-render/components/ContentNode/TaskList.vue';
import { TopicSectionsStyle } from '@/constants/TopicSectionsStyle';
import LinksBlock from '@/components/ContentNode/LinksBlock.vue';

const { TableHeaderStyle, TableColumnAlignments } = ContentNode.constants;

const mountWithContent = (content = [], provide = { references: {} }) => (
  shallowMount(ContentNode, {
    propsData: { content },
    provide,
  })
);

const mountWithItem = (item, references) => mountWithContent([item], { references });

describe('ContentNode', () => {
  it('renders a div.content wrapper', () => {
    const wrapper = mountWithContent([]);

    const content = wrapper.find('div.content');
    expect(content.exists()).toBe(true);
    expect(content.isEmpty()).toBe(true);
  });

  describe('with type="aside"', () => {
    it('renders an `Aside`', () => {
      const wrapper = mountWithItem({
        type: 'aside',
        style: 'note',
        name: 'Custom Name',
        content: [
          {
            type: 'paragraph',
            inlineContent: [
              {
                type: 'text',
                text: 'foobar',
              },
            ],
          },
        ],
      });

      const aside = wrapper.find('.content').find(Aside);
      expect(aside.exists()).toBe(true);
      expect(aside.props('kind')).toBe('note');
      expect(aside.props('name')).toBe('Custom Name');

      const paragraph = aside.find('p');
      expect(paragraph.exists()).toBe(true);
      expect(paragraph.text()).toBe('foobar');
    });
  });

  describe('with type="codeListing"', () => {
    const listing = {
      type: 'codeListing',
      syntax: 'swift',
      fileType: 'swift',
      code: ['foobar'],
    };

    it('renders a `CodeListing`', () => {
      const wrapper = mountWithItem(listing);

      const codeListing = wrapper.find('.content').find(CodeListing);
      expect(codeListing.exists()).toBe(true);
      expect(codeListing.props('syntax')).toBe(listing.syntax);
      expect(codeListing.props('fileType')).toBe(listing.fileType);
      expect(codeListing.props('content')).toEqual(listing.code);
      expect(codeListing.isEmpty()).toBe(true);
    });

    it('renders a `Figure`/`Figcaption` with metadata', () => {
      const metadata = {
        anchor: '42',
        title: 'Listing 42',
        abstract: [{
          type: 'paragraph',
          inlineContent: [{ type: 'text', text: 'blah' }],
        }],
      };
      const wrapper = mountWithItem({ ...listing, metadata });

      const figure = wrapper.find(Figure);
      expect(figure.exists()).toBe(true);
      expect(figure.props('anchor')).toBe(metadata.anchor);
      expect(figure.contains(CodeListing)).toBe(true);

      const caption = figure.find(FigureCaption);
      expect(caption.exists()).toBe(true);
      expect(caption.props('title')).toBe(metadata.title);
      expect(caption.contains('p')).toBe(true);
      expect(caption.text()).toContain('blah');
    });
  });

  describe('with type="endpointExample"', () => {
    it('renders an `EndpointExample`', () => {
      const request = {
        content: [
          {
            collapsible: false,
            code: ['GET /foo'],
          },
        ],
      };
      const response = {
        content: [
          {
            collapsible: false,
            code: ['GET /bar'],
          },
        ],
      };
      const wrapper = mountWithItem({
        type: ContentNode.BlockType.endpointExample,
        request,
        response,
        summary: [{
          type: 'paragraph',
          inlineContent: [{ type: 'text', text: 'An example of a dictionary.' }],
        }],
      });

      const example = wrapper.find(EndpointExample);
      expect(example.exists()).toBe(true);
      expect(example.props()).toEqual({ request, response });
      expect(example.text()).toContain('An example of a dictionary.');
    });
  });

  describe('with type="heading"', () => {
    it('renders a <h*>', () => {
      for (let level = 1; level <= 6; level += 1) {
        const wrapper = mountWithItem({
          type: 'heading',
          anchor: 'heading',
          level,
          text: 'heading',
        });

        const sectionTitle = wrapper.find('.content').find(LinkableHeading);
        expect(sectionTitle.exists()).toBe(true);
        expect(sectionTitle.props('level')).toBe(level);
        expect(sectionTitle.attributes('anchor')).toBe('heading');
        expect(sectionTitle.isEmpty()).toBe(false);
        expect(sectionTitle.text()).toContain('heading');
      }
    });
  });

  describe('with type="orderedList"', () => {
    it('renders an <ol> with <li> items', () => {
      const wrapper = mountWithItem({
        type: 'orderedList',
        items: [
          {
            content: [
              {
                type: 'paragraph',
                inlineContent: [
                  {
                    type: 'text',
                    text: 'foo',
                  },
                ],
              },
            ],
          },
          {
            content: [
              {
                type: 'paragraph',
                inlineContent: [
                  {
                    type: 'text',
                    text: 'bar',
                  },
                ],
              },
            ],
          },
        ],
      });

      const list = wrapper.find('.content ol');
      expect(list.exists()).toBe(true);
      expect(list.attributes('start')).toBeUndefined();

      const items = list.findAll('li');
      expect(items.length).toBe(2);
      expect(items.at(0).find('p').text()).toBe('foo');
      expect(items.at(1).find('p').text()).toBe('bar');
    });

    it('renders an <ol> with <li> items and a custom start index', () => {
      const wrapper = mountWithItem({
        type: 'orderedList',
        start: 2,
        items: [
          {
            content: [
              {
                type: 'paragraph',
                inlineContent: [
                  {
                    type: 'text',
                    text: 'foo',
                  },
                ],
              },
            ],
          },
          {
            content: [
              {
                type: 'paragraph',
                inlineContent: [
                  {
                    type: 'text',
                    text: 'bar',
                  },
                ],
              },
            ],
          },
        ],
      });

      const list = wrapper.find('.content ol');
      expect(list.exists()).toBe(true);
      expect(list.attributes('start')).toBe('2');

      const items = list.findAll('li');
      expect(items.length).toBe(2);
      expect(items.at(0).find('p').text()).toBe('foo');
      expect(items.at(1).find('p').text()).toBe('bar');
    });
  });

  describe('with type="paragraph"', () => {
    it('renders a <p>', () => {
      const wrapper = mountWithItem({
        type: 'paragraph',
        inlineContent: [
          {
            type: 'text',
            text: 'foobar',
          },
        ],
      });

      const paragraph = wrapper.find('.content p');
      expect(paragraph.exists()).toBe(true);
      expect(paragraph.text()).toBe('foobar');
      expect(paragraph.classes()).toHaveLength(0);
    });

    it('renders a `<p> with a special class, if it has a single image inside', () => {
      const references = {
        'figure1.png': {
          variants: [
            {
              traits: ['3x', 'light'],
              url: '',
              size: { width: 1202, height: 630 },
            },
          ],
        },
      };

      const wrapper = mountWithItem({
        type: 'paragraph',
        inlineContent: [
          {
            type: 'image',
            identifier: 'figure1.png',
          },
        ],
      }, references);

      const paragraph = wrapper.find('.content p');
      expect(paragraph.classes()).toContain('inline-image-container');
      const inlineImage = paragraph.find(InlineImage);
      expect(inlineImage.exists()).toBe(true);
    });
  });

  describe('with type="unorderedList"', () => {
    it('renders a <ul> with <li> items', () => {
      const wrapper = mountWithItem({
        type: 'unorderedList',
        items: [
          {
            content: [
              {
                type: 'paragraph',
                inlineContent: [
                  {
                    type: 'text',
                    text: 'foo',
                  },
                ],
              },
            ],
          },
          {
            content: [
              {
                type: 'paragraph',
                inlineContent: [
                  {
                    type: 'text',
                    text: 'bar',
                  },
                ],
              },
            ],
          },
        ],
      });

      const list = wrapper.find('.content ul');
      expect(list.exists()).toBe(true);

      const items = list.findAll('li');
      expect(items.length).toBe(2);
      expect(items.at(0).find('p').text()).toBe('foo');
      expect(items.at(1).find('p').text()).toBe('bar');
    });

    it('renders a `TaskList` for checked items', () => {
      const items = [
        {
          checked: true,
          content: [
            {
              type: 'paragraph',
              inlineContent: [
                {
                  type: 'text',
                  text: 'foo',
                },
              ],
            },
          ],
        },
        {
          checked: false,
          content: [
            {
              type: 'paragraph',
              inlineContent: [
                {
                  type: 'text',
                  text: 'bar',
                },
              ],
            },
          ],
        },
      ];
      const wrapper = mount(ContentNode, {
        propsData: {
          content: [
            {
              type: 'unorderedList',
              items,
            },
          ],
        },
      });

      const list = wrapper.find(TaskList);
      expect(list.exists()).toBe(true);
      expect(list.props('tasks')).toEqual(items);

      const paragraphs = list.findAll('li p');
      expect(paragraphs.length).toBe(items.length);
      expect(paragraphs.at(0).text()).toBe('foo');
      expect(paragraphs.at(1).text()).toBe('bar');
    });
  });

  describe('with type="small"', () => {
    it('renders a `<Small>`', () => {
      const wrapper = mountWithItem({
        type: 'small',
        inlineContent: [
          {
            type: 'text',
            text: 'foo',
          },
        ],
      });
      const paragraph = wrapper.find('p');
      const small = paragraph.find(Small);
      expect(small.exists()).toBe(true);
      expect(small.text()).toBe('foo');
    });
  });

  describe('with type="row"', () => {
    it('renders a `<Row>` and `<Column>`', () => {
      const wrapper = mountWithItem({
        type: 'row',
        numberOfColumns: 4,
        columns: [
          {
            size: 2,
            content: [
              {
                type: 'paragraph',
                inlineContent: [
                  {
                    type: 'text',
                    text: 'foo',
                  },
                ],
              },
            ],
          },
          {
            content: [
              {
                type: 'paragraph',
                inlineContent: [
                  {
                    type: 'text',
                    text: 'bar',
                  },
                ],
              },
            ],
          },
        ],
      });
      const grid = wrapper.find(Row);
      expect(grid.props()).toEqual({
        columns: { large: 4 },
      });
      const columns = grid.findAll(Column);
      expect(columns).toHaveLength(2);
      expect(columns.at(0).props()).toEqual({ span: 2 });
      expect(columns.at(0).find('p').text()).toBe('foo');
      expect(columns.at(1).props()).toEqual({ span: null });
      expect(columns.at(1).find('p').text()).toBe('bar');
    });
    it('renders a `<Row>` without column count specified', () => {
      const wrapper = mountWithItem({
        type: 'row',
        columns: [
          {
            size: 2,
            content: [
              {
                type: 'paragraph',
                inlineContent: [
                  {
                    type: 'text',
                    text: 'foo',
                  },
                ],
              },
            ],
          },
          {
            content: [
              {
                type: 'paragraph',
                inlineContent: [
                  {
                    type: 'text',
                    text: 'bar',
                  },
                ],
              },
            ],
          },
        ],
      });
      const grid = wrapper.find(Row);
      expect(grid.props()).toEqual({
        columns: undefined,
      });
      const columns = grid.findAll(Column);
      expect(columns).toHaveLength(2);
      expect(columns.at(0).props()).toEqual({ span: 2 });
      expect(columns.at(0).find('p').text()).toBe('foo');
      expect(columns.at(1).props()).toEqual({ span: null });
      expect(columns.at(1).find('p').text()).toBe('bar');
    });
  });

  describe('with type="tabNavigator"', () => {
    it('renders a `<TabNavigator>`', () => {
      const props = {
        type: 'tabNavigator',
        tabs: [
          {
            title: 'Foo',
            content: [
              {
                type: 'paragraph',
                inlineContent: [
                  {
                    type: 'text',
                    text: 'foo',
                  },
                ],
              },
            ],
          },
          {
            title: 'Bar',
            content: [
              {
                type: 'paragraph',
                inlineContent: [
                  {
                    type: 'text',
                    text: 'bar',
                  },
                ],
              },
            ],
          },
        ],
      };
      const wrapper = mountWithItem(props);
      const tabs = wrapper.find(TabNavigator);
      expect(tabs.props()).toEqual({
        titles: [props.tabs[0].title, props.tabs[1].title],
        position: 'start',
        vertical: false,
      });
      // assert we passed the correct scoped slots
      expect(tabs.vm.$scopedSlots).toEqual({
        Foo: expect.any(Function),
        Bar: expect.any(Function),
      });
    });

    it('renders a `<TabNavigator>` in vertcal mode, when tabs reach threshold', () => {
      const content = [
        {
          type: 'paragraph',
          inlineContent: [
            {
              type: 'text',
              text: 'foo',
            },
          ],
        },
      ];
      const props = {
        type: 'tabNavigator',
        tabs: [
          { title: '1', content },
          { title: '2', content },
          { title: '3', content },
          { title: '4', content },
          { title: '5', content },
          { title: '6', content },
        ],
      };
      const wrapper = mountWithItem(props);
      expect(wrapper.find(TabNavigator).props('vertical')).toBe(true);
    });
  });

  describe('with type="links"', () => {
    it('renders a `<LinksBlock>`', () => {
      const wrapper = mountWithItem({
        type: 'links',
        style: TopicSectionsStyle.compactGrid,
        items: [],
      });
      const links = wrapper.find(LinksBlock);
      expect(links.props()).toEqual({
        identifiers: [],
        blockStyle: TopicSectionsStyle.compactGrid,
      });
    });
  });

  describe('with type="codeVoice"', () => {
    it('renders a `CodeVoice`', () => {
      const wrapper = mountWithItem({
        type: 'codeVoice',
        code: 'fooBar',
      });

      const codeVoice = wrapper.find('.content').find(CodeVoice);
      expect(codeVoice.exists()).toBe(true);
      expect(codeVoice.text()).toBe('fooBar');
    });
  });

  describe('with type="emphasis"', () => {
    it('renders a <em>', () => {
      const wrapper = mountWithItem({
        type: 'emphasis',
        inlineContent: [
          {
            type: 'text',
            text: 'foobar',
          },
        ],
      });

      const em = wrapper.find('.content em');
      expect(em.exists()).toBe(true);
      expect(em.text()).toBe('foobar');
    });
  });

  describe('with type="newTerm"', () => {
    it('renders a <em>', () => {
      const wrapper = mountWithItem({
        type: 'newTerm',
        inlineContent: [
          {
            type: 'text',
            text: 'foobar',
          },
        ],
      });

      const em = wrapper.find('.content em');
      expect(em.exists()).toBe(true);
      expect(em.text()).toBe('foobar');
    });
  });

  describe('with type="image"', () => {
    const references = {
      'figure1.png': {
        variants: [
          {
            traits: ['3x', 'light'],
            url: '',
            size: { width: 1202, height: 630 },
          },
          {
            traits: ['2x', 'light'],
            url: '',
            size: { width: 1202, height: 630 },
          },
        ],
      },
    };

    it('renders an `InlineImage`', () => {
      const wrapper = mountWithItem({
        type: 'image',
        identifier: 'figure1.png',
      }, references);

      const inlineImage = wrapper.find('.content').find(InlineImage);
      expect(inlineImage.exists()).toBe(true);
      expect(inlineImage.props('variants').length).toBe(2);
    });

    it('does not crash with missing image reference data', () => {
      expect(() => mountWithItem({
        type: 'image',
        identifier: 'figure42.png',
      }, {})).not.toThrow();
    });

    it('renders a `Figure`/`FigureCaption` with metadata', () => {
      const metadata = {
        anchor: '42',
        title: 'Figure 42',
        abstract: [{
          type: 'paragraph',
          inlineContent: [{ type: 'text', text: 'blah' }],
        }],
      };
      const wrapper = mountWithItem({
        type: 'image',
        identifier: 'figure1.png',
        metadata,
      }, references);

      const figure = wrapper.find(Figure);
      expect(figure.exists()).toBe(true);
      expect(figure.props('anchor')).toBe(metadata.anchor);
      expect(figure.contains(InlineImage)).toBe(true);

      const caption = wrapper.find(FigureCaption);
      expect(caption.exists()).toBe(true);
      expect(caption.contains('p')).toBe(true);
      expect(caption.props('title')).toBe(metadata.title);
      expect(caption.text()).toContain('blah');
    });

    it('renders a `Figure`/`FigureCaption` without an anchor, with text under the image', () => {
      const metadata = {
        abstract: [{
          type: 'paragraph',
          inlineContent: [{ type: 'text', text: 'blah' }],
        }],
      };
      const wrapper = mountWithItem({
        type: 'image',
        identifier: 'figure1.png',
        metadata,
      }, references);

      const figure = wrapper.find(Figure);
      expect(figure.exists()).toBe(true);
      expect(figure.props('anchor')).toBeFalsy();
      expect(figure.contains(InlineImage)).toBe(true);

      const caption = wrapper.find(FigureCaption);
      expect(caption.exists()).toBe(true);
      expect(caption.contains('p')).toBe(true);
      expect(caption.props('title')).toBeFalsy();
      expect(caption.props('centered')).toBe(true);
      expect(caption.text()).toContain('blah');
      // assert figurerecaption is below the image
      expect(figure.html()).toMatchInlineSnapshot(`
        <figure-stub>
          <inlineimage-stub alt="" variants="[object Object],[object Object]"></inlineimage-stub>
          <figurecaption-stub centered="true">
            <p>blah</p>
          </figurecaption-stub>
        </figure-stub>
      `);
    });

    it('renders a `FigureCaption` before the image, if it has a title', () => {
      const metadata = {
        title: 'foo',
        abstract: [{
          type: 'paragraph',
          inlineContent: [{ type: 'text', text: 'blah' }],
        }],
      };
      const wrapper = mountWithItem({
        type: 'image',
        identifier: 'figure1.png',
        metadata,
      }, references);
      expect(wrapper.find(Figure).html()).toMatchInlineSnapshot(`
        <figure-stub>
          <figurecaption-stub title="foo">
            <p>blah</p>
          </figurecaption-stub>
          <inlineimage-stub alt="" variants="[object Object],[object Object]"></inlineimage-stub>
        </figure-stub>
      `);
    });

    it('renders no `FigureCaption`, if there is a `title`, but no `abstract`', () => {
      const metadata = {
        postTitle: true,
        title: 'Foo',
        anchor: 'foo-figure',
      };
      const wrapper = mountWithItem({
        type: 'image',
        identifier: 'figure1.png',
        metadata,
      }, references);

      const figure = wrapper.find(Figure);
      expect(figure.exists()).toBe(true);
      expect(figure.props('anchor')).toBe('foo-figure');
      expect(figure.contains(InlineImage)).toBe(true);

      expect(wrapper.find(FigureCaption).exists()).toBe(false);
    });
  });

  describe('with type="video"', () => {
    const identifier = 'video.mp4';
    const references = {
      [identifier]: {
        identifier,
        variants: [
          {
            traits: ['2x', 'light'],
            url: '',
            size: { width: 1202, height: 630 },
          },
        ],
      },
    };

    it('renders an `BlockVideo`', () => {
      const wrapper = mountWithItem({
        type: 'video',
        identifier,
      }, references);

      const inlineVideo = wrapper.find('.content').find(BlockVideo);
      expect(inlineVideo.exists()).toBe(true);
      expect(inlineVideo.props('identifier')).toEqual(identifier);
    });

    it('does not crash with missing video reference data', () => {
      expect(() => mountWithItem({
        type: 'video',
        identifier,
      }, {})).not.toThrow();
    });

    it('renders a `Figure`/`FigureCaption` with metadata', () => {
      const metadata = {
        anchor: 'foo',
        abstract: [{
          type: 'paragraph',
          inlineContent: [{ type: 'text', text: 'blah' }],
        }],
      };
      const wrapper = mountWithItem({
        type: 'video',
        identifier,
        metadata,
      }, references);

      const figure = wrapper.find(Figure);
      expect(figure.exists()).toBe(true);
      expect(figure.props('anchor')).toBe('foo');
      expect(figure.contains(BlockVideo)).toBe(true);

      const caption = wrapper.find(FigureCaption);
      expect(caption.exists()).toBe(true);
      expect(caption.contains('p')).toBe(true);
      expect(caption.props('title')).toBe(metadata.title);
      expect(caption.props('centered')).toBe(true);
      expect(caption.text()).toContain('blah');
    });

    it('renders a `Figure`/`FigureCaption` without an anchor, with text under the video', () => {
      const metadata = {
        abstract: [{
          type: 'paragraph',
          inlineContent: [{ type: 'text', text: 'blah' }],
        }],
      };
      const wrapper = mountWithItem({
        type: 'video',
        identifier,
        metadata,
      }, references);

      const figure = wrapper.find(Figure);
      expect(figure.exists()).toBe(true);
      expect(figure.props('anchor')).toBeFalsy();
      expect(figure.contains(BlockVideo)).toBe(true);

      const caption = wrapper.find(FigureCaption);
      expect(caption.exists()).toBe(true);
      expect(caption.contains('p')).toBe(true);
      expect(caption.props('title')).toBeFalsy();
      expect(caption.props('centered')).toBe(true);
      expect(caption.text()).toContain('blah');
      // assert figurerecaption is below the image
      expect(figure.html()).toMatchInlineSnapshot(`
        <figure-stub>
          <blockvideo-stub identifier="video.mp4"></blockvideo-stub>
          <figurecaption-stub centered="true">
            <p>blah</p>
          </figurecaption-stub>
        </figure-stub>
      `);
    });
  });

  describe('with type="link"', () => {
    it('renders a <a>', () => {
      const wrapper = mountWithItem({
        type: 'link',
        title: 'Foo Bar',
        destination: 'http://foo.bar',
      });

      const a = wrapper.find('.content a');
      expect(a.exists()).toBe(true);
      expect(a.attributes('href')).toBe('http://foo.bar');
      expect(a.text()).toBe('Foo Bar');
    });
  });

  describe('with type="reference"', () => {
    it('renders a `Reference`', () => {
      const wrapper = mountWithItem({
        type: 'reference',
        identifier: 'foobar',
      }, {
        foobar: {
          title: 'FooBar',
          url: '/foo/bar',
          ideTitle: 'IDETitle',
          titleStyle: 'symbol',
        },
      });

      const reference = wrapper.find('.content').find(Reference);
      expect(reference.exists()).toBe(true);
      expect(reference.props('url')).toBe('/foo/bar');
      expect(reference.props('ideTitle')).toBe('IDETitle');
      expect(reference.props('titleStyle')).toBe('symbol');
      expect(reference.isEmpty()).toBe(false);
      expect(reference.text()).toBe('FooBar');
    });

    it('renders a `Reference` with an overwritten title', () => {
      const wrapper = mountWithItem({
        type: 'reference',
        identifier: 'foobar',
        overridingTitle: 'Foo the Bar',
      }, {
        foobar: {
          title: 'FooBar',
          url: '/foo/bar',
        },
      });

      const reference = wrapper.find('.content').find(Reference);
      expect(reference.exists()).toBe(true);
      expect(reference.props('url')).toBe('/foo/bar');

      expect(reference.text()).not.toBe('FooBar');
      expect(reference.text()).toBe('Foo the Bar');
    });

    it('renders a `Reference` with a title of type="emphasis"', () => {
      const wrapper = mountWithItem({
        type: 'reference',
        identifier: 'foobar',
      }, {
        foobar: {
          title: 'FooBar',
          titleInlineContent: [
            {
              type: 'emphasis',
              inlineContent: [
                {
                  type: 'text',
                  text: 'FooBar with Emphasis',
                },
              ],
            },
          ],
          url: '/foo/bar',
        },
      });

      const reference = wrapper.find('.content').find(Reference);
      expect(reference.exists()).toBe(true);
      expect(reference.props('url')).toBe('/foo/bar');

      const emphasis = reference.find('em');
      expect(emphasis.exists()).toBe(true);
      expect(emphasis.text()).toBe('FooBar with Emphasis');
    });

    it('renders a `Reference` with an overwritten title of type="emphasis"', () => {
      const wrapper = mountWithItem({
        type: 'reference',
        identifier: 'foobar',
        overridingTitle: 'Foo the Bar',
        overridingTitleInlineContent: [
          {
            type: 'emphasis',
            inlineContent: [
              {
                type: 'text',
                text: 'Foo the Bar with Emphasis',
              },
            ],
          },
        ],
      }, {
        foobar: {
          title: 'FooBar',
          titleInlineContent: [
            {
              type: 'emphasis',
              inlineContent: [
                {
                  type: 'text',
                  text: 'FooBar with Emphasis',
                },
              ],
            },
          ],
          url: '/foo/bar',
        },
      });

      const reference = wrapper.find('.content').find(Reference);
      expect(reference.exists()).toBe(true);
      expect(reference.props('url')).toBe('/foo/bar');

      const emphasis = reference.find('em');
      expect(emphasis.exists()).toBe(true);
      expect(emphasis.text()).not.toBe('FooBar with Emphasis');
      expect(emphasis.text()).toBe('Foo the Bar with Emphasis');
    });

    it('renders a `Reference` with a title of type="strong"', () => {
      const wrapper = mountWithItem({
        type: 'reference',
        identifier: 'foobar',
      }, {
        foobar: {
          title: 'FooBar',
          titleInlineContent: [
            {
              type: 'strong',
              inlineContent: [
                {
                  type: 'text',
                  text: 'Strong FooBar',
                },
              ],
            },
          ],
          url: '/foo/bar',
        },
      });

      const reference = wrapper.find('.content').find(Reference);
      expect(reference.exists()).toBe(true);
      expect(reference.props('url')).toBe('/foo/bar');

      const strong = reference.find('strong');
      expect(strong.exists()).toBe(true);
      expect(strong.text()).toBe('Strong FooBar');
    });

    it('renders a `Reference` with an overwritten title of type="strong"', () => {
      const wrapper = mountWithItem({
        type: 'reference',
        identifier: 'foobar',
        overridingTitle: 'Foo the Bar',
        overridingTitleInlineContent: [
          {
            type: 'strong',
            inlineContent: [
              {
                type: 'text',
                text: 'Strong Foo the Bar',
              },
            ],
          },
        ],
      }, {
        foobar: {
          title: 'FooBar',
          titleInlineContent: [
            {
              type: 'strong',
              inlineContent: [
                {
                  type: 'text',
                  text: 'Strong FooBar',
                },
              ],
            },
          ],
          url: '/foo/bar',
        },
      });

      const reference = wrapper.find('.content').find(Reference);
      expect(reference.exists()).toBe(true);
      expect(reference.props('url')).toBe('/foo/bar');

      const strong = reference.find('strong');
      expect(strong.exists()).toBe(true);
      expect(strong.text()).not.toBe('Strong FooBar');
      expect(strong.text()).toBe('Strong Foo the Bar');
    });

    it('renders a `Reference` with a title of type="codeVoice"', () => {
      const wrapper = mountWithItem({
        type: 'reference',
        identifier: 'foobar',
      }, {
        foobar: {
          title: 'FooBar',
          titleInlineContent: [
            {
              type: 'codeVoice',
              code: 'FooBar with Code Voice',
            },
          ],
          url: '/foo/bar',
        },
      });

      const reference = wrapper.find('.content').find(Reference);
      expect(reference.exists()).toBe(true);
      expect(reference.props('url')).toBe('/foo/bar');

      const codeVoice = reference.find(CodeVoice);
      expect(codeVoice.exists()).toBe(true);
      expect(codeVoice.text()).toBe('FooBar with Code Voice');
    });

    it('renders a `Reference` with an overwritten title of type="codeVoice"', () => {
      const wrapper = mountWithItem({
        type: 'reference',
        identifier: 'foobar',
        overridingTitle: 'Foo the Bar',
        overridingTitleInlineContent: [
          {
            type: 'codeVoice',
            code: 'Foo the Bar with Code Voice',
          },
        ],
      }, {
        foobar: {
          title: 'FooBar',
          titleInlineContent: [
            {
              type: 'codeVoice',
              code: 'FooBar with Code Voice',
            },
          ],
          url: '/foo/bar',
        },
      });

      const reference = wrapper.find('.content').find(Reference);
      expect(reference.exists()).toBe(true);
      expect(reference.props('url')).toBe('/foo/bar');

      const codeVoice = reference.find(CodeVoice);
      expect(codeVoice.exists()).toBe(true);
      expect(codeVoice.text()).not.toBe('FooBar with Code Voice');
      expect(codeVoice.text()).toBe('Foo the Bar with Code Voice');
    });

    it('renders a reference as a none link when isActive is false', () => {
      const wrapper = mountWithItem({
        type: 'reference',
        identifier: 'foobar',
        isActive: false,
      }, {
        foobar: {
          title: 'FooBar',
          url: '/foo/bar',
        },
      });

      const reference = wrapper.find('.content').find(Reference);
      expect(reference.exists()).toBe(true);
      expect(reference.props('isActive')).toBe(false);

      expect(reference.text()).toBe('FooBar');
    });

    it('does not render anything if reference is missing', () => {
      const wrapper = mountWithItem({
        type: 'reference',
        identifier: 'foo',
      }, {
        foobar: {
          title: 'FooBar',
          url: '/foo/bar',
        },
      });

      const reference = wrapper.find('.content');
      expect(reference.isEmpty()).toBe(true);
    });
  });

  describe('with type="strong"', () => {
    it('renders a <strong>', () => {
      const wrapper = mountWithItem({
        type: 'strong',
        inlineContent: [
          {
            type: 'text',
            text: 'foobar',
          },
        ],
      });

      const strong = wrapper.find('.content strong');
      expect(strong.exists()).toBe(true);
      expect(strong.text()).toBe('foobar');
    });
  });

  describe('with type="inlineHead"', () => {
    it('renders a <strong>', () => {
      const wrapper = mountWithItem({
        type: 'strong',
        inlineContent: [
          {
            type: 'text',
            text: 'foobar',
          },
        ],
      });

      const strong = wrapper.find('.content strong');
      expect(strong.exists()).toBe(true);
      expect(strong.text()).toBe('foobar');
    });
  });

  describe('with type="text"', () => {
    it('renders plain text', () => {
      const wrapper = mountWithItem({
        type: 'text',
        text: 'foobar',
      });

      const content = wrapper.find('.content');
      expect(content.text()).toBe('foobar');
    });
  });

  describe('with type="table"', () => {
    const rows = [
      [
        [{ type: 'text', text: 'row0col0' }],
        [{ type: 'text', text: 'row0col1' }],
      ],
      [
        [{ type: 'text', text: 'row1col0' }],
        [{ type: 'text', text: 'row1col1' }],
      ],
    ];

    it('renders header="none" style tables', () => {
      const wrapper = mountWithItem({
        type: 'table',
        header: TableHeaderStyle.none,
        rows,
      });
      const table = wrapper.find('.content').find(Table);
      expect(table.exists()).toBe(true);
      expect(table.props('spanned')).toBe(false);
      expect(table.contains('thead')).toBe(false);
      expect(table.findAll('tbody tr').length).toBe(2);
      expect(table.findAll('tbody tr td').length).toBe(4);
    });

    it('renders header="both" style tables', () => {
      const wrapper = mountWithItem({
        type: 'table',
        header: TableHeaderStyle.both,
        rows,
      });
      const table = wrapper.find('.content').find(Table);
      expect(table.exists()).toBe(true);
      expect(table.findAll('thead tr th[scope="col"]').length).toBe(2);
      expect(table.findAll('tbody tr th[scope="row"').length).toBe(1);
      expect(table.findAll('tbody tr td').length).toBe(1);
    });

    it('renders header="row" style tables', () => {
      const wrapper = mountWithItem({
        type: 'table',
        header: TableHeaderStyle.row,
        rows,
      });
      const table = wrapper.find('.content').find(Table);
      expect(table.exists()).toBe(true);
      expect(table.findAll('thead tr th[scope="col"]').length).toBe(2);
      expect(table.findAll('tbody tr td').length).toBe(2);
    });

    it('renders header="column" style tables', () => {
      const wrapper = mountWithItem({
        type: 'table',
        header: TableHeaderStyle.column,
        rows,
      });
      const table = wrapper.find('.content').find(Table);
      expect(table.exists()).toBe(true);
      expect(table.contains('thead')).toBe(false);
      expect(table.findAll('tbody tr th[scope="row"]').length).toBe(2);
      expect(table.findAll('tbody tr td').length).toBe(2);
    });

    it('renders a `Figure`/`FigureCaption` with metadata', () => {
      const metadata = {
        anchor: '42',
        title: 'Table 42',
        abstract: [{
          type: 'paragraph',
          inlineContent: [{ type: 'text', text: 'blah' }],
        }],
      };
      const wrapper = mountWithItem({
        type: 'table',
        header: TableHeaderStyle.none,
        rows,
        metadata,
      });

      const figure = wrapper.find(Figure);
      expect(figure.exists()).toBe(true);
      expect(figure.props('anchor')).toBe(metadata.anchor);
      expect(figure.contains(Table)).toBe(true);

      const caption = figure.find(FigureCaption);
      expect(caption.exists()).toBe(true);
      expect(caption.props('title')).toBe(metadata.title);
      expect(caption.props('centered')).toBe(false);
      expect(caption.contains('p')).toBe(true);
      expect(caption.text()).toContain('blah');
    });

    describe('and column/row spanning', () => {
      // <table>
      //   <tr>
      //     <td colspan="2">row0col0</td>
      //     <td>row0col2</td>
      //   </tr>
      //   <tr>
      //     <td>row1col0</td>
      //     <td>row1col1</td>
      //     <td rowspan="2">row1col2</td>
      //   </tr>
      //   <tr>
      //     <td>row2col0</td>
      //     <td>row2col1</td>
      //   </tr>
      // </table>
      const rowsExtended = [
        [
          [{ type: 'text', text: 'row0col0' }],
          [{ type: 'text', text: 'row0col1' }],
          [{ type: 'text', text: 'row0col2' }],
        ],
        [
          [{ type: 'text', text: 'row1col0' }],
          [{ type: 'text', text: 'row1col1' }],
          [{ type: 'text', text: 'row1col2' }],
        ],
        [
          [{ type: 'text', text: 'row2col0' }],
          [{ type: 'text', text: 'row2col1' }],
          [{ type: 'text', text: 'row2col2' }],
        ],
      ];
      const extendedData = {
        '0_0': { colspan: 2 },
        '0_1': { colspan: 0 },
        '1_2': { rowspan: 2 },
        '2_2': { rowspan: 0 },
      };

      it('renders header="none" style table, with spans', () => {
        const wrapper = mountWithItem({
          type: 'table',
          header: TableHeaderStyle.none,
          rows: rowsExtended,
          extendedData,
        });
        const table = wrapper.find('.content').find(Table);
        expect(table.html()).toMatchInlineSnapshot(`
          <table-stub spanned="true">
            <tbody>
              <tr>
                <td colspan="2">row0col0</td>
                <td>row0col2</td>
              </tr>
              <tr>
                <td>row1col0</td>
                <td>row1col1</td>
                <td rowspan="2">row1col2</td>
              </tr>
              <tr>
                <td>row2col0</td>
                <td>row2col1</td>
              </tr>
            </tbody>
          </table-stub>
        `);
      });

      it('renders header="both" style table, with spans', () => {
        const wrapper = mountWithItem({
          type: 'table',
          header: TableHeaderStyle.both,
          rows: rowsExtended,
          extendedData,
        });
        const table = wrapper.find('.content').find(Table);
        expect(table.html()).toMatchInlineSnapshot(`
          <table-stub spanned="true">
            <thead>
              <tr>
                <th scope="col" colspan="2">row0col0</th>
                <th scope="col">row0col2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">row1col0</th>
                <td>row1col1</td>
                <td rowspan="2">row1col2</td>
              </tr>
              <tr>
                <th scope="row">row2col0</th>
                <td>row2col1</td>
              </tr>
            </tbody>
          </table-stub>
        `);
      });

      it('renders header="row" style table, with spans', () => {
        const wrapper = mountWithItem({
          type: 'table',
          header: TableHeaderStyle.row,
          rows: rowsExtended,
          extendedData,
        });
        const table = wrapper.find('.content').find(Table);
        expect(table.html()).toMatchInlineSnapshot(`
          <table-stub spanned="true">
            <thead>
              <tr>
                <th scope="col" colspan="2">row0col0</th>
                <th scope="col">row0col2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>row1col0</td>
                <td>row1col1</td>
                <td rowspan="2">row1col2</td>
              </tr>
              <tr>
                <td>row2col0</td>
                <td>row2col1</td>
              </tr>
            </tbody>
          </table-stub>
        `);
      });

      it('renders header="column" style table, with spans', () => {
        const wrapper = mountWithItem({
          type: 'table',
          header: TableHeaderStyle.column,
          rows: rowsExtended,
          extendedData,
        });
        const table = wrapper.find('.content').find(Table);
        expect(table.html()).toMatchInlineSnapshot(`
          <table-stub spanned="true">
            <tbody>
              <tr>
                <th scope="row" colspan="2">row0col0</th>
                <td>row0col2</td>
              </tr>
              <tr>
                <th scope="row">row1col0</th>
                <td>row1col1</td>
                <td rowspan="2">row1col2</td>
              </tr>
              <tr>
                <th scope="row">row2col0</th>
                <td>row2col1</td>
              </tr>
            </tbody>
          </table-stub>
        `);
      });
    });

    describe('and column alignments', () => {
      const alignedRows = [
        [
          [{ type: 'text', text: 'row0col0' }],
          [{ type: 'text', text: 'row0col1' }],
          [{ type: 'text', text: 'row0col2' }],
          [{ type: 'text', text: 'row0col3' }],
        ],
        [
          [{ type: 'text', text: 'row1col0' }],
          [{ type: 'text', text: 'row1col1' }],
          [{ type: 'text', text: 'row1col2' }],
          [{ type: 'text', text: 'row1col3' }],
        ],
      ];
      const alignments = [
        TableColumnAlignments.left,
        TableColumnAlignments.right,
        TableColumnAlignments.center,
        TableColumnAlignments.unset,
      ];

      it('renders header="none" style tables, with column alignments', () => {
        const wrapper = mountWithItem({
          type: 'table',
          header: TableHeaderStyle.none,
          alignments,
          rows: alignedRows,
        });
        const table = wrapper.find('.content').find(Table);
        expect(table.html()).toMatchInlineSnapshot(`
          <table-stub>
            <tbody>
              <tr>
                <td class="left-cell">row0col0</td>
                <td class="right-cell">row0col1</td>
                <td class="center-cell">row0col2</td>
                <td>row0col3</td>
              </tr>
              <tr>
                <td class="left-cell">row1col0</td>
                <td class="right-cell">row1col1</td>
                <td class="center-cell">row1col2</td>
                <td>row1col3</td>
              </tr>
            </tbody>
          </table-stub>
        `);
      });

      it('renders header="both" style tables, with column alignments', () => {
        const wrapper = mountWithItem({
          type: 'table',
          header: TableHeaderStyle.both,
          alignments,
          rows: alignedRows,
        });
        const table = wrapper.find('.content').find(Table);
        expect(table.html()).toMatchInlineSnapshot(`
          <table-stub>
            <thead>
              <tr>
                <th scope="col" class="left-cell">row0col0</th>
                <th scope="col" class="right-cell">row0col1</th>
                <th scope="col" class="center-cell">row0col2</th>
                <th scope="col">row0col3</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" class="left-cell">row1col0</th>
                <td class="right-cell">row1col1</td>
                <td class="center-cell">row1col2</td>
                <td>row1col3</td>
              </tr>
            </tbody>
          </table-stub>
        `);
      });

      it('renders header="row" style tables, with column alignments', () => {
        const wrapper = mountWithItem({
          type: 'table',
          header: TableHeaderStyle.row,
          alignments,
          rows: alignedRows,
        });
        const table = wrapper.find('.content').find(Table);
        expect(table.html()).toMatchInlineSnapshot(`
          <table-stub>
            <thead>
              <tr>
                <th scope="col" class="left-cell">row0col0</th>
                <th scope="col" class="right-cell">row0col1</th>
                <th scope="col" class="center-cell">row0col2</th>
                <th scope="col">row0col3</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="left-cell">row1col0</td>
                <td class="right-cell">row1col1</td>
                <td class="center-cell">row1col2</td>
                <td>row1col3</td>
              </tr>
            </tbody>
          </table-stub>
        `);
      });

      it('renders header="column" style tables, with column alignments', () => {
        const wrapper = mountWithItem({
          type: 'table',
          header: TableHeaderStyle.column,
          alignments,
          rows: alignedRows,
        });
        const table = wrapper.find('.content').find(Table);
        expect(table.html()).toMatchInlineSnapshot(`
          <table-stub>
            <tbody>
              <tr>
                <th scope="row" class="left-cell">row0col0</th>
                <td class="right-cell">row0col1</td>
                <td class="center-cell">row0col2</td>
                <td>row0col3</td>
              </tr>
              <tr>
                <th scope="row" class="left-cell">row1col0</th>
                <td class="right-cell">row1col1</td>
                <td class="center-cell">row1col2</td>
                <td>row1col3</td>
              </tr>
            </tbody>
          </table-stub>
        `);
      });
    });
  });

  describe('with type="termList"', () => {
    it('renders a <dl> with <dt>/<dd> pairs for each term/definition', () => {
      const wrapper = mountWithItem({
        type: 'termList',
        items: [
          {
            term: {
              inlineContent: [
                {
                  type: 'text',
                  text: 'Foo',
                },
              ],
            },
            definition: {
              content: [
                {
                  type: 'paragraph',
                  inlineContent: [
                    {
                      type: 'text',
                      text: 'foo',
                    },
                  ],
                },
              ],
            },
          },
          {
            term: {
              inlineContent: [
                {
                  type: 'text',
                  text: 'Bar',
                },
              ],
            },
            definition: {
              content: [
                {
                  type: 'paragraph',
                  inlineContent: [
                    {
                      type: 'text',
                      text: 'bar',
                    },
                  ],
                },
              ],
            },
          },
        ],
      });
      const dl = wrapper.find('.content dl');
      expect(dl.exists()).toBe(true);

      const terms = dl.findAll('dt');
      expect(terms.length).toBe(2);

      const definitions = dl.findAll('dd');
      expect(definitions.length).toBe(2);

      expect(terms.at(0).text()).toBe('Foo');
      expect(definitions.at(0).contains('p')).toBe(true);
      expect(definitions.at(0).text()).toBe('foo');
      expect(terms.at(1).text()).toBe('Bar');
      expect(definitions.at(1).contains('p')).toBe(true);
      expect(definitions.at(1).text()).toBe('bar');
    });
  });

  describe('with type="superscript"', () => {
    it('renders superscript tag', () => {
      const wrapper = mountWithItem({
        type: ContentNode.InlineType.superscript,
        inlineContent: [{ type: 'text', text: '2' }],
      });

      const content = wrapper.find('.content sup');
      expect(content.text()).toBe('2');
    });

    it('can render inline components inside superscript', () => {
      const wrapper = mountWithItem({
        type: ContentNode.InlineType.superscript,
        inlineContent: [
          { type: ContentNode.InlineType.text, text: '2' },
          {
            type: ContentNode.InlineType.strong,
            inlineContent: [{ type: ContentNode.InlineType.text, text: 'strong' }],
          },
        ],
      });

      const content = wrapper.find('.content sup');
      // assert the `strong` tag is rendered
      expect(content.html()).toBe('<sup>2<strong>strong</strong></sup>');
    });
  });

  describe('with type="subscript"', () => {
    it('renders subscript tag', () => {
      const wrapper = mountWithItem({
        type: ContentNode.InlineType.subscript,
        inlineContent: [{ type: 'text', text: '2' }],
      });

      const content = wrapper.find('.content sub');
      expect(content.text()).toBe('2');
    });

    it('can render inline components inside subscript', () => {
      const wrapper = mountWithItem({
        type: ContentNode.InlineType.subscript,
        inlineContent: [
          { type: ContentNode.InlineType.text, text: '2' },
          {
            type: ContentNode.InlineType.strong,
            inlineContent: [{ type: ContentNode.InlineType.text, text: 'strong' }],
          },
        ],
      });

      const content = wrapper.find('.content sub');
      // assert the `strong` tag is rendered
      expect(content.html()).toBe('<sub>2<strong>strong</strong></sub>');
    });
  });

  describe('with type="strikethrough"', () => {
    it('renders strikethrough tag', () => {
      const wrapper = mountWithItem({
        type: ContentNode.InlineType.strikethrough,
        inlineContent: [{ type: 'text', text: '2' }],
      });

      const content = wrapper.find(StrikeThrough);
      expect(content.text()).toBe('2');
    });

    it('can render inline components inside strikethrough', () => {
      const wrapper = mountWithItem({
        type: ContentNode.InlineType.strikethrough,
        inlineContent: [
          { type: ContentNode.InlineType.text, text: '2' },
          {
            type: ContentNode.InlineType.strong,
            inlineContent: [{ type: ContentNode.InlineType.text, text: 'strong' }],
          },
        ],
      });

      const content = wrapper.find(StrikeThrough);
      // assert the `strong` tag is rendered
      expect(content.html())
        .toBe('<strikethrough-stub>2<strong>strong</strong></strikethrough-stub>');
    });
  });

  describe('with type="dictionaryExample"', () => {
    const example = {
      type: 'file',
      content: [{ collapsible: false, code: ['{', '  "name" : "Info.plist"', '}'] }],
    };
    it('renders a dictionaryExample component without content', () => {
      const wrapper = mountWithItem({
        type: ContentNode.BlockType.dictionaryExample,
        example,
      });
      expect(wrapper.find(DictionaryExample).props()).toEqual({
        example,
      });
    });

    it('renders the summary inside the dictionaryExample default slot', () => {
      const wrapper = mountWithItem({
        type: ContentNode.BlockType.dictionaryExample,
        example,
        summary: [{
          type: 'paragraph',
          inlineContent: [{ type: 'text', text: 'An example of a dictionary.' }],
        }],
      });
      expect(wrapper.find('p').text()).toEqual('An example of a dictionary.');
    });
  });

  describe('.map', () => {
    it('recursively maps the content tree', () => {
      expect(mountWithContent([
        {
          type: 'text',
          text: 'foo',
        },
        {
          type: 'superscript',
          inlineContent: [{
            type: 'text',
            text: 'foo',
          }],
        },
        {
          type: 'subscript',
          inlineContent: [{
            type: 'text',
            text: 'foo',
          }],
        },
        {
          type: 'strikethrough',
          inlineContent: [{
            type: 'text',
            text: 'foo',
          }],
        },
        {
          type: 'codeListing',
          syntax: 'swift',
          code: ['let foo = "bar"'],
        },
        {
          type: 'table',
          header: 'none',
          rows: [
            [
              [{ type: 'text', text: 'a' }],
              [{ type: 'text', text: 'b' }],
            ],
            [
              [{ type: 'text', text: 'c' }],
              [{ type: 'text', text: 'd' }],
            ],
          ],
        },
        {
          type: 'aside',
          style: 'note',
          content: [
            {
              type: 'orderedList',
              items: [
                {
                  content: [
                    {
                      type: 'paragraph',
                      inlineContent: [
                        {
                          type: 'newTerm',
                          inlineContent: [
                            {
                              type: 'inlineHead',
                              inlineContent: [
                                {
                                  type: 'text',
                                  text: '[redacted]',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      inlineContent: [
                        {
                          type: 'emphasis',
                          inlineContent: [
                            {
                              type: 'text',
                              text: 'bar',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'unorderedList',
              items: [
                {
                  content: [
                    {
                      type: 'paragraph',
                      inlineContent: [
                        {
                          type: 'strong',
                          inlineContent: [
                            {
                              type: 'text',
                              text: 'baz',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'termList',
          items: [
            {
              term: {
                inlineContent: [
                  { type: 'text', text: 'term' },
                ],
              },
              definition: {
                content: [
                  {
                    type: 'paragraph',
                    inlineContent: [
                      { type: 'text', text: 'def' },
                    ],
                  },
                ],
              },
            },
          ],
        },
        {
          type: 'dictionaryExample',
          example: { content: [] },
          summary: [
            {
              type: 'paragraph',
              inlineContent: [{
                type: 'text',
                text: 'summary text',
              }],
            },
          ],
        },
      ]).vm.map(node => (
        node.text ? ({ ...node, text: '[redacted]' }) : node
      ))).toEqual([
        {
          type: 'text',
          text: '[redacted]',
        },
        {
          type: 'superscript',
          inlineContent: [{
            type: 'text',
            text: '[redacted]',
          }],
        },
        {
          type: 'subscript',
          inlineContent: [{
            type: 'text',
            text: '[redacted]',
          }],
        },
        {
          type: 'strikethrough',
          inlineContent: [{
            type: 'text',
            text: '[redacted]',
          }],
        },
        {
          type: 'codeListing',
          syntax: 'swift',
          code: ['let foo = "bar"'],
        },
        {
          type: 'table',
          header: 'none',
          rows: [
            [
              [{ type: 'text', text: '[redacted]' }],
              [{ type: 'text', text: '[redacted]' }],
            ],
            [
              [{ type: 'text', text: '[redacted]' }],
              [{ type: 'text', text: '[redacted]' }],
            ],
          ],
        },
        {
          type: 'aside',
          style: 'note',
          content: [
            {
              type: 'orderedList',
              items: [
                {
                  content: [
                    {
                      type: 'paragraph',
                      inlineContent: [
                        {
                          type: 'newTerm',
                          inlineContent: [
                            {
                              type: 'inlineHead',
                              inlineContent: [
                                {
                                  type: 'text',
                                  text: '[redacted]',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      inlineContent: [
                        {
                          type: 'emphasis',
                          inlineContent: [
                            {
                              type: 'text',
                              text: '[redacted]',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'unorderedList',
              items: [
                {
                  content: [
                    {
                      type: 'paragraph',
                      inlineContent: [
                        {
                          type: 'strong',
                          inlineContent: [
                            {
                              type: 'text',
                              text: '[redacted]',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'termList',
          items: [
            {
              term: {
                inlineContent: [
                  { type: 'text', text: '[redacted]' },
                ],
              },
              definition: {
                content: [
                  {
                    type: 'paragraph',
                    inlineContent: [
                      { type: 'text', text: '[redacted]' },
                    ],
                  },
                ],
              },
            },
          ],
        },
        {
          type: 'dictionaryExample',
          example: { content: [] },
          summary: [
            {
              type: 'paragraph',
              inlineContent: [{
                type: 'text',
                text: '[redacted]',
              }],
            },
          ],
        },
      ]);
    });
  });

  describe('.forEach', () => {
    it('recursively iterates over each tree node', () => {
      const wrapper = mountWithContent([
        {
          type: ContentNode.BlockType.aside,
          style: 'note',
          content: [
            {
              type: ContentNode.BlockType.paragraph,
              inlineContent: [
                {
                  type: ContentNode.InlineType.strong,
                  inlineContent: [
                    {
                      type: ContentNode.InlineType.inlineHead,
                      inlineContent: [
                        {
                          type: ContentNode.InlineType.emphasis,
                          inlineContent: [
                            {
                              type: ContentNode.InlineType.newTerm,
                              inlineContent: [
                                {
                                  type: ContentNode.InlineType.text,
                                  text: 'a',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: ContentNode.BlockType.orderedList,
              items: [
                {
                  content: [
                    {
                      type: ContentNode.BlockType.paragraph,
                      inlineContent: [
                        {
                          type: ContentNode.InlineType.text,
                          text: 'b',
                        },
                      ],
                    },
                    {
                      type: ContentNode.BlockType.unorderedList,
                      items: [
                        {
                          content: [
                            {
                              type: ContentNode.InlineType.text,
                              text: 'c',
                            },
                            {
                              type: ContentNode.InlineType.text,
                              text: 'd',
                            },
                          ],
                        },
                        {
                          content: [
                            {
                              type: ContentNode.InlineType.text,
                              text: 'e',
                            },
                            {
                              type: ContentNode.InlineType.text,
                              text: 'f',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: ContentNode.BlockType.table,
          header: TableHeaderStyle.none,
          rows: [
            [
              [{ type: ContentNode.InlineType.text, text: 'a' }],
              [{ type: ContentNode.InlineType.text, text: 'a' }],
            ],
          ],
        },
        {
          type: ContentNode.BlockType.termList,
          items: [
            {
              term: {
                inlineContent: [
                  {
                    type: ContentNode.InlineType.strong,
                    inlineContent: [
                      { type: ContentNode.InlineType.text, text: 'Term' },
                    ],
                  },
                ],
              },
              definition: {
                content: [
                  {
                    type: ContentNode.BlockType.paragraph,
                    inlineContent: [
                      { type: ContentNode.InlineType.text, text: 'Def' },
                    ],
                  },
                ],
              },
            },
          ],
        },
        {
          type: 'superscript',
          inlineContent: [{ type: 'text', text: 'Foo' }],
        },
        {
          type: 'strikethrough',
          inlineContent: [{
            type: 'text',
            text: 'foo',
          }],
        },
        {
          type: 'dictionaryExample',
          example: { content: [] },
          summary: [
            {
              type: 'paragraph',
              inlineContent: [{
                type: 'text',
                text: 'summary text',
              }],
            },
          ],
        },
      ]);

      const types = [];
      wrapper.vm.forEach((node) => {
        types.push(node.type);
      });

      expect(types).toEqual([
        ContentNode.BlockType.aside,
        ContentNode.BlockType.paragraph,
        ContentNode.InlineType.strong,
        ContentNode.InlineType.inlineHead,
        ContentNode.InlineType.emphasis,
        ContentNode.InlineType.newTerm,
        ContentNode.InlineType.text,
        ContentNode.BlockType.orderedList,
        ContentNode.BlockType.paragraph,
        ContentNode.InlineType.text,
        ContentNode.BlockType.unorderedList,
        ContentNode.InlineType.text,
        ContentNode.InlineType.text,
        ContentNode.InlineType.text,
        ContentNode.InlineType.text,
        ContentNode.BlockType.table,
        ContentNode.InlineType.text,
        ContentNode.InlineType.text,
        ContentNode.BlockType.termList,
        ContentNode.InlineType.strong,
        ContentNode.InlineType.text,
        ContentNode.BlockType.paragraph,
        ContentNode.InlineType.text,
        ContentNode.InlineType.superscript,
        ContentNode.InlineType.text,
        ContentNode.InlineType.strikethrough,
        ContentNode.InlineType.text,
        ContentNode.BlockType.dictionaryExample,
        ContentNode.BlockType.paragraph,
        ContentNode.InlineType.text,
      ]);
    });
  });

  describe('.reduce', () => {
    it('recursively reduces a function over each tree node', () => {
      // A content node tree corresponding to the following markdown:
      // a _*b*_ c
      const wrapper = shallowMount(ContentNode, {
        propsData: {
          content: [
            {
              type: ContentNode.BlockType.paragraph,
              inlineContent: [
                {
                  type: ContentNode.InlineType.text,
                  text: 'a ',
                },
                {
                  type: ContentNode.InlineType.emphasis,
                  inlineContent: [
                    {
                      type: ContentNode.InlineType.strong,
                      inlineContent: [
                        {
                          type: ContentNode.InlineType.text,
                          text: 'b',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: ContentNode.InlineType.text,
                  text: ' c',
                },
              ],
            },
          ],
        },
      });

      // use reduce to combine all text from text nodes in the tree
      const text = wrapper.vm.reduce((str, node) => (
        node.type === ContentNode.InlineType.text ? `${str}${node.text}` : str
      ), '');
      expect(text).toBe('a b c');

      // use reduce to count all the nodes in the tree
      const count = wrapper.vm.reduce(num => num + 1, 0);
      expect(count).toBe(6);

      // use reduce to find all the unique node types in the tree
      const types = wrapper.vm.reduce((set, node) => {
        set.add(node.type);
        return set;
      }, new Set());
      expect(types).toEqual(new Set([
        ContentNode.BlockType.paragraph,
        ContentNode.InlineType.text,
        ContentNode.InlineType.emphasis,
        ContentNode.InlineType.strong,
      ]));
    });
  });

  describe('.plaintext', () => {
    it('returns the text equivalent of the content tree without inline formatting', () => {
      const wrapper = shallowMount(ContentNode, {
        propsData: {
          content: [
            {
              type: ContentNode.BlockType.paragraph,
              inlineContent: [
                {
                  type: ContentNode.InlineType.text,
                  text: 'A',
                },
              ],
            },
            {
              type: ContentNode.BlockType.paragraph,
              inlineContent: [
                {
                  type: ContentNode.InlineType.strong,
                  inlineContent: [
                    {
                      type: ContentNode.InlineType.emphasis,
                      inlineContent: [
                        {
                          type: ContentNode.InlineType.text,
                          text: 'B',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
      expect(wrapper.vm.plaintext).toBe('A\nB');
    });
  });
});
