const distance = require("ndarray-distance")
const ndarray = require("ndarray")
const zeros = require("zeros")
const blas1 = require('ndarray-blas-level1');

class SSM{

    process(frames) {
      let n = frames.length;
      let matrix = zeros([n,n]);
      for (let i = 0; i < n; i++){
        let a = ndarray(frames[i]);
        let a_norm =  blas1.nrm2(a);
        for (let j = i; j < n; j++){
          // TODO: add options for other distances
          //matrix.set(i, j, 1 / (1 + distance( ndarray(frames[i]),ndarray(frames[j]), 2)));
          let b = ndarray(frames[j]);
          matrix.set(i, j, blas1.dot(a, b) / (a_norm *  blas1.nrm2(b)));
        }
      }
      return matrix;
    }
}

module.exports = SSM;
