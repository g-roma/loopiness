module.exports = {
  entry: './nu_src/app.js',
  output: {
    path: __dirname +'/dist',
    filename: 'loopiness.js'
  },
  devServer: {
    inline: true,
    port: 8888,
  }
}
