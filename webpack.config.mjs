export default {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: ['node_modules'],
        use: ['babel-loader'],
      },
    ],
  },
};
