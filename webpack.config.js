const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const url = require('url');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

require('dotenv').config();

const isDev = process.env.NODE_ENV === 'development';

function getScriptHost() {
  const hostStr = (process.env.WEBPACK_DEV_SERVER_HOST !== undefined) ?
    process.env.WEBPACK_DEV_SERVER_HOST : 'http://localhost:8081';
  const parsed = url.parse(hostStr);
  const publicPath = `${parsed.href}_goserve/assets`;
  return {
    publicPath,
    url: url.parse(hostStr),
  };
}

const extractSass = new ExtractTextPlugin({
  filename: 'css/[name].[contenthash].css',
  disable: !isDev,
});

const plugins = isDev ? [
  new webpack.HotModuleReplacementPlugin(),
  extractSass,
] : [
  new UglifyJSPlugin(),
  extractSass,
];

const sassRule = isDev ? {
  test: /\.scss$/,
  use: [
    {
      loader: 'style-loader', // creates style nodes from JS strings
    }, {
      loader: 'css-loader', // translates CSS into CommonJS
    }, {
      loader: 'sass-loader', // compiles Sass to CSS
    },
  ],
} : {
  test: /\.scss$/,
  use: extractSass.extract({
    use: [
      {
        loader: 'css-loader',
      }, {
        loader: 'sass-loader',
      },
    ],
    // use style-loader in development
    fallback: 'style-loader',
  }),
};

const externals = {
};

const scriptHost = getScriptHost();

module.exports = {
  entry: [
    'babel-polyfill',
    './assets/src/js/app.js',
  ],
  output: {
    path: path.resolve(__dirname, 'assets/dist'),
    publicPath: !isDev ? '' : scriptHost.publicPath,
    filename: 'js/app.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: path.join(__dirname, 'dist', 'src', 'js'),
        use: [
          'react-hot-loader',
          'babel-loader',
        ],
      },
      sassRule,
    ],
  },
  externals,
  plugins,
  devServer: {
    hot: true, // this enables hot reload
    // hotOnly: true, // do not reload browser if hot reload failed
    inline: true, // use inline method for hmr
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    host: scriptHost.url.hostname,
    port: scriptHost.url.port,
    contentBase: path.join(__dirname, 'public'),
    watchOptions: {
      poll: false,
    },
  },
};