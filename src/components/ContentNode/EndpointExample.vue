<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <Row class="endpoint-example">
    <Column class="example-code">
      <slot />
      <Tabnav v-model="currentTab">
        <TabnavItem :value="Tab.request">{{ Tab.request }}</TabnavItem>
        <TabnavItem :value="Tab.response">{{ Tab.response }}</TabnavItem>
      </Tabnav>
      <div class="output">
        <div v-if="isCurrent(Tab.request)" class="code">
          <CollapsibleCodeListing
            v-bind="request"
            :collapsed="isCollapsed"
            showLineNumbers
          />
        </div>
        <div v-if="isCurrent(Tab.response)" class="code">
          <CollapsibleCodeListing
            v-bind="response"
            :collapsed="isCollapsed"
            showLineNumbers
          />
        </div>
      </div>
      <div class="controls" v-if="isCollapsible">
        <a v-if="isCollapsed" href="#" class="toggle" @click.prevent="showMore">
          <InlinePlusCircleSolidIcon class="control-icon icon-inline" />
          More
        </a>
        <a v-else href="#" class="toggle" @click.prevent="showLess">
          <InlineMinusCircleSolidIcon class="control-icon icon-inline" />
          Less
        </a>
      </div>
    </Column>
  </Row>
</template>

<script>
import GridRow from 'docc-render/components/GridRow.vue';
import GridColumn from 'docc-render/components/GridColumn.vue';
import Tabnav from 'docc-render/components/Tabnav.vue';
import TabnavItem from 'docc-render/components/TabnavItem.vue';
import InlinePlusCircleSolidIcon from 'theme/components/Icons/InlinePlusCircleSolidIcon.vue';
import InlineMinusCircleSolidIcon from 'theme/components/Icons/InlineMinusCircleSolidIcon.vue';
import CollapsibleCodeListing from './CollapsibleCodeListing.vue';

const Tab = {
  request: 'Request',
  response: 'Response',
};

export default {
  name: 'EndpointExample',
  components: {
    InlineMinusCircleSolidIcon,
    InlinePlusCircleSolidIcon,
    TabnavItem,
    Tabnav,
    CollapsibleCodeListing,
    Row: GridRow,
    Column: GridColumn,
  },
  constants: { Tab },
  props: {
    request: {
      type: Object,
      required: true,
    },
    response: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isCollapsed: true,
      currentTab: Tab.request,
    };
  },
  computed: {
    Tab: () => Tab,
    isCollapsible: ({ response, request, currentTab }) => {
      const content = {
        [Tab.request]: request.content,
        [Tab.response]: response.content,
      }[currentTab] || [];

      return content.some(({ collapsible }) => collapsible);
    },
  },
  methods: {
    isCurrent(tab) {
      return this.currentTab === tab;
    },
    showMore() {
      this.isCollapsed = false;
    },
    showLess() {
      this.isCollapsed = true;
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.controls {
  margin-top: 5px;
  font-size: 14px;
  display: flex;
  justify-content: flex-end;

  a {
    color: var(--colors-text, var(--color-text));
    display: flex;
    align-items: center;
  }

  .control-icon {
    width: 1.05em;
    margin-right: .3em;
  }
}
</style>
