var path = require('path');

var session = require('marvin-js').session;

var Mocha = require('mocha');


process.on('message', function (msg) {

  if (msg.mocha) {

    session.thread = msg.thread; // @todo rename the thread in order to track also the current browser
    session.launchDate = msg.launchDate;
    session.queue = msg.queue;
    session.browser = msg.browser;

    // @todo clean reporter path
    var reporter = session.config.reporter === 'marvin' ? '../../../lib/reporter' : session.config.reporter;
    
    var mocha = new Mocha({
      reporter: reporter,
      timeout: session.config.testTimeout || 60000,
      slow: session.config.slow || 10000
    });

    mocha.addFile(path.join('node_modules', 'marvin-js', 'lib', 'test-runner', 'yadda.js'));

    session.create(session.browser).then(function() {
      mocha.run(function (failures) {
        process.exit(failures);
      });
    });

  }

});
