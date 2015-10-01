
'use strict';

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
    if (!browsers[browserKey]) {
      browsers[browserKey] = results.browser;
      browsers[browserKey].features = results.features;
    }
    else {
      results.features.forEach(function (feature) {
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
    if (!config.preservePartials) {
      fs.unlinkSync(file);
    }
  });

  stats.duration = Math.max.apply(Math, durations) / 1000;

  addFailureInsigths(browsers);

  return {stats: stats, browsers: browsers};
}

function sortByFeature(features) {
  return features.sort(function (a, b) {
    a = a.title.toLowerCase();
    b = b.title.toLowerCase();
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

module.exports.prepareResults = function (resultsDir) {
  copyAssets(reporterDir, config.resultsDir);
  var data = mergeResults(resultsDir);
  fs.writeFileSync(path.join(resultsDir, 'results.json'), JSON.stringify(data));
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
  return templateFn(data);
}

function logSummary(stats) {
  var status = stats.failures > 0 ? i18n.get('failed') : i18n.get('passed');
  var msg = "Marvin tests %s!\n%s:%d\n%s:%d\n%s:%d\n%s:%d";
  return util.format(msg, status, i18n.get('passed'), stats.passes, i18n.get('failed'),
    stats.failures, i18n.get('skipped'), stats.skipped, i18n.get('duration'), stats.duration);
}




function addFailureInsigths(browsers) {
  for (var k in browsers){
    if (browsers.hasOwnProperty(k)){

      // get the number of time a failed step failed
      let failedSteps = getFailedSteps(browsers[k].features);

      // for each failed step get all its result, 
      // and then compute the failure percentage
      let result = {};
      failedSteps.forEach(function(failedStep) {
        result[failedStep] = getStepStatus(failedStep, browsers[k].features);
        result[failedStep].failurePercentage = getFailurePercentage(result[failedStep]);
      });

      browsers[k].insights = result;
    }
  }
}

function getFailedSteps(features) {
  var failedSteps = [];
  features.forEach(function(feature) {
    let scenarios = feature.scenarios;
    let failedScenarios = scenarios.filter(function(scenario) { return scenario.status != "pass"; });
    failedScenarios.forEach(function(scenario) {
      let step = scenario.steps.filter(function(step) { return step.status == "fail"; });
      if (step.length > 0){
        let stepName = step[0].title;
        if (failedSteps.indexOf(stepName) == -1) {
          failedSteps.push(stepName);
        }
      }
    });
  });
  return failedSteps;
}

function getStepStatus(failedStep, features){
  var count = { pass: 0, fail: 0, pending: 0 };
  features.forEach(function(feature) {
    feature.scenarios.forEach(function(scenario) {
      let steps = scenario.steps.filter(function(step) { return step.title == failedStep; });
      steps.forEach(function(step) {
        count[step.status] += 1;
      });
    });
  });
  return count;
}

function getFailurePercentage(count){
  var usages = count.pass + count.fail + count.pending;
  var failurePercentage = 0;
  if (usages != 0){
    failurePercentage = (count.fail * 100) / usages;
  }
  return failurePercentage.toFixed(2);
}