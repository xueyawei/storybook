import type { StorybookConfig } from '@storybook/core-common';

export const addons: StorybookConfig['addons'] = [
  '@storybook/renderer-vue3',
  require.resolve('./framework-preset-vue3'),
  require.resolve('./framework-preset-vue3-docs'),
];