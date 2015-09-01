
var fs = require('fs');
var i18n = require('./i18n');
var path = require('path');
var util = require('util');

var config = require('../utils/config.js');
var session = require('marvin-js').session;
var logger = require('marvin-js').log;

var MochaBaseReporter = require('mocha').reporters.Base;
var color = MochaBaseReporter.color;

exports = module.exports = function MarvinReporter(runner) {

  MochaBaseReporter.call(this, runner);

  this.stats.skipped = 0;

  var jsonOut = path.join(config.resultsDir, session.launchDate, process.pid.toString() + '.json');

  var result = { features: session.queue };
  var feature = null;
  var scenario = null;
  var level = 0;
  
  // execution complete
  runner.on('end', function () {
    result.stats = this.stats;
    result.browser = session.browser;
    fs.writeFileSync(jsonOut, JSON.stringify(result));
  });

  // test suite execution started
  runner.on('suite', function (suite) {
    if (suite.root) {
      return;
    }
    if (!feature) {
      feature = {
        title: suite.title,
        thread: session.thread,
        scenarios: []
      };
    } else {
      scenario = {
        title: suite.title,
        steps: []
      };
      level++;
    }
  });

  // all tests (and sub-suites) have finished
  runner.on('suite end', function (suite) {
    if (suite.root) {
      return;
    }
    if (level === 0) {
      result.features.forEach(function (f) {
        if (f.title === feature.title) {
          for (var attr in feature) { 
            f[attr] = feature[attr]; 
          }
        }
      });
      logFeatureSteps(feature);
      feature = null;
    } else {
      feature.scenarios.push(scenario);
      scenario = null;
      level--;
    }
  });

  // test passed
  runner.on('pass', function (test) {
    var step = {
      title: test.title,
      speed: test.speed,
      duration: test.duration,
      logs: logger.logs
    };
    if (scenario.status === 'fail') {
      step.status = 'skipped';
      this.stats.skipped++;
    } else {
      step.status = 'pass';
      scenario.status = 'pass';
    }
    scenario.steps.push(step);
  });

  // test pending
  runner.on('pending', function (test) {
    scenario.steps.push({
      title: test.title,
      status: 'pending',
      logs: logger.logs
    });
    scenario.status = 'pending';
  });

  // test failed
  runner.on('fail', function (test) {
    var errorStr = test.err.stack || test.err.toString();
    if (!~errorStr.indexOf(test.err.message)) {
      errorStr = test.err.message + '\n' + errorStr;
    }
    if (!test.err.stack && test.err.sourceURL && test.err.line !== undefined) {
      errorStr += "\n(" + test.err.sourceURL + ":" + test.err.line + ")";
    }
    if (!feature) {
      console.log(errorStr);
    }
    if (scenario) {
      scenario.steps.push({
        title: test.title,
        status: 'fail',
        speed: test.speed,
        duration: test.duration,
        error: errorStr,
        logs: logger.logs
      });
      scenario.status = 'fail';
    }
  });
};


function logFeatureSteps(feature) {
  var buffer = '';
  buffer += util.format('%s: %s (finished on thread: %s)\n', i18n.get('feature'), feature.title, feature.thread);
  feature.scenarios.forEach(function (scenario) {
    buffer += util.format('   %s: %s\n', i18n.get('scenario'), scenario.title);
    scenario.steps.forEach(function (step) {
      if (step.status == 'pass') {
        buffer += util.format(color('checkmark', '     %s'), MochaBaseReporter.symbols.ok);
        if (step.speed == 'fast') {
          buffer += util.format(color('pass', ' %s \n'), step.title);
        } else {
          buffer += util.format(color('pass', ' %s '), step.title);
          buffer += util.format(color(step.speed, '(%dms)\n'), step.duration);
        }
      } else if (step.status == 'fail') {
        buffer += util.format(color('fail', '     X %s\n'), step.title);
        buffer += color('fail', step.error + '\n');
      } else if (step.status == 'pending') {
        buffer += util.format(color('pending', '     - %s\n'), step.title);
      } else if (step.status === 'skipped') {
        buffer += util.format(color('medium', '     - %s\n'), step.title);
      }
    });
  });
  console.log(buffer);
}
