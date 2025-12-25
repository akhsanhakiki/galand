// @ts-check
import { defineConfig } from "astro/config";
// Netlify adapter (commented out for Render deployment)
// import netlify from '@astrojs/netlify';
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: "server",
  // Netlify adapter (commented out for Render deployment)
  // adapter: netlify(),
  adapter: node({
    mode: "standalone",
  }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
