const webpack = require('webpack');
const path = require('path');
const utils = require('./utils');

// resolving for loaders and presets:
// https://github.com/babel/babel-loader/issues/166#issuecomment-160866946

const getPlugins = () => [
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      screw_ie8: true,
      warnings: false,
    },
  }),
];

const getPresets = (experimental) => {
  const stagePreset = experimental ? 'babel-preset-stage-0' : 'babel-preset-stage-3';
  return [
    'babel-preset-latest',
    'babel-preset-react',
    stagePreset,
  ].map(require.resolve);
};

const getConfig = ({ entry, out, libraryName, bundleName, minify, presets }) => ({
  resolveLoader: { root: path.join(__dirname, 'node_modules') },
  entry,
  output: {
    path: out,
    filename: bundleName,
    libraryTarget: 'umd',
    library: libraryName,
  },
  externals: {
    react: 'React',
  },
  module: {
    loaders: [
      {
        test: /[.js|.jsx]$/,
        loader: require.resolve('babel-loader'),
        query: { presets },
      },
    ],
  },
  plugins: minify ? getPlugins() : [],
});

const config = (entry, out, bundleName, experimental) => {
  const libraryName = utils.stripExtension(bundleName);

  // options for base bundle
  const baseOptions = {
    entry,
    out,
    libraryName,
    bundleName,
    presets: getPresets(experimental),
  };

  // options for minified bundle extend from baseOptions
  const minOptions = Object.assign({}, baseOptions, {
    bundleName: `${libraryName}.min.js`,
    minify: true,
  });

  return [
    getConfig(baseOptions),
    getConfig(minOptions),
  ];
};

module.exports = config;
