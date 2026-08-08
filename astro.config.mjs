import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://stackclimb.com',
  devToolbar: { enabled: false },

  /* Decided before /approach and /cv exist, because it decides how every
     internal link must be written and changing it later breaks them all.

     'directory' (Astro's default) emits approach/index.html, so /approach
     308-redirects to /approach/ and every link written without the slash pays
     a round trip. 'file' emits approach.html, so /approach returns 200
     directly and the slash-less form — the one people actually type and the
     one that reads better in copy — is the fast one.

     Verified both against Cloudflare's own Pages asset router before choosing.
     Does not affect / or 404.html. */
  build: { format: 'file' },

  /* Until now /sitemap.xml returned the home page with a 200 and a
     content-type of text/html, because every unmatched path did. Once
     src/pages/404.astro exists those paths correctly 404 — which would have
     left the site with no sitemap at all while `site` was already configured.
     Generated from the built routes, so a new page is in it automatically and
     nobody has to remember. */
  integrations: [sitemap()],
});
