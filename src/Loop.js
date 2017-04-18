const utils = require("./utils");
const blas1 = require('ndarray-blas-level1');
const ops = require("ndarray-ops");
const ndarray = require("ndarray");

class Loop{
    constructor(waveform, frames, start, end, context) {
        this.start = this.findZeroCrossing(start, waveform);
        this.end = this.findZeroCrossing(end, waveform);
        this.frames = frames;
        this.waveform = waveform.slice(this.start, this.end);
        this.context = context;
        this.buffer = context.createBuffer(1, this.waveform.length, context.sampleRate);
        this.buffer.copyToChannel(this.waveform, 0);
    }

    findZeroCrossing(pos, arr){
      if (pos - 10 < 0) pos = 10;
      if(pos + 10 > arr.length) pos = arr.length - 10;
      for(let i = pos-10;i<pos+10;i++){
        if(arr[i]*arr[i+1]<0) return i;
      }
      return pos;
    }
    featureVector(){
      let sum = this.frames.reduce((a,b) => {return a.map((n,i)=>a[i]+b[i])});
      return sum.map(x=>{return x/sum.length});
    }

}

module.exports = Loop
