// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { existsSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { parseEnv } from 'node:util'
import { defineConfig } from '#q-app'

/* Access code (the "coming soon" gate).
   ACCESS_CODE is read at build time from the host's environment (e.g. Vercel),
   then from .env – or, in development while there is no .env, from .env.example.
   Only its SHA-256 hash reaches the app; the code itself never does.
   It deliberately has no QCLI_ prefix, so Quasar never exposes it. */
const ACCESS_SALT = 'kitarista-access:' // must match SALT in src/services/access.js

function readAccessCode(ctx) {
  const fromHost = process.env['ACCESS_CODE'] // bracket access: read the real env, not a replaced value
  if (fromHost) return fromHost.trim()
  const envFile = ctx.appPaths.resolve.app('.env')
  const file = existsSync(envFile)
    ? envFile
    : ctx.dev
      ? ctx.appPaths.resolve.app('.env.example')
      : null
  if (!file || !existsSync(file)) return ''
  return (parseEnv(readFileSync(file, 'utf8')).ACCESS_CODE ?? '').trim()
}

function accessHash(code) {
  return code
    ? createHash('sha256')
        .update(ACCESS_SALT + code)
        .digest('hex')
    : ''
}

export default defineConfig((ctx) => {
  return {
    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: ['i18n', 'axios', 'game'],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#css
    css: ['app.scss'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v7',
      'fontawesome-v7',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',

      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#build
    build: {
      alias: {
        src: ctx.appPaths.resolve.app('src'),
      },

      // Client code sees only QCLI_* variables (import.meta.env.QCLI_*).
      // Production reads .env and the host's environment (e.g. Vercel).
      // In development, until a .env exists, the placeholders from
      // .env.example are used so the creators/support pages have content.
      env: ctx.dev && !existsSync(ctx.appPaths.resolve.app('.env')) ? { file: '.env.example' } : {},

      target: {
        // browser: 'baseline-widely-available',
        // node: 'node22'
      },

      // https://v2.quasar.dev/quasar-cli-vite/page-routing-with-vue-router#filename-based-routing
      // filenameBasedRouting: true,

      vueRouterMode: 'history', // 'history' gives clean URLs; vercel.json rewrites all routes to index.html
      // vueRouterBase,

      // publicPath: '/',
      // empty string = no gate (no ACCESS_CODE configured)
      define: {
        'import.meta.env.QCLI_ACCESS_HASH': JSON.stringify(accessHash(readAccessCode(ctx))),
      },
      // defineEnv: {}
      // ignorePublicFolder: true,
      // minify: false,
      // distDir

      // extendViteConf (viteConf) {},
      // viteVuePluginOptions: {},

      // to write components with JSX/TSX:
      // https://v2.quasar.dev/quasar-cli-vite/handling-vite#jsx-tsx
      // vueJsx: true,

      vitePlugins: [
        [
          '@intlify/unplugin-vue-i18n/vite',
          {
            // if you want to use Vue I18n Legacy API, you need to set `compositionOnly: false`
            // compositionOnly: false,

            // if you want to use named tokens in your Vue I18n messages, such as 'Hello {name}',
            // you need to set `runtimeOnly: false`
            // runtimeOnly: false,

            ssr: ctx.mode.ssr || ctx.mode.ssg,

            // you need to set i18n resource including paths !
            include: [ctx.appPaths.resolve.app('src/i18n')],
          },
        ],
        [
          'vite-plugin-checker',
          {
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#devserver
    devServer: {
      // vueDevtools: true,
      // https: true,
      open: true, // opens browser window automatically
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#framework
    framework: {
      config: {},

      // iconSet: 'material-icons', // Quasar icon set
      lang: 'bg', // Quasar language pack (switched at runtime by the settings store)

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: [
        'AddressbarColor',
        'AppFullscreen',
        'AppNetwork',
        'AppVisibility',
        'AppWakeLock',
        'BottomSheet',
        'Cookies',
        'Dark',
        'Dialog',
        'IconSet',
        'Lang',
        'Loading',
        'LoadingBar',
        'LocalStorage',
        'Meta',
        'Notify',
        'Platform',
        'Screen',
        'SessionStorage',
      ],
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   pwaRegisterServiceWorker: 'src-pwa/register-sw',
    //   pwaServiceWorker: 'src-pwa/sw/custom-sw',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    //   electronPreload: 'src-electron/electron-preload'
    //   bexManifestFile: 'src-bex/manifest.json
    // },

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      /**
       * The default port that the production server should use
       * (gets superseded if process.env.PORT is specified at runtime)
       */
      prodPort: 3000,
      middlewares: [
        'render', // keep this as last one
      ],

      // clientSideRenderingRoutes: [],
      // noPreloadTagRoutes: [],
      // manualStoreSerialization: true,
      // manualStoreSsrContextInjection: true,
      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,
      // prodScriptNamedExport: false,

      // extendSSRPackageJson (pkgJson) {},
      // extendSSRManifestJson (json) {},
      // extendSSRWebserverConf (rolldownConf) {},

      // pwa: true,
      // pwaOfflineHtmlFilename: 'offline.html', // do NOT use index.html as name!
      // extendSSRGenerateSWOptions (cfg) {},
      // extendSSRInjectManifestOptions (cfg) {},
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssg/configuring-ssg
    ssg: {
      // onSsgRendererError: 'abort',
      // ssgRendererConcurrency: 1,
      // ssgRendererRetryCount: 0,
      // ssgRendererRetryDelay: 1000,
      // ssgRendererDirectoryIndexes: true,
      // error404HtmlFilename: '404.html',
      // clientSideRenderingHtmlFilename: 'csr.html',
      // clientSideRenderingRoutes: [],
      // noPreloadTagRoutes: []
      // extendSSGRendererConf (rolldownConf) {},
      // extendSSGManifestJson (json) {},
      // manualStoreSerialization: true,
      // manualStoreSsrContextInjection: true,
      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,
      // pwa: true,
      // pwaOfflineHtmlFilename: 'offline.html',
      // extendSSGGenerateSWOptions (cfg) {},
      // extendSSGInjectManifestOptions (cfg) {},
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      // swFilename: 'sw.js',
      // manifestFilename: 'manifest.json',
      // extendPWAManifestJson (json) {},
      // useCredentialsForManifestTag: true,
      // injectPWAMetaTags: false,
      // extendPWACustomSWConf (rolldownConf) {},
      // extendPWAGenerateSWOptions (cfg) {},
      // extendPWAInjectManifestOptions (cfg) {},
      // extendPWASwTsConfig (tsConfig) {}
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {},

    // https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (rolldownConf) {},
      // extendElectronPreloadConf (rolldownConf) {},
      // extendElectronPackageJson (pkgJson) {},

      // Electron preload scripts (if any) from /src-electron, WITHOUT file extension
      preloadScripts: ['electron-preload'],

      // specify the debugging port to use for the Electron app when running in development mode
      inspectPort: 5858,

      bundler: 'packager', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration

        appId: 'kitarista',
      },
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      // extendBexScriptsConf (rolldownConf) {},
      // extendBexManifestJson (json) {},

      /**
       * The list of extra scripts (js/ts) not in your bex manifest that you want to
       * compile and use in your browser extension. Maybe dynamic use them?
       *
       * Each entry in the list should be a relative filename to /src-bex/
       *
       * @example [ 'my-script.ts', 'sub-folder/my-other-script.js' ]
       */
      extraScripts: [],
    },
  }
})
