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
import * as  fsPromises from "fs/promises"
import * as path from 'node:path'
// +++ 新增依赖 +++
import * as JavaScriptObfuscator from "javascript-obfuscator"


async function prunePackageJson(buildPath: string) {
  const packageDotJsonPath = path.join(buildPath, "package.json");
  const content = await fsPromises.readFile(packageDotJsonPath);
  const json = JSON.parse(content.toString());
  Object.keys(json).forEach((key) => {
    switch (key) {
      case 'name': {
        break;
      }
      case 'version': {
        break;
      }
      case 'main': {
        break;
      }
      case 'author': {
        break;
      }
      case 'description': {
        break;
      }
      default: {
        delete json[key];
        break;
      }
    }
  });
  await fsPromises.writeFile(packageDotJsonPath, JSON.stringify(json, null, "\t"));
}

// +++ 新增混淆函数 +++
async function obfuscateMainProcess(buildPath: string) {
  console.log('[混淆调试] 开始处理目录:', buildPath); // +++ 新增日志 +++
  try {
    // 匹配主进程 JS 文件（根据你的入口文件调整模式）
    const dirs = await fsPromises.readdir(path.join(buildPath, 'build'), { recursive: true })
    const files = dirs.filter(item => item.endsWith('.js'))
    console.log(files, 'filesfilesfiles');
    // 混淆配置（根据需求调整）
    const obfuscationOptions = {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      numbersToExpressions: true,
      simplify: true,
      stringArrayShuffle: true,
      splitStrings: true,
      stringArrayThreshold: 0.75,
      reservedNames: [
        'electron', 'require', 'module', 'exports',
        'BrowserWindow', 'app'  // 保留 Electron 关键 API
      ],
      renameGlobals: false
    };

    // 批量混淆文件
    for (const file of files) {
      const filePath = path.join(buildPath, 'build', file);

      const code = await fsPromises.readFile(filePath, "utf8");
      const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, obfuscationOptions).getObfuscatedCode();
      await fsPromises.writeFile(filePath, obfuscatedCode);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`混淆失败: ${errorMessage}`);
  }
}

const config: ForgeConfig = {
  packagerConfig: {
    asar: false,
    overwrite: true, // 确保开启覆盖模式
    // ignore: ['!.env', '!.env.local', '!.env.keys']
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
  // hooks: {
  //   // 在文件拷贝完成后触发
  //   packageAfterCopy: async (config, buildPath, electronVersion, platform, arch) => {
  //     // 比如在拷贝完成后需要删除src目录
  //     //await fsPromises.rmdir(path.join(buildPath, "src"), { recursive: true });

  //     // 加密生产代码，不影响 build 目录下代码
  //     await obfuscateMainProcess(buildPath)
  //     // 精简package.json，删除无需暴露的属性
  //     await prunePackageJson(buildPath);
  //   },
  // },
};

export default config;
