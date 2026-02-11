<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<script>
import referencesProvider from 'docc-render/mixins/referencesProvider';
import Aside from './ContentNode/Aside.vue';
import CodeListing from './ContentNode/CodeListing.vue';
import LinkableHeading from './ContentNode/LinkableHeading.vue';
import CodeVoice from './ContentNode/CodeVoice.vue';
import DictionaryExample from './ContentNode/DictionaryExample.vue';
import EndpointExample from './ContentNode/EndpointExample.vue';
import Figure from './ContentNode/Figure.vue';
import Caption from './ContentNode/Caption.vue';
import InlineImage from './ContentNode/InlineImage.vue';
import Reference from './ContentNode/Reference.vue';
import Table from './ContentNode/Table.vue';
import StrikeThrough from './ContentNode/StrikeThrough.vue';
import Small from './ContentNode/Small.vue';
import BlockVideo from './ContentNode/BlockVideo.vue';
import Column from './ContentNode/Column.vue';
import Row from './ContentNode/Row.vue';
import TabNavigator from './ContentNode/TabNavigator.vue';
import TaskList from './ContentNode/TaskList.vue';
import LinksBlock from './ContentNode/LinksBlock.vue';
import DeviceFrame from './ContentNode/DeviceFrame.vue';
import ThematicBreak from './ContentNode/ThematicBreak.vue';

const { CaptionPosition, CaptionTag } = Caption.constants;

export const BlockType = {
  aside: 'aside',
  codeListing: 'codeListing',
  endpointExample: 'endpointExample',
  heading: 'heading',
  orderedList: 'orderedList',
  paragraph: 'paragraph',
  table: 'table',
  termList: 'termList',
  unorderedList: 'unorderedList',
  dictionaryExample: 'dictionaryExample',
  small: 'small',
  video: 'video',
  row: 'row',
  tabNavigator: 'tabNavigator',
  links: 'links',
  thematicBreak: 'thematicBreak',
};

const InlineType = {
  codeVoice: 'codeVoice',
  emphasis: 'emphasis',
  image: 'image',
  inlineHead: 'inlineHead',
  link: 'link',
  newTerm: 'newTerm',
  reference: 'reference',
  strong: 'strong',
  text: 'text',
  superscript: 'superscript',
  subscript: 'subscript',
  strikethrough: 'strikethrough',
};

// Examples of each header style with capital letters showing header cells:
//
// "row" (header cells in first row)
// ---------
// | A | B |
// ---------
// | a | b |
// ---------
//
// "column" (header cells in first column)
// ---------
// | A | a |
// ---------
// | B | b |
// ---------
//
// "both" (header cells in first row and first column)
// -------------
// |   | A | B |
// -------------
// | C | a | b |
// -------------
//
// "none" (no header cells)
// ---------
// | a | b |
// ---------
// | c | d |
// ---------
const TableHeaderStyle = {
  both: 'both',
  column: 'column',
  none: 'none',
  row: 'row',
};

const TableColumnAlignments = {
  left: 'left',
  right: 'right',
  center: 'center',
  unset: 'unset',
};

// The point after which a TabNavigator turns to vertical mode.
const TabNavigatorVerticalThreshold = 7;

