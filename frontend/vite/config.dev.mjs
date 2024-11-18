import basicSsl from '@vitejs/plugin-basic-ssl';
import { nodePolyfills } from 'vite-plugin-node-polyfills' // Correct import
import { defineConfig } from 'vite';
import { Buffer } from 'buffer'
import process from 'process/browser'

export default defineConfig({
    base: './',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
    },
    plugins: [basicSsl(), nodePolyfills({
        // Configuration options (if any)
        // For example, to include specific polyfills:
        // include: ["nodeGlobals", "nodeModules"],
        protocolImports: true, // Enable polyfilling of `node:` protocol imports (e.g., `node:buffer`)
      })],
    server: {
        port: 8740,
    },
});