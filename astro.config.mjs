// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  }
});
