import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: "github-light"
    }
  },
  site: "https://site.j10ccc.xyz"
});
