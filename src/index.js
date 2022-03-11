#!/usr/bin/env node
let fs = require('fs');
let path = require('path');

//\\192.168.4.64\Drive1
const allowExtensions = ['mkv', 'avi'];

const getShowName = (str) => {
  let arr = /.+[sS]\d+/.exec(str);
  return (arr && arr.length > 0 && arr[0]) || null;
};

module.exports.getShowName = getShowName;

function cleanFiles(parent, files) {
  let richMediaFiles = files.filter((f) => getShowName(f) && allowExtensions.some((ext) => f.endsWith(ext)));
  let output = {};
  richMediaFiles.forEach((file) => {
    1;
    let ext = allowExtensions.filter((e) => file.endsWith(e));
    let shortFileName = /.+[sS]\d+[eE]\d+/.exec(file)[0];
    output[`${shortFileName}.${ext}`] = `${parent}/${file}`;
  });
  return output;
}

function generateAggregatedStructure(input) {
  let shows = {};

  Object.keys(input)
    .filter((key) => input[key].length > 0)
    .filter((key) => getShowName(key))
    .map((key) => {
      let show = getShowName(key);
      if (!(show in shows)) shows[show] = {};
      shows[show] = { ...shows[show], ...cleanFiles(key, input[key]) };
    });
  return shows;
}

// 1. create folder
// 2. copy file
// 3. rename

function aggregate(dir, structure) {
  Object.keys(structure).forEach((show) => {
    console.log(`create dir: ${path.join(dir, show)}`);
    fs.mkdirSync(path.join(dir, show));
    Object.keys(structure[show]).forEach((ep) => {
      console.log(`copy file: ${path.join(dir, structure[show][ep])} to: ${path.join(dir, show, ep)}`);
      fs.copyFileSync(path.join(dir, structure[show][ep]), path.join(dir, show, ep));
    });
  });
}

function readCurrentStructure(dir) {
  let structure = {};
  let files = fs.readdirSync(dir);
  for (let file of files) {
    if (!fs.lstatSync(path.join(dir, file)).isDirectory()) continue;
    structure[file] = [...fs.readdirSync(path.join(dir, file)).filter((f) => typeof f === 'string')];
  }

  return structure;
}

function main() {
  let aggregateDirectory = process.cwd();
  if (process.argv.length > 2) aggregateDirectory = path.normalize(process.argv[2]);
  console.log(`Aggregate directory: ${aggregateDirectory}`);
  const currentStructure = readCurrentStructure(aggregateDirectory);
  const newStructure = generateAggregatedStructure(currentStructure);
  aggregate(aggregateDirectory, newStructure);
}

main();
function test() {
  const input = {
    'American.Dad.S16.Season.16.Complete.1080p.WEBRip.x264-maximersk [mrsktv]': [
      'American.Dad.S16E01.1080p.WEBRip.x264-KSRM.mkv',
      'American.Dad.S16E02.1080p.WEBRip.x264-KSRM.mkv',
      "maximersk's TeamHD.jpg",
    ],
    'Family.Guy.S19.COMPLETE.HULU.720p.WEBRip.x264-GalaxyTV[TGx]': [
      'Family.Guy.S19E01.720p.WEBRip.x264-GalaxyTV.mkv',
      'Family.Guy.S19E02.720p.WEBRip.x264-GalaxyTV.mkv',
      'Family.Guy.S19E03.720p.WEBRip.x264-GalaxyTV.mkv',
    ],
    'Family.Guy.S20E10.1080p.WEB.H264-CAKES[rarbg]': [
      'family.guy.s20e10.1080p.web.h264-cakes.mkv',
      'family.guy.s20e10.1080p.web.h264-cakes.nfo',
      'RARBG.txt',
      'RARBG_DO_NOT_MIRROR.exe',
    ],
    'Family.Guy.S20E08.1080p.WEB.H264-CAKES[rarbg]': [
      'family.guy.s20e08.1080p.web.h264-cakes.mkv',
      'family.guy.s20e08.1080p.web.h264-cakes.nfo',
      'RARBG.txt',
      'RARBG_DO_NOT_MIRROR.exe',
    ],
    'Family.Guy.S20E03.1080p.WEB.H bla bal': [
      'family.guy.s20e03.1080p.web.bla bla.mkv',
      'family.guy.s20e03.1080p.web.bla bla.nfo',
      'RARBG.txt',
    ],
    'Station.Eleven.S01.COMPLETE.720p.HMAX.WEBRip.x264-GalaxyTV[TGx]': [
      '[TGx]Downloaded from torrentgalaxy.to .txt',
      'Station.Eleven.S01E01.720p.HMAX.WEBRip.x264-GalaxyTV.mkv',
      'Station.Eleven.S01E02.720p.HMAX.WEBRip.x264-GalaxyTV.mkv',
      'Station.Eleven.S01E03.720p.HMAX.WEBRip.x264-GalaxyTV.mkv',
      'Station.Eleven.S01E04.720p.HMAX.WEBRip.x264-GalaxyTV.mkv',
    ],
  };
  const expected = {
    'American.Dad.S16': ['American.Dad.S16E01.mkv', 'American.Dad.S16E02.mkv'],
    'Family.Guy.S19': ['Family.Guy.S19E01.mkv', 'Family.Guy.S19E02.mkv', 'Family.Guy.S19E03.mkv'],
    'Family.Guy.S20': ['family.guy.s20e03.mkv', 'family.guy.s20e08.mkv', 'family.guy.s20e10.mkv'],
    'Station.Eleven.S01': [
      'Station.Eleven.S01E01.mkv',
      'Station.Eleven.S01E02.mkv',
      'Station.Eleven.S01E03.mkv',
      'Station.Eleven.S01E04.mkv',
    ],
  };

  let output = algorithm(input);
  console.log(output);
  Object.keys(expected).forEach((key) => {
    if (!(key in output)) throw new Error(`${key} missing in output!`);
    if (!Array.isArray(output[key])) throw new Error(`${key} is not an array!`);
    let expectedStr = JSON.stringify(expected[key].sort());
    let outputStr = JSON.stringify(output[key].sort());
    if (expectedStr !== outputStr)
      throw new Error(`Wrong file structure!\nExpected:\n${expectedStr}\nReceived:${outputStr}`);
  });
}

// test();
