<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="link-block" :class="linkBlockClasses">
    <component
      :is="linkComponent"
      v-bind="linkProps"
      :class="linkClasses"
      class="link"
      ref="apiChangesDiff"
    >
      <TopicLinkBlockIcon
        v-if="topic.role && !change"
        :role="topic.role"
        :imageOverride="references[iconOverride]"
      />
      <DecoratedTopicTitle v-if="topic.fragments" :tokens="topic.fragments" />
      <WordBreak v-else :tag="titleTag">{{ topic.title }}</WordBreak>
      <span v-if="change" class="visuallyhidden">- {{ changeName }}</span>
    </component>
    <div
      v-if="hasAbstractElements"
      class="abstract"
    >
      <ContentNode v-if="topic.abstract" :content="topic.abstract" />
      <div v-if="topic.ideTitle" class="topic-keyinfo">
        <template v-if="topic.titleStyle === titleStyles.title">
          <strong>Key:</strong> {{ topic.name }}
        </template>
        <template v-else-if="topic.titleStyle === titleStyles.symbol">
          <strong>Name:</strong> {{ topic.ideTitle }}
        </template>
      </div>
      <RequirementMetadata
        v-if="topic.required || topic.defaultImplementations"
        :defaultImplementationsCount="topic.defaultImplementations"
        class="topic-required"
      />
      <ConditionalConstraints
        v-if="topic.conformance"
        :constraints="topic.conformance.constraints"
        :prefix="topic.conformance.availabilityPrefix"
      />
    </div>
    <Badge v-if="showDeprecatedBadge" variant="deprecated" />
    <Badge v-else-if="showBetaBadge" variant="beta" />
    <Badge
      v-for="badge in tags"
      :key="`${badge.type}-${badge.text}`"
      :variant="badge.type"
    >
      {{ badge.text }}
    </Badge>
  </div>
</template>

<script>
import { TopicRole } from 'docc-render/constants/roles';
import { buildUrl } from 'docc-render/utils/url-helper';
import Badge from 'docc-render/components/Badge.vue';
import WordBreak from 'docc-render/components/WordBreak.vue';
import ContentNode from 'docc-render/components/DocumentationTopic/ContentNode.vue';
import TopicLinkBlockIcon from 'docc-render/components/DocumentationTopic/TopicLinkBlockIcon.vue';
import DecoratedTopicTitle from 'docc-render/components/DocumentationTopic/DecoratedTopicTitle.vue';
import ConditionalConstraints
  from 'docc-render/components/DocumentationTopic/ConditionalConstraints.vue';
import RequirementMetadata

  from 'docc-render/components/DocumentationTopic/Description/RequirementMetadata.vue';

import { getAPIChanges, APIChangesMultipleLines } from 'docc-render/mixins/apiChangesHelpers';

const TopicKind = {
  article: 'article',
  symbol: 'symbol',
};

const TitleStyles = {
  title: 'title',
  symbol: 'symbol',
};

const ReferenceType = {
  link: 'link',
};

