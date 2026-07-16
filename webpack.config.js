import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  entry: './src/index.ts',
  output: {
    publicPath: 'auto',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'repro_producer',
      filename: 'remoteEntry.js',
      exposes: {
        './Component': './src/Component.ts',
      },
      dts: true,
    }),
  ],
};
