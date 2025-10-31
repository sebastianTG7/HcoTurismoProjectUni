// @ts-check
import { defineConfig } from 'astro/config';

import db from '@astrojs/db';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  
  devToolbar: {
    enabled: false
  },

  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },

  integrations: [db()],

  adapter: node({
    mode: 'standalone'
  })
});