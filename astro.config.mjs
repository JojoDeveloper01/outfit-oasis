// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import node from '@astrojs/node';

import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.my-site.com',
  integrations: [tailwind(), preact()],
  output: 'server',

  adapter: node({
    mode: 'standalone',
  }),
});