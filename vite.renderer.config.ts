import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { pluginExposeRenderer, external } from './vite.base.config';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { join, resolve } from "node:path"
// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>;
  const { root, mode, forgeConfigSelf, command } = forgeEnv;
  const name = forgeConfigSelf.name ?? '';

  return {
    root,
    mode,
    // In packaged Electron apps we load via file://, so assets must be relative.
    base: command === 'serve' ? '/' : './',
    build: {
      sourcemap: "inline", // 调试，必须开启
      outDir: `.vite/renderer`,
      rollupOptions: {

        input: {
          [name]: resolve(__dirname, `${name}.html`),
        },
        external: ['electron', 'fs', 'path'],
        // output: {
        //   format: 'cjs',
        //   // It should not be split chunks.
        //   inlineDynamicImports: true,
        //   entryFileNames: `[name].js`,
        //   chunkFileNames: `[name].js`,
        //   assetFileNames: `[name].[ext]`,

        // },
      }
    },
    plugins: [
      pluginExposeRenderer(name),
      vue({}),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    resolve: {
      preserveSymlinks: true,
    },
    clearScreen: false,
  } as UserConfig;
});
