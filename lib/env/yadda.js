var parser  = require('../utils/feature-parser');
var session = require('marvin').session;
var config  = require('marvin').config;
var Yadda   = require('yadda');
var glob    = require('glob');
var chai    = require('chai');
var path    = require('path');

// @todo remove coffee-script
//require('coffee-script/register');

var language = parser.getLanguage(config.language);

Yadda.plugins.mocha.StepLevelPlugin.init({ language: language });
chai.should();

features(session.queue, function (feature) {

  scenarios(feature.scenarios, function (scenario) {

    steps(scenario.steps, function (step, done) {
      if (step === scenario.steps[0]) session.reset();
      session.execute(function () {
        new Yadda.Yadda(loadStepDefs(language)).yadda(step);
      }).then(done);
    });

  });
});

function loadStepDefs(language) {
  var dictionary = new Yadda.Dictionary();
  var library = new language.library(dictionary);
  var currentDirectory = path.dirname(process.argv[1]);

  glob.sync(config.stepsDir + "/**/*.+(js|coffee)").forEach(function (file) {
    var steps = require(path.join(currentDirectory, '../../../../', file));
    try {
      steps.define(library);
    } catch (e) {
      if (e instanceof TypeError) {
        console.warn("*** File: "+ file + " contained no step definitions\n");
      }
    }
  });
  return library;
}

afterEach(function () {
  if (this.currentTest.state !== 'passed') {
    session.saveScreenshot(this.currentTest.title);
  }
});

after(function (done) {
  session.getDriver().quit().then(done);
});
