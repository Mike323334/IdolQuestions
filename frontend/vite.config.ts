import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
      // Polyfill specific modules
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Polyfill Node.js built-in modules
      include: [
        'crypto',
        'stream',
        'util',
        'buffer',
        'process',
        'assert',
        'url',
        'querystring',
        'path',
        'vm',
        'events',
        'os',
        'http',
        'https',
        'zlib',
        'fs',
        'net',
        'tls',
        'dns',
        'child_process',
      ],
      // Exclude modules that should use browser versions
      exclude: [],
    }),
  ],
  define: {
    global: 'globalThis',
    'process.env': JSON.stringify({}),
    'process.browser': true,
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util',
      _stream_writable: 'stream-browserify',
      _stream_readable: 'stream-browserify',
      _stream_duplex: 'stream-browserify',
      _stream_transform: 'stream-browserify',
      _stream_passthrough: 'stream-browserify',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
    include: [
      'buffer',
      'process',
      'stream-browserify',
      'util',
      'threads-api',
    ],
    exclude: [],
  },
  server: {
    port: 3000,
    open: true,
    host: true,
    hmr: {
      clientPort: 3000,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