// Recursively call the passed `createElement` function for each content node
// and any of its children by mapping each node `type` to a given Vue component
//
// Note: A plain string of text is returned for nodes with `type="text"`
function renderNode(createElement, references) {
  const renderChildren = children => children.map(
    renderNode(createElement, references),
  );

  const renderListItems = items => items.map(item => (
    createElement('li', {}, (
      renderChildren(item.content)
    ))
  ));

  const renderTableCell = (
    element, attrs, data, cellIndex, rowIndex, extendedData, alignments,
  ) => {
    const { colspan, rowspan } = extendedData[`${rowIndex}_${cellIndex}`] || {};
    // if either is `0`, then its spanned over and should not be rendered
    if (colspan === 0 || rowspan === 0) return null;
    const align = alignments[cellIndex] || TableColumnAlignments.unset;
    let classes = null;
    if (align !== TableColumnAlignments.unset) classes = `${align}-cell`;
    return createElement(element, { attrs: { ...attrs, colspan, rowspan }, class: classes }, (
      renderChildren(data)
    ));
  };

  const renderTableChildren = (
    rows, headerStyle = TableHeaderStyle.none, extendedData = {}, alignments = [],
  ) => {
    // build the matrix for the array
    switch (headerStyle) {
    // thead with first row and th for each first row cell
    // tbody with rows where first cell in each row is th, others are td
    case TableHeaderStyle.both: {
      const [firstRow, ...otherRows] = rows;
      return [
        createElement('thead', {}, [
          createElement('tr', {}, firstRow.map((cell, cellIndex) => (
            renderTableCell('th', { scope: 'col' }, cell, cellIndex, 0, extendedData, alignments)
          ))),
        ]),
        createElement('tbody', {}, otherRows.map(([firstCell, ...otherCells], rowIndex) => (
          createElement('tr', {}, [
            renderTableCell(
              'th', { scope: 'row' }, firstCell, 0, rowIndex + 1, extendedData, alignments,
            ),
            ...otherCells.map((cell, cellIndex) => (
              renderTableCell('td', {}, cell, cellIndex + 1, rowIndex + 1, extendedData, alignments)
            )),
          ])
        ))),
      ];
    }
    // tbody with rows, th for first cell of each row, td for other cells
    case TableHeaderStyle.column:
      return [
        createElement('tbody', {}, rows.map(([firstCell, ...otherCells], rowIndex) => (
          createElement('tr', {}, [
            renderTableCell(
              'th', { scope: 'row' }, firstCell, 0, rowIndex, extendedData, alignments,
            ),
            ...otherCells.map((cell, cellIndex) => (
              renderTableCell('td', {}, cell, cellIndex + 1, rowIndex, extendedData, alignments)
            )),
          ])
        ))),
      ];
      // thead with first row, th in all first row cells, tbody with other
      // rows that all have td cells
    case TableHeaderStyle.row: {
      const [firstRow, ...otherRows] = rows;
      return [
        createElement('thead', {}, [
          createElement('tr', {}, firstRow.map((cell, cellIndex) => renderTableCell(
            'th', { scope: 'col' }, cell, cellIndex, 0, extendedData, alignments,
          ))),
        ]),
        createElement('tbody', {}, otherRows.map((row, rowIndex) => (
          createElement('tr', {}, row.map((cell, cellIndex) => (
            renderTableCell('td', {}, cell, cellIndex, rowIndex + 1, extendedData, alignments)
          )))
        ))),
      ];
    }
    default:
      // tbody with all rows and every cell is td
      return [
        createElement('tbody', {}, (
          rows.map((row, rowIndex) => (
            createElement('tr', {}, (
              row.map((cell, cellIndex) => (
                renderTableCell('td', {}, cell, cellIndex, rowIndex, extendedData, alignments)
              ))
            ))
          ))
        )),
      ];
    }
  };

  const renderFigure = ({
    metadata: {
      abstract = [],
      anchor,
      title,
      ...metadata
    },
    ...rest
  }) => {
    const node = {
      ...rest,
      metadata,
    };
    const figureContent = [renderChildren([node])];
    if ((title && abstract.length) || abstract.length) {
      // if there is a `title`, it should be above, otherwise below
      const position = title ? CaptionPosition.leading : CaptionPosition.trailing;
      const index = position === CaptionPosition.trailing ? 1 : 0;
      const tag = CaptionTag.figcaption;
      figureContent.splice(index, 0,
        createElement(Caption, {
          props: {
            title,
            position,
            tag,
          },
        }, renderChildren(abstract)));
    }
    return createElement(Figure, { props: { anchor } }, figureContent);
  };

  const renderDeviceFrame = ({ metadata: { deviceFrame }, ...node }) => (
    createElement(DeviceFrame, {
      props: {
        device: deviceFrame,
      },
    }, renderChildren([node]))
  );

  return function render(node) {
    switch (node.type) {
    case BlockType.aside: {
      const props = { kind: node.style, name: node.name };
      return createElement(Aside, { props }, (
        renderChildren(node.content)
      ));
    }
    case BlockType.codeListing: {
      if (node.metadata && node.metadata.anchor) {
        return renderFigure(node);
      }

      const props = {
        syntax: node.syntax,
        fileType: node.fileType,
        content: node.code,
        showLineNumbers: node.showLineNumbers,
        copyToClipboard: node.copyToClipboard ?? false,
        wrap: node.wrap ?? 0,
        lineAnnotations: node.lineAnnotations ?? [],
      };
      return createElement(CodeListing, { props });
    }
    case BlockType.endpointExample: {
      const props = {
        request: node.request,
        response: node.response,
      };
      return createElement(EndpointExample, { props }, renderChildren(node.summary || []));
    }
    case BlockType.heading: {
      const props = {
        anchor: node.anchor,
        level: node.level,
      };
      return createElement(LinkableHeading, { props }, node.text);
    }
    case BlockType.orderedList:
      return createElement('ol', {
        attrs: {
          start: node.start,
        },
      }, (
        renderListItems(node.items)
      ));
    case BlockType.paragraph: {
      const hasSingleImage = node.inlineContent.length === 1
        && node.inlineContent[0].type === InlineType.image;
      const props = hasSingleImage ? { class: ['inline-image-container'] } : {};

      return createElement('p', props, (
        renderChildren(node.inlineContent)
      ));
    }
    case BlockType.table: {
      const children = renderTableChildren(
        node.rows, node.header, node.extendedData, node.alignments,
      );

      if (node.metadata && node.metadata.abstract) {
        const { title } = node.metadata;
        const position = title ? CaptionPosition.leading : CaptionPosition.trailing;
        const tag = CaptionTag.caption;
        children.unshift(createElement(Caption, {
          props: {
            title,
            position,
            tag,
          },
        }, (
          renderChildren(node.metadata.abstract)
        )));
      }

      return createElement(Table, {
        attrs: {
          id: node.metadata && node.metadata.anchor,
        },
        props: {
          spanned: !!node.extendedData,
        },
      }, (
        children
      ));
    }
    case BlockType.termList:
      return createElement('dl', {}, node.items.map(({ term, definition }) => [
        createElement('dt', {}, (
          renderChildren(term.inlineContent)
        )),
        createElement('dd', {}, (
          renderChildren(definition.content)
        )),
      ]));
    case BlockType.unorderedList: {
      const isTaskList = list => TaskList.props.tasks.validator(list.items);
      return isTaskList(node) ? (
        createElement(TaskList, {
          props: {
            tasks: node.items,
          },
          scopedSlots: {
            task: slotProps => renderChildren(slotProps.task.content),
          },
        })
      ) : (
        createElement('ul', {}, (
          renderListItems(node.items)
        ))
      );
    }
    case BlockType.dictionaryExample: {
      const props = {
        example: node.example,
      };
      return createElement(DictionaryExample, { props }, renderChildren(node.summary || []));
    }
    case BlockType.small: {
      return createElement('p', {}, [
        createElement(Small, {}, renderChildren(node.inlineContent)),
      ]);
    }
    case BlockType.video: {
      if (node.metadata && node.metadata.abstract) {
        return renderFigure(node);
      }
      if (!references[node.identifier]) return null;
      const { deviceFrame } = node.metadata || {};
      return createElement(BlockVideo, {
        props: {
          identifier: node.identifier,
          deviceFrame,
        },
      });
    }
    case BlockType.row: {
      const columns = node.numberOfColumns ? { large: node.numberOfColumns } : undefined;
      return createElement(
        Row, { props: { columns } }, node.columns.map(col => (
          createElement(
            Column, { props: { span: col.size } }, renderChildren(col.content),
          )
        )),
      );
    }
    case BlockType.tabNavigator: {
      // If the tabs count is more than the threshold, use vertical tabs instead.
      const vertical = node.tabs.length > TabNavigatorVerticalThreshold;
      const titles = node.tabs.map(tab => tab.title);
      const scopedSlots = node.tabs.reduce((slots, tab) => ({
        ...slots,
        [tab.title]: () => renderChildren(tab.content),
      }), {});
      return createElement(TabNavigator, {
        props: {
          titles,
          vertical,
        },
        scopedSlots,
      });
    }
    case BlockType.links: {
      return createElement(LinksBlock, {
        props: {
          blockStyle: node.style,
          identifiers: node.items,
        },
      });
    }
    case BlockType.thematicBreak:
      return createElement(ThematicBreak);
    case InlineType.codeVoice:
      return createElement(CodeVoice, {
        class: 'inline-code',
      }, (
        node.code
      ));
    case InlineType.emphasis:
    case InlineType.newTerm:
      return createElement('em', (
        renderChildren(node.inlineContent)
      ));
    case InlineType.image: {
      if (node.metadata && (node.metadata.anchor || node.metadata.abstract)) {
        return renderFigure(node);
      }

      const image = references[node.identifier];
      if (!image) return null;
      if (node.metadata && node.metadata.deviceFrame) {
        return renderDeviceFrame(node);
      }
      return createElement(InlineImage, {
        props: {
          alt: image.alt,
          variants: image.variants,
        },
      });
    }
    case InlineType.link:
      // Note: `InlineType.link` has been deprecated, but may still be found in old JSON.
      return createElement('a', {
        attrs: { href: node.destination },
        class: 'inline-link',
      }, (
        node.title
      ));
    case InlineType.reference: {
      const reference = references[node.identifier];
      if (!reference) return null;
      const titleInlineContent = node.overridingTitleInlineContent
        || reference.titleInlineContent;
      const titlePlainText = node.overridingTitle || reference.title;
      return createElement(Reference, {
        props: {
          url: reference.url,
          kind: reference.kind,
          role: reference.role,
          isActive: node.isActive,
          ideTitle: reference.ideTitle,
          titleStyle: reference.titleStyle,
          hasInlineFormatting: !!titleInlineContent,
        },
        class: 'inline-link',
      }, (
        titleInlineContent ? renderChildren(titleInlineContent) : titlePlainText
      ));
    }
    case InlineType.strong:
    case InlineType.inlineHead:
      return createElement('strong', (
        renderChildren(node.inlineContent)
      ));
    case InlineType.text:
      return node.text === '\n' ? (
        createElement('br')
      ) : (
        node.text
      );
    case InlineType.superscript:
      return createElement('sup', renderChildren(node.inlineContent));
    case InlineType.subscript:
      return createElement('sub', renderChildren(node.inlineContent));
    case InlineType.strikethrough:
      return createElement(StrikeThrough, renderChildren(node.inlineContent));
    default:
      return null;
    }
  };
}