export default {
  name: 'TopicsLinkBlock',
  components: {
    Badge,
    WordBreak,
    ContentNode,
    TopicLinkBlockIcon,
    DecoratedTopicTitle,
    RequirementMetadata,
    ConditionalConstraints,
  },
  inject: ['store', 'references'],
  mixins: [getAPIChanges, APIChangesMultipleLines],
  constants: {
    ReferenceType,
    TopicKind,
    TitleStyles,
  },
  props: {
    isSymbolBeta: Boolean,
    isSymbolDeprecated: Boolean,
    topic: {
      type: Object,
      required: true,
      validator: topic => (!('abstract' in topic) || Array.isArray(topic.abstract))
        && typeof topic.identifier === 'string'
        && ((topic.type === ReferenceType.link && !topic.kind) || typeof topic.kind === 'string')
        && ((topic.type === ReferenceType.link && !topic.role) || typeof topic.role === 'string')
        && typeof topic.title === 'string'
        && typeof topic.url === 'string'
        && (!('defaultImplementations' in topic)
          || typeof topic.defaultImplementations === 'number')
        && (!('required' in topic) || typeof topic.required === 'boolean')
        && (!('conformance' in topic) || typeof topic.conformance === 'object'),
    },
  },
  data() {
    return {
      state: this.store.state,
    };
  },
  computed: {
    linkComponent: ({ topic }) => (topic.type === ReferenceType.link ? (
      'a'
    ) : (
      'router-link'
    )),
    linkProps({ topic }) {
      const url = buildUrl(topic.url, this.$route.query);
      return topic.type === ReferenceType.link
        ? { href: url }
        : { to: url };
    },
    linkBlockClasses: ({
      changesClasses,
      hasAbstractElements,
      hasMultipleLinesAfterAPIChanges,
      multipleLinesClass,
    }) => ({
      'has-inline-element': !hasAbstractElements,
      [multipleLinesClass]: hasMultipleLinesAfterAPIChanges,
      /*
       * The following display the "changes" highlight styles
       * on the parent div (this one) when there is not an abstract
       * but there is a badge, which displays inline
       */
      ...(!hasAbstractElements && changesClasses),

    }),
    linkClasses: ({
      changesClasses,
      deprecated,
      hasAbstractElements,
    }) => ({
      deprecated,

      /*
       * The following display the "changes" highlight on the
       * symbol name when it has adjacent elements which do not display inline
       */
      'has-adjacent-elements': hasAbstractElements,
      ...(hasAbstractElements && changesClasses),
    }),
    /**
     * Returns object with classes for API changes,
     * if `changes` are present.
     * @return {Object}
     */
    changesClasses: ({ getChangesClasses, change }) => getChangesClasses(change),
    titleTag({ topic }) {
      if (topic.titleStyle === TitleStyles.title) {
        return topic.ideTitle ? 'span' : 'code';
      }
      // Framework name and property list links and should not be code voice
      if (topic.role && (topic.role === TopicRole.collection || topic.role === TopicRole.dictionarySymbol)) return 'span';

      switch (topic.kind) {
      case TopicKind.symbol:
        return 'code';
      default:
        return 'span';
      }
    },
    titleStyles: () => TitleStyles,
    deprecated: ({ showDeprecatedBadge, topic }) => showDeprecatedBadge || topic.deprecated,
    showBetaBadge: ({ topic, isSymbolBeta }) => Boolean(!isSymbolBeta && topic.beta),
    showDeprecatedBadge:
      ({ topic, isSymbolDeprecated }) => Boolean(!isSymbolDeprecated && topic.deprecated),
    change({ topic: { identifier }, state: { apiChanges } }) {
      return this.changeFor(identifier, apiChanges);
    },
    changeName: ({ change, getChangeName }) => getChangeName(change),
    hasAbstractElements: ({
      topic: {
        abstract, conformance, required, defaultImplementations,
      },
    } = {}) => (
      (abstract && abstract.length > 0) || conformance || required || defaultImplementations
    ),
    // pick only the first available tag
    tags: ({ topic }) => (topic.tags || []).slice(0, 1),
    iconOverride: ({ topic: { images = [] } }) => {
      const icon = images.find(({ type }) => type === 'icon');
      return icon ? icon.identifier : null;
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.abstract,
.link-block /deep/ .badge {
  margin-left: calc(#{$topic-link-icon-spacing} + #{$topic-link-icon-width});
}

.link-block .badge + .badge {
  margin-left: 1rem;
}

.link {
  display: flex;
}

.link-block {
  .badge {
    margin-top: .5rem;
  }

  &.has-inline-element {
    display: flex;
    align-items: flex-start;
    flex-flow: row wrap;

    .badge {
      margin-left: 1rem;
      margin-top: 0;
    }
  }

  .has-adjacent-elements {
    padding-top: 5px;
    padding-bottom: 5px;
    display: inline-flex;
  }
}

.link-block, .link {
  box-sizing: inherit;

  &.changed {
    @include change-highlight-target();
    box-sizing: border-box;
  }
}

.abstract .topic-required:not(:first-child) {
  margin-top: 4px;
}

.topic-required {
  font-size: 0.8em;
}

.deprecated {
  text-decoration: line-through;
}

.conditional-constraints {
  font-size: rem(14px);
  margin-top: 4px;
}
</style>
