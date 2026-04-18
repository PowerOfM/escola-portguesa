import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://escolaportuguesavancouver.ca',
  vite: {
    server: {
      allowedHosts: 'all',
    },
  },
});
