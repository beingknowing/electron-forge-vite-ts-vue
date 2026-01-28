import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { ForgeExternalsPlugin } from './fore-externals-plugin'
// import VitePluginOptions from '@electron-forge/plugin-vite'
// import { AutoUnpackNativesPlugin, AutoUnpackNativesConfig } from '@electron-forge/plugin-auto-unpack-natives'
import { dependencies } from './vite.base.config'

// const packagedModulePaths = [...dependencies.map(v => `/node_modules/${v}`)]
// const allowList = ['/.vite', '/package.json'];
const config: ForgeConfig = {
  packagerConfig: {
    asar: false,
    overwrite: true, // 确保开启覆盖模式
    ignore:['!.env','!.env.local','!.env.keys']
    // 强制保留 node_modules 目录，防止被插件默认行为误删，此方法不work使用打包插件
    // ignore: (path) => {

    //   if (!path) return false;
    //   if (path === '/node_modules') {
    //     return false
    //   }
    //   // 允许被打包的文件/文件夹：.vite 目录、package.json 和 node_modules
    //   let isAllowed = false
    //   if (path.startsWith('/node_modules')) {
    //     isAllowed = packagedModulePaths.some(item => path.startsWith(item));
    //   } else {
    //     isAllowed = allowList.some(item => path.startsWith(item));
    //   }
    //   if (isAllowed) {
    //     console.log("🚀 ~ path:", path)
    //   }
    //   return !isAllowed;
    // },

  },
  rebuildConfig: {},
  makers: [new MakerSquirrel({}), new MakerZIP({}, ['darwin']), new MakerRpm({}), new MakerDeb({})],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main/index.ts',
          config: 'vite.main.config.ts',
        },
        {
          entry: 'src/preload/index.ts',
          config: 'vite.preload.config.ts',
        },
      ],
      renderer: [
        {
          name: 'index',
          config: 'vite.renderer.config.ts',
        },
        // {
        //   name: 'about',
        //   config: 'vite.renderer.config.ts',
        // },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: true,
      [FuseV1Options.EnableCookieEncryption]: false,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: true,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: false,
    }),
    //打包必须的插件，否则node_modules不会自动复制
    new ForgeExternalsPlugin({
      externals: dependencies,
      includeDeps: true
    }, __dirname),
    // new AutoUnpackNativesPlugin({

    // } satisfies AutoUnpackNativesConfig)
  ],
};

export default config;
