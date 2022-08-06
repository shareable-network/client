const HTMLWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const path = require('path');
const fs = require('fs');

const PATHS = {
  current: __dirname,
  // lib: path.join(__dirname, '/lib'),
  public: path.join(__dirname, '/public'),
  src: path.join(__dirname, '/src'),
  static: path.join(__dirname, '/src/static'),
  build: path.join(__dirname, '/build')
};
const MODE = process.argv[2]?.replace('--mode=', '') | '';
const DEBUG = MODE === 'development';

console.warn({PATHS, MODE});


function genHTMLs(root) {
  const pages = fs.readdirSync(root)
      .filter((filename) => path.extname(filename) === '.html');
  console.log('HTML pages:', pages);
  return pages.map((filename) => new HTMLWebpackPlugin({
    filename,
    template: path.resolve(root, filename),
    inject: 'body',
    favicon: path.resolve(PATHS.public, 'favicon.png'),
  }));
}




module.exports = {
  mode: 'production',
  entry: {
    main: path.resolve(__dirname, './src/index.js'),
  },
  output: {
    filename: '[name].bundle.js',
    path: PATHS.build,
    clean: true,
    assetModuleFilename: 'static/[name][ext][query]',
  },
  optimization: {
    minimize: true,
  },
  // https://webpack.js.org/configuration/dev-server/
  devServer: {
    // To watch multiple static directories:
    static: {
      directory: PATHS.static,
    },
    compress: true,
    port: 8080,
    open: true,
    client: {
      progress: true,
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(PATHS.static, 'img/'),
          to: 'img/',
          filter: async (resourcePath) => {
            const ext = path.extname(resourcePath);
            return !(['.xcf'].find((el) => el === ext));
          },
        },
      ],
    }),
    new HTMLWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(PATHS.public, 'index.html'),
      inject: 'body',
      scriptLoading: 'blocking',
      favicon: path.resolve(PATHS.public, 'favicon.png'),
    }),
    ...genHTMLs(PATHS.src),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],

  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(jpe?g|png|gif|svg|ico|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name][ext][query]',
        },
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        type: 'asset',
        generator: {
          filename: 'fonts/[name][ext][query]',
        },
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    fallback: {
      'fs': false,
    },
    alias: {
      Static: PATHS.static,
    },
  },
};
