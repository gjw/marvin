var config = require('marvin-js').config;
var session = require('marvin-js').session;

(function checkConfiguration() {

  var MANDATORY_CONFIGURATION_FIELDS = ['browsers', 'baseUrl', 'featuresDir', 'stepsDir', 'resultsDir'];

  function ConfigError(opt) {
    this.name = 'ConfigError';
    this.message = "'" + opt + "' missing from Marvin config.";
  }

  ConfigError.prototype = new Error();

  MANDATORY_CONFIGURATION_FIELDS.forEach(function(opt) {
    if (!config[opt]){
      throw new ConfigError(opt);
    }
  });

}());


var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');


var wrench = require('wrench');


(function prepareResultDirectory() {

  if (config.clean && fs.existsSync(config.resultsDir)) {
    wrench.rmdirSyncRecursive(config.resultsDir);
  }

  var now = new Date();
  session.launchDate = now.toUTCString().slice(5, -4).toLowerCase().replace(/[:\s]/g, "-");
  
  wrench.mkdirSyncRecursive(path.join(config.resultsDir, session.launchDate, 'screenshots'));

}());


var builder = require('../lib/reporter/builder');
var parser = require('../lib/utils/feature-parser');


(function prepareTests() {

  var threads = config.threads || 1;
  var features = parser.parseFeatures(config.featuresDir, config.tags, config.language);

  session.queues = []; 

  var i = 0;
  while(i < features.length) {
    var size = Math.ceil((features.length - i) / threads--);
    session.queues.push(features.slice(i, i + size));
    i += size;
  }

}());





var failed = false;
var mochaDir = path.join('node_modules', 'marvin-js', 'lib', 'test-runner', 'mocha');

config.browsers.forEach(function (browser) {
  session.queues.forEach(function(queue, index) {
    // launch mocha in a different thread
    var thread = childProcess.fork(mochaDir, process.argv);
    thread.send({ mocha: true, thread: index, browser: browser, queue: queue, launchDate: session.launchDate });
    thread.on("exit", function(code) {
      if (code > 0) {
        failed = true;
      }
    });
  });
});



process.on('exit', function() {
  if (config.reporter === 'marvin') {
    builder.prepareResults(path.join(config.resultsDir, session.launchDate));
  }
  if (failed) process.exit(2);
});






