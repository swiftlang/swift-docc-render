<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022-2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <Reference
    class="card"
    :url="url"
    :class="classes"
    v-bind="linkAriaTags"
  >
    <CardCover
      :variants="imageVariants"
      :rounded="floatingStyle"
      :alt="imageReference.alt"
      aria-hidden="true"
      #default="coverProps"
    >
      <slot name="cover" v-bind="coverProps" />
    </CardCover>
    <div class="details" aria-hidden="true">
      <div
        v-if="eyebrow"
        :id="eyebrowId"
        class="eyebrow"
        :aria-label="formatAriaLabel(`- ${eyebrow}`)"
      >
        {{ eyebrow }}
      </div>
      <div
        :id="titleId"
        class="title"
      >
        {{ title }}
      </div>
      <div v-if="$slots.default" class="card-content" :id="contentId">
        <slot />
      </div>
      <component
        v-if="linkText"
        :is="hasButton ? 'ButtonLink': 'div'"
        class="link"
      >
        {{ linkText }}
        <DiagonalArrowIcon class="icon-inline link-icon" v-if="showExternalLinks" />
        <InlineChevronRightIcon class="icon-inline link-icon" v-else-if="!hasButton" />
      </component>
    </div>
  </Reference>
</template>

<script>
import ButtonLink from 'docc-render/components/ButtonLink.vue';
import InlineChevronRightIcon from 'theme/components/Icons/InlineChevronRightIcon.vue';
import DiagonalArrowIcon from 'theme/components/Icons/DiagonalArrowIcon.vue';
import Reference from 'docc-render/components/ContentNode/Reference.vue';
import CardSize from 'docc-render/constants/CardSize';
import referencesProvider from 'docc-render/mixins/referencesProvider';
import CardCover from './CardCover.vue';

export default {
  name: 'Card',
  components: {
    Reference,
    DiagonalArrowIcon,
    InlineChevronRightIcon,
    CardCover,
    ButtonLink,
  },
  constants: {
    CardSize,
  },
  mixins: [referencesProvider],
  computed: {
    titleId: ({ _uid }) => `card_title_${_uid}`,
    contentId: ({ _uid }) => `card_content_${_uid}`,
    eyebrowId: ({ _uid }) => `card_eyebrow_${_uid}`,
    linkAriaTags: ({
      titleId, eyebrowId, contentId, eyebrow, $slots,
    }) => ({
      'aria-labelledby': titleId.concat(eyebrow ? ` ${eyebrowId}` : ''),
      'aria-describedby': $slots.default ? `${contentId}` : null,
    }),
    classes: ({
      size,
      floatingStyle,
    }) => ([
      size,
      {
        'floating-style': floatingStyle,
      },
    ]),
    imageReference: ({
      image,
      references,
    }) => (references[image] || {}),
    imageVariants: ({ imageReference }) => imageReference.variants || [],
  },
  props: {
    linkText: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
      default: '',
    },
    eyebrow: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    size: {
      type: String,
      validator: s => Object.prototype.hasOwnProperty.call(CardSize, s),
    },
    title: {
      type: String,
      required: true,
    },
    hasButton: {
      type: Boolean,
      default: () => false,
    },
    floatingStyle: {
      type: Boolean,
      default: false,
    },
    showExternalLinks: {
      type: Boolean,
      default: false,
    },
    formatAriaLabel: {
      type: Function,
      default: v => v,
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.card {
  --margin-link: #{$details-padding-card};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow, transform 160ms ease-out;
  will-change: box-shadow, transform;
  backface-visibility: hidden;

  &.large {
    --margin-link: #{$details-padding-card * 1.5};

    &.floating-style {
      --margin-link: var(--spacing-stacked-margin-large);
    }
  }

  &:hover {
    text-decoration: none;

    .link {
      @include underline-text;
    }
  }

  @include inTargetWeb {
    border-radius: $big-border-radius;

    &:hover {
      transform: scale(1.007);

      @media (prefers-reduced-motion: reduce) {
        transform: none;
      }
    }
  }

  &.small {
    --card-cover-height: 235px;
    @include breakpoint(medium) {
      --card-cover-height: 163px;
    }
  }

  &.large {
    --card-cover-height: 359px;
    @include breakpoint(medium) {
      --card-cover-height: 249px;
    }
  }

  &.floating-style {
    --color-card-shadow: transparent;
  }
}

.details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--color-card-background);
  padding: $details-padding-card;
  position: relative;
  @include font-styles(card-content-small);

  .large & {
    @include font-styles(card-content-large);
  }

  .floating-style & {
    --color-card-background: transparent;
    padding: $details-padding-card 0;
  }
}

.eyebrow {
  color: var(--color-card-eyebrow);
  display: block;
  margin-bottom: $content-margin-card;
  @include font-styles(card-eyebrow-small);

  .large & {
    @include font-styles(card-eyebrow-large);
  }
}

.title {
  font-weight: $font-weight-semibold;
  color: var(--color-card-content-text);
  @include font-styles(card-title-small);

  .large & {
    @include font-styles(card-title-large);
  }
}

.card-content {
  flex-grow: 1;
  color: var(--color-card-content-text);
  margin-top: $content-margin-card;
}

.link {
  margin-top: var(--margin-link);
  display: flex;
  align-items: center;

  .link-icon {
    height: 0.6em;
    width: 0.6em;
    // move the icon closer
    margin-left: .3em;
  }
}

@include breakpoint(small) {
  .card {
    margin-left: auto;
    margin-right: auto;

    & + & {
      margin-bottom: 20px;
      margin-top: 20px;
    }

    &.small, &.large {
      @include inTargetWeb {
        min-width: 280px;
        --card-cover-height: 227px;
      }
      @include inTargetIde {
        --card-cover-height: 325px;
      }

      .link {
        margin-top: 7px;
        position: relative;
      }
    }
  }
}
</style>
