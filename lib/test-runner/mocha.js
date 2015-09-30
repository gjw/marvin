var path = require('path');
var util = require('util');

var config = require('../utils/config.js');
var Browser = require('../utils/browser.js');
var session = require('marvin-js').session;


var Mocha = require('mocha');


process.on('message', function (msg) {

  if (msg.mocha) {

    var browser = new Browser(msg.browser);

    session.thread = util.format("%d-%s", msg.thread, browser.getKey());
    session.launchDate = msg.launchDate;
    session.queue = msg.queue;
    session.browser = browser;
    
    var mocha = new Mocha({
      reporter: config.reporter === 'marvin' ? path.join(process.cwd(), 'node_modules', 'marvin-js', 'lib', 'reporter') : config.reporter,
      timeout: config.testTimeout || 60000,
      slow: config.slow || 10000
    });

    mocha.addFile(path.join('node_modules', 'marvin-js', 'lib', 'test-runner', 'yadda.js'));

    session.create(session.browser).then(function() {
      mocha.run(function (failures) {
        process.exit(failures);
      });
    });

  }

});
