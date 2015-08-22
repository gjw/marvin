var config  = require('marvin').config;
var session = require('marvin').session;
var Mocha   = require('mocha');
var path    = require('path');

process.on('message', function (msg) {

  if (msg.mocha) {

    session.thread = msg.thread;
    session.queue = msg.queue;

    var reporter = (config.reporter === 'marvin') ? '../../../lib/reporter' : config.reporter;
    var mocha = new Mocha({
      reporter: reporter,
      timeout: config.testTimeout || 60000,
      slow: config.slow || 10000
    });

    mocha.addFile(
      path.join('node_modules', 'marvin', 'lib', 'env', 'yadda.js')
    );

    session.create().then(function() {
      mocha.run(function (failures) {
        process.exit(failures);
      });
    });

  }

});
