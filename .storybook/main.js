/** @type {import('@storybook/html-vite').StorybookConfig} */
const config = {
  stories: [
    '../blocks/**/*.stories.@(js|mjs)',
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/html-vite',
};

export default config;
