// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.my-site.com',
  integrations: [tailwind(), preact()],
  output: 'server',
});