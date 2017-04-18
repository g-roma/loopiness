const Recorder = require("recorderjs");
const STFT = require("stft.js");
const BeatSpectrum = require("./BeatSpectrum");
const SSM = require("./SSM");
const ndarray = require("ndarray");
const utils = require("./utils");
const Loop = require("./Loop");
const blas1 = require('ndarray-blas-level1');
const ops = require("ndarray-ops");
const distance = require("ndarray-distance")


class LoopRecorder {
    constructor(context, doneFunc) {
        this.audioContext = context;
        this.ready = false;
        this.windowSize = 1024;
        this.hopSize = 512;
        this.hopSecs = this.hopSize / 44100;
        this.stft = new STFT(this.windowSize, this.windowSize, this.hopSize);
        this.ssm = new SSM();
        this.bs = new BeatSpectrum();
        this.doneFunc = doneFunc;
        this.loops = [];
        this.nFilters = 24;
        this.barkBands = xtract_init_bark(this.windowSize / 2 + 1, this.audioContext.sampleRate, this.nFilters);
    }

    gotStream(stream) {
        this.inputPoint = this.audioContext.createGain();
        this.audioInput = this.audioContext.createMediaStreamSource(stream);
        this.audioInput.connect(this.inputPoint);
        this.recorder = new Recorder(this.inputPoint);
        this.ready = true;
    }

    findZeroCrossing(pos){
      let arr = this.waveform;
      for(let i = pos-10;i<pos+10;i++){
        if(arr[i]*arr[i+1]<0) return i;
      }
      return pos;
    }


    addLoop(start, end){
      this.loops.push(new Loop(
        this.waveform, this.features.slice(start, end),
        this.hopSize * start,
        this.hopSize * end,
        this.audioContext));
    }


    sortLoops(){
      let features = this.loops.map((loop) => loop.featureVector());
      let sum = features.reduce((a,b) => {return a.map((n,i)=>a[i]+b[i])});
      return sum.map(x=>{return x/sum.length});

      this.loops.sort((a,b)=>{
        let aDist = distance(ndarray(a.featureVector()), centroid, 2);
        let bDist = distance(ndarray(b.featureVector()), centroid, 2);
        if(aDist < bDist) return -1;
        if(aDist > bDist) return 1;
        return 0;
      });
    }

    segment(){
      let peaks = utils.findPeaks(utils.detrend(this.beatSpectrum.data), 10);
      let maxPos = peaks[0];

      let n = this.beatSpectrum.shape[0];
      this.diag = Array(n - maxPos).fill(0);
      for (let i = 0; i < n - maxPos; i++){
          this.diag[i] = this.similarity.get(i, i + maxPos);
      }
      this.diag =  utils.smooth(this.diag);
      let start = utils.findPlateau(this.diag);

      if(start == null) {
        start = utils.threshold(this.diag, 0.7);
      }

      this.loops = [];
      this.addLoop(start,start + maxPos);
      this.addLoop(start + maxPos, start + (2 * maxPos));
      for(let i = 1; i < peaks.length; i++){
          let ratio = peaks[i] / maxPos;
          let deviation = Math.abs(ratio - Math.round(ratio));
          if(deviation < 0.1){
            this.addLoop(start + (i+1) * maxPos, start + (i+2) * maxPos);
          }
      }
    }

    stop(){
      this.recorder.stop();
      this.recorder.getBuffer((buffers) => {this.detectLoops(buffers)});
    }

    start(){
      this.loops = [];
      this.recorder.clear();
      this.recorder.record();
    }

    detectLoops(buffers){
        this.waveform = buffers[0];
        this.spectrogram = this.stft.analyze(this.waveform);
        this.features = this.spectrogram.map(frame => {
          return xtract_bark_coefficients(frame,this.barkBands);
        });
        this.similarity = this.ssm.process(this.features);
        this.beatSpectrum = this.bs.process(this.similarity);
        this.segment();
        this.sortLoops();
        this.doneFunc();
    }
}

module.exports = LoopRecorder;
