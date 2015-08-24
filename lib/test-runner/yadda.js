var path = require('path');

var Yadda = require('yadda');
var glob = require('glob');
var chai = require('chai');

var parser  = require('../utils/feature-parser');
var session = require('marvin-js').session;
var config = require('marvin-js').config;


// make chalk global so that it can be used in the step's definition
chalk = require('chalk').bold;

// make chai's expect global so that it can be used in the step's definition
expect = chai.expect;


var language = parser.getLanguage(config.language);

Yadda.plugins.mocha.StepLevelPlugin.init({ language: language });


chai.should();


var library = loadStepDefs(language);

var yaddaInterpreter = new Yadda.Yadda(library);

features(session.queue, function (feature) {

  scenarios(feature.scenarios, function (scenario) {

    steps(scenario.steps, function (step, done) {
      
      if (step === scenario.steps[0]) {
        session.reset();
      }
      
      session.execute(function () {
        // run the current test step
        session.currentStep = step;
        yaddaInterpreter.run(step);
      }).then(done);

    });

  });
});




function loadStepDefs(language) {

  // @todo split in more pieces

  var dictionary = new Yadda.Dictionary();

  if (config.dictionaryFile){
    var customDict = null;
    try{
      customDict = require(path.join(process.cwd(), config.dictionaryFile));
    }catch(e){
      console.warn("*** Fail during custom dictionary access:", e.message);
    }
    if (customDict){
      try{
        for(var k in customDict){
          if (customDict.hasOwnProperty(k)){
            dictionary.define(k, new RegExp(customDict[k].regexp, customDict[k].flags))
          }
        }
      }
      catch(e){

        // @todo improve error handler
        console.warn("*** Fail", e.message);
      }
    }
  }

  var library = new language.library(dictionary);


  glob.sync(config.stepsDir + "/**/*.js").forEach(function (file) {
    var steps = require(path.join(process.cwd(), file));
    try {
      steps.define(library);
    } 
    catch (e) {
      if (e instanceof TypeError) {
        console.warn("*** File: " + file + " contained no step definitions\n");
      }
      else {
        throw e.message;
      }
    }
  });
  return library;
}









afterEach(function () {
  if (config.capture || this.currentTest.state !== 'passed') {
    session.saveScreenshot(this.currentTest.title);
  }
});

after(function (done) {
  session.currentStep = null;
  session.getDriver().quit().then(done);
});
