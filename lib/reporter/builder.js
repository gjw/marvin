var fs = require('fs');
var path = require('path');
var util = require('util');


var config = require('marvin-js').config;



var glob = require('glob');
var wrench = require('wrench');


var i18n = require('./i18n');






var Handlebars = require('handlebars');

Handlebars.registerHelper('ifEqual', function(a, b, options) {
  if(a != b) {
    return options.inverse(this);
  } 
  return options.fn(this);
});

Handlebars.registerHelper('i18n', function (str) {
  return i18n.get(str);
});


module.exports.createHtmlReport = function(resultsDir) {
  
  var reporterPath = path.join('node_modules', 'marvin-js', 'lib', 'reporter');



  var data = mergeResults(resultsDir);

  var source = fs.readFileSync(path.join(reporterPath, 'template.html'));
  var template = Handlebars.compile(source.toString());
  var result = template(data);

  copyAssets(reporterPath, config.resultsDir || 'results');




  fs.writeFileSync(path.join(resultsDir, 'index.html'), result);
  


  logSummary(data.stats);

};

function copyAssets(source, dest) {
  wrench.copyDirSyncRecursive(path.join(source, 'assets'), path.join(dest, 'assets'));
}

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


function logSummary(stats) {
  var status = stats.failures > 0 ? i18n.get('failed') : i18n.get('passed');
  var msg = "Moonraker tests %s!\n%s:%d\n%s:%d\n%s:%d\n%s:%d";
  return util.format(msg, status, i18n.get('passed'), stats.passes, i18n.get('failed'),
    stats.failures, i18n.get('skipped'), stats.skipped, i18n.get('duration'), stats.duration);
}



