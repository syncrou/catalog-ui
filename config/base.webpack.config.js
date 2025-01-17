/* global require, module, __dirname */

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const config = require('./webpack.common.js');

const webpackConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: false,
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    usedExports: true,
    splitChunks: {
      cacheGroups: {
        vendors: false,
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'initial'
        }
      }
    }
  },
  entry: {
    App: config.paths.entry
  },
  output: {
    filename: 'js/[name].js',
    path: config.paths.public,
    publicPath: config.paths.publicPath,
    chunkFilename: 'js/[name].js'
  },
  module: {
    rules: [{
      test: /src\/.*\.js$/,
      exclude: /node_modules/,
      use: [{ loader: 'source-map-loader' }, { loader: 'babel-loader' }]
    }, {
      test: /\.s?[ac]ss$/,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader'
        },
        {
          loader: 'sass-loader'
        }
      ]
    }, {
      test: /\.(woff(2)?|ttf|jpg|png|eot|gif|svg)(\?v=\d+\.\d+\.\d+)?$/,
      use: [{
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'fonts/'
        }
      }]
    }, {
      parser: {
        amd: false
      }
    }]
  }
};

module.exports = webpackConfig;