/**
 * Render a tree of markdown content.
 *
 * This component represents a tree of content and is primarily used to render
 * blocks of markdown text which may contain inline formatting. Most basic
 * markdown components like paragraphs, lists, italics, etc can be rendered with
 * `ContentNode` as well as some DocC specific markdown directives like
 * ``ContentNode/TabNavigator`` and ``ContentNode/Row``.
 *
 * - Parameter content: `Array` (**required**) — A list of
 *    [`RenderBlockContent`](https://github.com/apple/swift-docc/blob/5ad35a3107ca0443b81ada917b73b950d89bf396/Sources/SwiftDocC/SwiftDocC.docc/Resources/RenderNode.spec.json#L420).
 * - Parameter tag: `String` — An optional HTML tag to wrap the
 *    content in instead of the default `<div>`.
 */
export default {
  name: 'ContentNode',
  constants: { TableHeaderStyle, TableColumnAlignments },
  mixins: [referencesProvider],
  render: function render(createElement) {
    // Dynamically map each content item and any children to their
    // corresponding components, and wrap the whole tree in a <div>
    return createElement(this.tag, { class: 'content' }, (
      this.content.map(renderNode(createElement, this.references), this)
    ));
  },
  props: {
    content: {
      type: Array,
      required: true,
    },
    tag: {
      type: String,
      default: () => 'div',
    },
  },
  methods: {
    // Recursively map a given function over the content node tree. The
    // provided function will be applied to every node in the tree, regardless
    // of depth.
    map(fn) {
      function $map(nodes = []) {
        return nodes.map((node) => {
          switch (node.type) {
          case BlockType.aside:
            return fn({
              ...node,
              content: $map(node.content),
            });
          case BlockType.dictionaryExample:
            return fn({
              ...node,
              summary: $map(node.summary),
            });
          case BlockType.paragraph:
          case InlineType.emphasis:
          case InlineType.strong:
          case InlineType.inlineHead:
          case InlineType.superscript:
          case InlineType.subscript:
          case InlineType.strikethrough:
          case InlineType.newTerm:
            return fn({
              ...node,
              inlineContent: $map(node.inlineContent),
            });
          case BlockType.orderedList:
          case BlockType.unorderedList:
            return fn({
              ...node,
              items: node.items.map(item => ({
                ...item,
                content: $map(item.content),
              })),
            });
          case BlockType.table:
            return fn({
              ...node,
              rows: node.rows.map(row => (
                row.map($map)
              )),
            });
          case BlockType.termList:
            return fn({
              ...node,
              items: node.items.map(item => ({
                ...item,
                term: { inlineContent: $map(item.term.inlineContent) },
                definition: { content: $map(item.definition.content) },
              })),
            });
          default:
            return fn(node);
          }
        });
      }

      return $map(this.content);
    },
    // Recursively walk a given content tree, applying the callback function for
    // each node encountered (depth first).
    forEach(fn) {
      function $forEach(nodes = []) {
        nodes.forEach((node) => {
          fn(node);
          switch (node.type) {
          case BlockType.aside:
            $forEach(node.content);
            break;
          case BlockType.paragraph:
          case InlineType.emphasis:
          case InlineType.strong:
          case InlineType.inlineHead:
          case InlineType.newTerm:
          case InlineType.superscript:
          case InlineType.subscript:
          case InlineType.strikethrough:
            $forEach(node.inlineContent);
            break;
          case BlockType.orderedList:
          case BlockType.unorderedList:
            node.items.forEach(item => $forEach(item.content));
            break;
          case BlockType.dictionaryExample:
            $forEach(node.summary);
            break;
          case BlockType.table:
            node.rows.forEach((row) => {
              row.forEach($forEach);
            });
            break;
          case BlockType.termList:
            node.items.forEach((item) => {
              $forEach(item.term.inlineContent);
              $forEach(item.definition.content);
            });
            break;
            // no default
          }
        });
      }

      return $forEach(this.content);
    },
    // Recursively walk a given content tree, applying the callback function for
    // each node encountered (depth first) and returning an accumulated result.
    //
    // @param fn {Function} A callback function which will called for each node
    //   in the tree along with the most recently accumulated result. The last
    //   result is the first argument passed to this function and the node is
    //   the second argument.
    // @param initialValue {Any} Some initial value to start accumulating.
    //
    // @return {Any} The final accumulated value based on the initial value and
    //   the result of applying the function to every node.
    reduce(fn, initialValue) {
      let result = initialValue;
      this.forEach((node) => {
        result = fn(result, node);
      });
      return result;
    },
  },
  computed: {
    // Computed property that returns a single plaintext string equivalent
    // of the content tree.
    //
    // Paragraphs will be transformed into newlines and text will be presented
    // without any inline formatting—other block kinds like asides will be
    // ignored in the resulting plaintext representation.
    plaintext() {
      const { references = {} } = this;
      return this.reduce((text, node) => {
        if (node.type === BlockType.paragraph) {
          return `${text}\n`;
        }
        if (node.type === InlineType.codeVoice) {
          return `${text}${node.code}`;
        }
        if (node.type === InlineType.text) {
          return `${text}${node.text}`;
        }
        if (node.type === InlineType.reference) {
          const title = references[node.identifier]?.title ?? '';
          return `${text}${title}`;
        }
        return text;
      }, '').trim();
    },
  },
  BlockType,
  InlineType,
};
</script>
