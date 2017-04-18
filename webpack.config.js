module.exports = {
  entry: './src/app.js',
  output: {
    path: __dirname +'/dist',
    filename: 'loopiness.js'
  },
  devServer: {
    inline: true,
    port: 8888,
  }
}
