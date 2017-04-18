'use strict';

const utils = require("./utils");
const LoopRecorder = require("./LoopRecorder");
const Display = require("./display");
const $ = require('jQuery');

function showMessage(msg) {
    $("#results").append(msg);
}

let BSdisplay = new Display(document.getElementById("beat_spectrum"), 600, 100);
let WaveDisplay = new Display(document.getElementById("waveform"), 600, 100);
let DiagDisplay = new Display(document.getElementById("diagonal"), 600, 100);

let loopDisplays = [];
for(let i=1;i<6;i++){
  loopDisplays.push (new Display(document.getElementById("loop"+i), 600, 50));
}

function drawBS(data){
  BSdisplay.update(loopRecorder.beatSpectrum.data);
  let waveform = loopRecorder.waveform.map((x) => {return (x + 1) / 2});
  WaveDisplay.update(waveform);
  for(let i=0;i<Math.min(5, loopRecorder.loops.length);i++){
      loopDisplays[i].update(loopRecorder.loops[i].waveform.map((x) => {return (x + 1) / 2}));
  }
}

let audioContext = new AudioContext();
let loopRecorder = new LoopRecorder(audioContext, drawBS);
let source;


if (!navigator.getUserMedia) {
    navigator.getUserMedia = navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia;
}

if (!navigator.getUserMedia) {
     showMessage("Your borwser does not support recording.");
} else {
    navigator.getUserMedia(
        {audio: true}, (stream)=>{loopRecorder.gotStream(stream)}, function(err) {showMessage(err)}
    );
}


window.toggleRecording = function(e) {
    if (e.classList.contains("btn-danger")) {
        loopRecorder.stop();
        e.classList.remove("btn-danger");
    } else {
        if (!loopRecorder.ready) {
                showMessage("Please allow me to use the microphone");
                return;
        }
        e.classList.add("btn-danger");
        loopRecorder.start();
    }
}

window.playLoop = function(e, n){
  if (e.classList.contains("btn-danger")) {
      source.stop();
      e.classList.remove("btn-danger");
  } else {
      e.classList.add("btn-danger");
      source = audioContext.createBufferSource();
      source.buffer = loopRecorder.loops[n-1].buffer;
      source.connect(audioContext.destination);
      source.loop = true;
      source.start();
  }
}


module.exports = toggleRecording;
