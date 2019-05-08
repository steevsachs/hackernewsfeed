const { relative, resolve } = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin')
const TerserPlugin = require('terser-webpack-plugin')
const WebpackBar = require('webpackbar')
const WorkboxPlugin = require('workbox-webpack-plugin')
const webpack = require('webpack')

const rootDir = resolve(__dirname)
const include = [resolve(rootDir, 'src'), resolve(rootDir, 'config')]

module.exports = (env = {}) => ({
  devServer: {
    allowedHosts: ['localhost'],
    historyApiFallback: true,
    host: 'localhost',
    stats: 'errors-only',
  },
  devtool: env.production ? 'source-map' : 'cheap-module-source-map',
  entry: {
    main: [
      '@babel/polyfill',
      'whatwg-fetch',
      !env.production && 'react-dev-utils/webpackHotDevClient',
      './src',
    ].filter(Boolean),
  },
  mode: env.production ? 'production' : 'development',
  module: {
    rules: [
      {
        oneOf: [
          // Process application JS with Babel.
          // The preset includes JSX, Flow, TypeScript, and some ESnext features.
          {
            include,
            loader: 'babel-loader',
            options: {
              cacheCompression: env.production,
              cacheDirectory: true,
              compact: env.production,
              extends: './babel.config.js',
            },
            test: /\.jsx?$/,
          },
          // Process any JS outside of the app with Babel.
          // Unlike the application JS, only compile the standard ES features.
          {
            test: /\.m?js$/,
            exclude: /@babel(?:\/|\\{1,2})runtime/,
            loader: 'babel-loader',
            options: {
              babelrc: false,
              cacheCompression: env.production,
              cacheDirectory: true,
              compact: false,
              configFile: false,
              presets: [['babel-preset-react-app/dependencies', { helpers: true }]],
              // If an error happens in a package, it's possible to be
              // because it was compiled. Thus, we don't want the browser
              // debugger to show the original code. Instead, the code
              // being evaluated would be much more helpful.
              sourceMaps: false,
            },
          },
        ],
      },
      {
        include,
        loader: 'graphql-tag/loader',
        test: /\.graphql$/,
      },
    ],
  },
  optimization: {
    minimize: env.production,
    minimizer: [
      // This is only used in production mode
      new TerserPlugin({
        terserOptions: {
          parse: {
            // we want terser to parse ecma 8 code. However, we don't want it
            // to apply any minification steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
            // Disabled because of an issue with Terser breaking valid code:
            // https://github.com/facebook/create-react-app/issues/5250
            // Pending futher investigation:
            // https://github.com/terser-js/terser/issues/120
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true,
          },
        },
        // Use multi-process parallel running to improve the build speed
        // Default number of concurrent runs: os.cpus().length - 1
        parallel: true,
        // Enable file caching
        cache: true,
        sourceMap: true,
      }),
    ],
    runtimeChunk: true,
    splitChunks: {
      chunks: 'all',
      name: false,
    },
  },
  output: {
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: env.production ? 'js/[name].[chunkhash:8].chunk.js' : 'js/[name].chunk.js',
    // There will be one main bundle, and one file per asynchronous chunk.
    // In development, it does not produce real files.
    filename: env.production ? 'js/[name].[chunkhash:8].js' : 'js/bundle.js',
    path: env.production ? `${rootDir}/dist` : undefined,
    pathinfo: !env.production,
    publicPath: '/',
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: env.production
      ? (info) => relative('./src', info.absoluteResourcePath).replace(/\\/g, '/')
      : !env.production && ((info) => resolve(info.absoluteResourcePath).replace(/\\/g, '/')),
  },
  plugins: [
    env.production &&
      new WorkboxPlugin.InjectManifest({
        globPatterns: ['*.html'],
        swSrc: './static/service-worker.js',
      }),
    new HtmlPlugin({
      includeSw: env.production,
      inject: true,
      template: './static/index.html',
      ...(env.production
        ? {
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            },
          }
        : {}),
    }),
    new InlineChunkHtmlPlugin(HtmlPlugin, [/runtime~.+[.]js/]),
    new CopyPlugin([{ from: './static/assets', to: 'assets' }]),
    // new CopyPlugin([{ from: './static/fonts', to: 'fonts' }]),
    env.production && new CopyPlugin([{ from: './static/service-worker.js', to: 'service-worker.js' }]),
    /* new webpack.DefinePlugin({
      // Allow related services to be set at build time.
    }), */
    new webpack.IgnorePlugin(/\.flow$/),
    !env.production && new WebpackBar({ color: '#7cd638' }),
  ].filter(Boolean),
  resolve: {
    extensions: ['.mjs', '.js', '.jsx'],
  },
  stats: 'errors-only',
})
