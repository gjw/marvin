var fs = require('fs');
var path = require('path');
var util = require('util');
var glob = require('glob');
var wrench = require('wrench');

var Handlebars = require('./handlebars.js');
var Browser = require('../utils/browser.js');

var config = require('../utils/config.js');
var i18n = require('./i18n');


var reporterDir = path.join('node_modules', 'marvin-js', 'lib', 'reporter');
var templatesDir = path.join(reporterDir, 'templates');

function mergeResults(resultsDir) {
  var stats = {
    passes: 0,
    failures: 0,
    skipped: 0,
    duration: 0,
    threads: config.threads
  };

  var browsers = {};
  var features = [];
  var durations = [];

  glob.sync(path.join(resultsDir, '*.json')).forEach(function (file) {

    var results = JSON.parse(fs.readFileSync(file));
    var browser = new Browser(results.browser);
    var browserKey = browser.getKey();

    // merge feature
    if (!browsers[browserKey]){
      browsers[browserKey] = results.browser;
      browsers[browserKey].features = results.features;
    }
    else {
      results.features.forEach(function(feature) {
        browsers[browserKey].features.push(feature);
      });
    }

    browsers[browserKey].features = sortByFeature(browsers[browserKey].features);

    // merge general stats
    stats.passes += (results.stats.passes - results.stats.skipped);
    stats.failures += results.stats.failures;
    stats.skipped += results.stats.skipped;
    durations.push(results.stats.duration);

    // remove original thread's report
    fs.unlinkSync(file);
  });

  stats.duration = Math.max.apply(Math, durations) / 1000;

  return { stats: stats, browsers: browsers };
}

function sortByFeature(features) {
  return features.sort(function (a, b) {
    a = a.title.toLowerCase();
    b = b.title.toLowerCase();
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

module.exports.prepareResults = function(resultsDir) {
  copyAssets(reporterDir, config.resultsDir);
  var data = mergeResults(resultsDir);
  var report = createHtmlReport(data);
  fs.writeFileSync(path.join(resultsDir, 'index.html'), report);
  logSummary(data.stats);
};

function copyAssets(source, dest) {
  wrench.copyDirSyncRecursive(path.join(source, 'assets'), path.join(dest, 'assets'));
}

function createHtmlReport(data) {
  var template = fs.readFileSync(path.join(templatesDir, 'template.html'));
  var templateFn = Handlebars.compile(template.toString());
  var logsTemplate = fs.readFileSync(path.join(templatesDir, '_logs.html'));
  Handlebars.registerPartial('_logs', logsTemplate.toString());
  return templateFn(data);
}

function logSummary(stats) {
  var status = stats.failures > 0 ? i18n.get('failed') : i18n.get('passed');
  var msg = "Marvin tests %s!\n%s:%d\n%s:%d\n%s:%d\n%s:%d";
  return util.format(msg, status, i18n.get('passed'), stats.passes, i18n.get('failed'),
    stats.failures, i18n.get('skipped'), stats.skipped, i18n.get('duration'), stats.duration);
}
