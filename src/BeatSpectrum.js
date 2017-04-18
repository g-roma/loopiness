const distance = require("ndarray-distance")
const ndarray = require("ndarray")
const zeros = require("zeros")
const blas1 = require('ndarray-blas-level1');


class BeatSpectrum{

    process(SSM) {
      let n = SSM.shape[0]
      let BS = zeros([n]);
      for (let lag = 0; lag < n; lag++){
        let diag = 0;
        for (let j = 0; j < n - lag; j++){
          diag += SSM.get(j, j + lag)
        }
        BS.set(lag, diag / (n-lag));
      }
      return BS;
  }
};

module.exports = BeatSpectrum;
