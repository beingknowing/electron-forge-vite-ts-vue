import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { pluginExposeRenderer } from './vite.base.config';
// Use require syntax to bypass TS module resolution issues while maintaining runtime functionality
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { resolve } from "node:path";
import VueRouter from 'unplugin-vue-router/vite'
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
        // external: ['electron', 'fs', 'path'],
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
      VueRouter({
        routesFolder: 'src/renderer/views', // 扫描页面的目录
        dts: 'src/typed-router.d.ts', // 自动生成类型定义文件
      }),
      pluginExposeRenderer(name),
      vue({}),
      AutoImport({
        include: [
          /\.[tj]sx?$/,
          /\.vue$/,
          /\.vue\?vue/,
          /\.md$/,
        ],
        imports: [
          // 插件预设支持导入的api
          'vue',
          // 'vue-router',
          // 'pinia'
          // 自定义导入的api
        ],
        eslintrc: {
          enabled: true, // Default `false`
          // filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
          globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
        },
        dts: true,
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    resolve: {
      preserveSymlinks: true,
      alias: {
        '@': resolve(__dirname, 'src/renderer/src')
      }
    },

    clearScreen: false,
  } as UserConfig;
});
