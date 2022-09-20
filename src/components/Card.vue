<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
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
  inject: {
    references: { default: () => ({}) },
  },
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

$details-padding: 17px;
$content-margin: 4px;

@mixin static-card-size($card-height, $img-height) {
  @include inTargetWeb {
    --card-height: #{$card-height};
    --card-details-height: #{$card-height - $img-height - ($details-padding * 2)};
  }
  --card-cover-height: #{$img-height};
}

.card {
  overflow: hidden;
  display: block;
  transition: box-shadow, transform 160ms ease-out;
  will-change: box-shadow, transform;
  backface-visibility: hidden;
  height: var(--card-height);

  &:hover {
    text-decoration: none;

    .link {
      text-decoration: underline;
    }
  }

  @include inTargetWeb {
    border-radius: $big-border-radius;

    &:hover {
      box-shadow: 0 5px 10px var(--color-card-shadow);
      transform: scale(1.007);

      @media (prefers-reduced-motion: reduce) {
        box-shadow: none;
        transform: none;
      }
    }
  }

  &.small {
    @include static-card-size(408px, 235px);
    @include breakpoint(medium) {
      @include static-card-size(341px, 163px);
    }
  }

  &.large {
    @include static-card-size(556px, 359px);
    @include breakpoint(medium) {
      @include static-card-size(420px, 249px);
    }
  }

  &.floating-style {
    --color-card-shadow: transparent;
    --card-height: auto;
    --card-details-height: auto;
  }
}

.details {
  background-color: var(--color-card-background);
  padding: $details-padding;
  position: relative;
  height: var(--card-details-height);
  @include font-styles(card-content-small);

  .large & {
    @include font-styles(card-content-large);
  }

  .floating-style & {
    --color-card-background: transparent;
    padding: $details-padding 0;
  }
}

.eyebrow {
  color: var(--color-card-eyebrow);
  display: block;
  margin-bottom: $content-margin;
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
  color: var(--color-card-content-text);
  margin-top: $content-margin;
}

.link {
  bottom: 17px;
  display: flex;
  align-items: center;
  position: absolute;

  .link-icon {
    height: 0.6em;
    width: 0.6em;
    // move the icon closer
    margin-left: .3em;
  }

  .floating-style & {
    bottom: unset;
    margin-top: $stacked-margin-large;
    position: relative;
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
      --card-height: auto;
      --card-details-height: auto;

      @include inTargetWeb {
        min-width: 280px;
        max-width: 300px;
        --card-cover-height: 227px;
      }
      @include inTargetIde {
        --card-cover-height: 325px;
      }

      .link {
        bottom: unset;
        margin-top: 7px;
        position: relative;
      }
    }
  }
}
</style>
