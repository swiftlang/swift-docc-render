import { config } from '@vue/test-utils';

config.mocks = {
  $t: tKey => tKey,
  $tc: tKey => tKey,
};
