const _ = require("lodash");
const filters = require('filters');


function detrend(arr){
  filtered = filters.average(arr.slice(), 50);
  return arr.map((x,i) => x-filtered[i])
}

function smooth(arr, avSize = 20, medianSize = 200){
  copy = arr.slice();
  copy = filters.average(copy, avSize);
  copy = filters.median(copy, medianSize);
  return copy;
}

function diff(arr){
  let d = arr.slice();
  d.unshift(0);
  result = d.slice();

  for(let i = 1;i<d.length;i++){
    result[i] = d[i] - d[i-1];
  }
  result.shift();
  return result;
}


function findPlateau(arr){
  let d = diff(diff(arr.slice()));
  let regions = new Array(d.length);
  let currentRegion = null;

  let minLength = 20;
  let threshold = _.max(d)/100;

  let thresholdValue = percentile(arr, 0.5);

  for(let i = 10;i<d.length;i++){
    if(Math.abs(d[i]) < threshold && arr[i] > thresholdValue){ //&& arr[i] > thresholdValue
      if(currentRegion == null){
        regions[i] = 1;
        currentRegion = i;
      }
      else {
        regions[currentRegion]++;
        if (regions[currentRegion] > minLength) {
          return currentRegion;
        }
      }
    }
    else{
      currentRegion = null;
    }
  }
}

let findMaxPeak = function(arr){
  let max = 0;
  for (let i = 10; i < arr.length  / 2; ++i) {
    if (arr[i-1] < arr[i] && arr[i] > arr[i+1] && arr[i] > max){
        max = arr[i];
    }
  }
  return arr.indexOf(max);
}

let findPeaks = function(arr, start){
  let peaks = [];
  for (let i = start; i < arr.length  / 2; ++i) {
    if (arr[i-1] < arr[i] && arr[i] > arr[i+1]){
        peaks.push(i);
    }
  }
  peaks.sort((a,b)=>{return arr[a] > arr[b] ? -1 : 1});
  return peaks;
}

function threshold(arr, value){
  let thresholdValue = percentile(arr, value);
  let i = 0;
  while (arr[i] < thresholdValue) i++;
  return i;
}

function percentile(arr, value){
  let sorted = arr.slice().sort();
  let index = Math.floor(arr.length * value);
  return sorted[index];
}


module.exports = {
  detrend:detrend,
  smooth:smooth,
  diff:diff,
  findPlateau:findPlateau,
  findMaxPeak:findMaxPeak,
  findPeaks:findPeaks,
  threshold:threshold,
  percentile:percentile
};
