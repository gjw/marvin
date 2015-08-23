var fs = require('fs');
var path = require('path');
var util = require('util');

var glob = require('glob');
var wrench = require('wrench');
var Handlebars = require('handlebars');

var config = require('marvin-js').config;
var i18n = require('./i18n');

Handlebars.registerHelper('ifEqual', function(a, b, options) {
  if(a != b) {
    return options.inverse(this);
  } 
  return options.fn(this);
});

Handlebars.registerHelper('i18n', function (str) {
  return i18n.get(str);
});


var reporterDir = path.join('node_modules', 'marvin-js', 'lib', 'reporter');

function mergeResults(resultsDir) {
  var stats = {
    passes: 0,
    failures: 0,
    skipped: 0,
    duration: 0,
    threads: config.threads
  };
  var features = [];
  var durations = [];
  glob.sync(path.join(resultsDir, '*.json')).forEach(function (file) {
    thread = JSON.parse(fs.readFileSync(file));
    stats.passes += (thread.stats.passes - thread.stats.skipped);
    stats.failures += thread.stats.failures;
    stats.skipped += thread.stats.skipped;
    durations.push(thread.stats.duration);

    thread.features.forEach(function (feature) {
      features.push(feature);
    });
    features = sortByFeature(features);
    fs.unlinkSync(file);
  });
  stats.duration = Math.max.apply(Math, durations) / 1000;
  return { stats: stats, features: features };
}

function sortByFeature(features) {
  return features.sort(function (a, b) {
    a = a.title.toLowerCase();
    b = b.title.toLowerCase();
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

module.exports.prepareResults = function(resultsDir) {
  
  var baseResultsDir = config.resultsDir || 'results';
  
  copyAssets(reporterDir, baseResultsDir);

  copyScreenshots(baseResultsDir, resultsDir);

  var data = mergeResults(resultsDir);

  var report = createHtmlReport(data);

  fs.writeFileSync(path.join(resultsDir, 'index.html'), report);
  
  logSummary(data.stats);

};

function copyAssets(source, dest) {
  wrench.copyDirSyncRecursive(path.join(source, 'assets'), path.join(dest, 'assets'));
}

function copyScreenshots(source, dest){
  source = path.join(source, 'screenshots');
  wrench.copyDirSyncRecursive(source, path.join(dest, 'screenshots'), { forceDelete: true });
  wrench.rmdirSyncRecursive(source);
}

function createHtmlReport(data) {
  var template = fs.readFileSync(path.join(reporterDir, 'template.html'));
  var templateFn = Handlebars.compile(template.toString());
  return templateFn(data);
}

function logSummary(stats) {
  var status = stats.failures > 0 ? i18n.get('failed') : i18n.get('passed');
  var msg = "Marvin tests %s!\n%s:%d\n%s:%d\n%s:%d\n%s:%d";
  return util.format(msg, status, i18n.get('passed'), stats.passes, i18n.get('failed'),
    stats.failures, i18n.get('skipped'), stats.skipped, i18n.get('duration'), stats.duration);
}
