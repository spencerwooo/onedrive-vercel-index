module.exports = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false, stream: false, constants: false };

    // load worker files as a urls with `file-loader`
    config.module.rules.unshift({
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
    });

    return config;
  },
  reactStrictMode: true,
  images: {
    domains: ['public.dm.files.1drv.com'],
  },
}
