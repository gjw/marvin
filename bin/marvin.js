var config       = require('marvin-js').config;


// @todo remove wrench as dependency




var childProcess = require('child_process');
var fs           = require('fs');
var path         = require('path');
var wrench       = require('wrench');
var builder      = require('../lib/reporter/builder');
var parser       = require('../lib/utils/feature-parser');

checkConfig();
resetWorkSpace();

var features = parser.parseFeatures(config.featuresDir, config.tags, config.language);
var queues   = createQueues(features, config.threads || 1);
var failed   = false;

queues.forEach(function(queue, index) {
  var thread = childProcess.fork('./node_modules/marvin/lib/env/mocha', process.argv);
  thread.send({ mocha: true, thread: index + 1, queue: queue });
  thread.on("exit", function(code) {
    if (code > 0) failed = true;
  });
});

process.on('exit', function() {
  if (config.reporter === 'marvin') builder.createHtmlReport();
  if (failed) process.exit(2);
});

function resetWorkSpace() {
  var resultsDir = config.resultsDir || 'results';
  if (fs.existsSync(resultsDir)) {
    wrench.rmdirSyncRecursive(resultsDir);
  }
  wrench.mkdirSyncRecursive(path.join(resultsDir, 'screenshots'));
}

function createQueues(features, threads) {
  var len = features.length, queues = [], i = 0;
  while (i < len) {
    var size = Math.ceil((len - i) / threads--);
    queues.push(features.slice(i, i + size));
    i += size;
  }
  return queues;
}

function checkConfig() {
  ['browser', 'baseUrl', 'featuresDir', 'stepsDir'].forEach(function (opt) {
    if (!config[opt]) throw new ConfigError(opt);
  });
}

function ConfigError(opt) {
  this.name = 'ConfigError';
  this.message = "'" + opt + "' missing from Moonraker config.";
}

ConfigError.prototype = new Error();
