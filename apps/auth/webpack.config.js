const path = require("node:path")
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');

const workspaceRoot = path.join(__dirname, "../..")

module.exports = {
  output: {
    path: path.join(__dirname, '../../dist/apps/auth'),
    devtoolModuleFilenameTemplate: (info) => { // ref: https://webpack.js.org/configuration/output/#outputdevtoolmodulefilenametemplate
      const rel = path.relative(workspaceRoot, info.absoluteResourcePath)
      return `webpack:///./${rel}`
    }
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMap: true
    }),
  ],
};