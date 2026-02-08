// @ts-check
import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: netlify(),
  server: {
    host: true,
    port: 4321,
    // Allow requests from other devices on the network (e.g. http://192.168.1.4:4321)
    cors: true,
    // So HMR WebSocket connects to the dev machine from other devices
    hmr: process.env.VITE_HMR_HOST
      ? { host: process.env.VITE_HMR_HOST, port: 4321, protocol: "ws" }
      : true,
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["react-aria-components", "@heroui/react"],
    },
    optimizeDeps: {
      include: ["react-aria-components"],
    },
  },
});
