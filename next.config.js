module.exports = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false, stream: false, constants: false };

    config.module.rules.unshift(
      // load worker files as a urls with `file-loader`
      {
        test: /pdf\.worker\.(min\.)?js/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[contenthash].[ext]",
              publicPath: "_next/static/worker",
              outputPath: "static/worker"
            }
          }
        ]
      },
      // load lua script content as a string
      {
        test: /\.lua$/,
        type: 'asset/source'
      }
    );

    return config;
  },
  reactStrictMode: true,
  images: {
    domains: ['public.dm.files.1drv.com'],
  },
}
