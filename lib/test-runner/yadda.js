var path = require('path');

var Yadda = require('yadda');
var glob = require('glob');
var chai = require('chai');

var parser  = require('../utils/feature-parser');
var config = require('../utils/config.js');
var session = require('marvin-js').session;
var logger = require('marvin-js').log;


// make chalk global so that it can be used in the step's definition
chalk = require('chalk').bold;

// make chai's expect global so that it can be used in the step's definition
expect = chai.expect;

chai.should();


Yadda.plugins.mocha.StepLevelPlugin.init({ language: language });

var language = parser.getLanguage(config.language);
var dictionary = setupDictionary();
var library = new language.library(dictionary);
var stepDefinitions = loadStepDefinitions(library);

var yaddaInterpreter = new Yadda.Yadda(stepDefinitions);

features(session.queue, function (feature) {

  var context = {};

  scenarios(feature.scenarios, function (scenario) {

    steps(scenario.steps, function (step, done) {
      
      if (step === scenario.steps[0]) {
        session.reset();
      }
      
      session.execute(function () {
        if (config.stepDelay){
          // optionally it's possible to delay the step execution
          session.getDriver().sleep(config.stepDelay);
        }
        // run the current test step
        session.currentStep = step;
        session.currentScenario = scenario.title;
        yaddaInterpreter.run(step, {ctx: context});
      }).then(done);

    });

  });
});



function setupDictionary(){
  var dictionary = new Yadda.Dictionary();
  if (config.dictionaryFile){
    var customDict = null;
    try{
      customDict = require(path.join(process.cwd(), config.dictionaryFile));
    }catch(e){
      console.warn(`*** Fail during custom dictionary access: ${e.message}`);
    }
    if (customDict){
      try{
        for(var k in customDict){
          if (customDict.hasOwnProperty(k)){
            dictionary.define(k, new RegExp(customDict[k].regexp, customDict[k].flags));
          }
        }
      }
      catch(e){
        console.warn(`*** Fail during custom RegExp definition, for key ${k}; ${e.message}`);
      }
    }
  }
  return dictionary;
}

function loadStepDefinitions(library) {
  glob.sync(config.stepsDir + "/**/*.js").forEach(function (file) {
    var steps = require(path.join(process.cwd(), file));
    try {
      steps.define(library);
    } 
    catch (e) {
      if (e instanceof TypeError) {
        console.warn(`*** File: ${file} contained no step definitions.`);
      }
      else {
        throw e.message;
      }
    }
  });
  return library;
}


afterEach(function () {

  // screenshot are captured when Mocha's fail hook is triggered
  // here would be too late
  logger.reset();

});

after(function (done) {

  // fixes #6
  // when an error occurs and there aren't other tests which have to run in this same thread, 
  // quitting too early the session causes the failure of the capture of the screenshot
  setTimeout(function() {
    session.currentScenario = session.currentStep = null;
    session.getDriver().quit().then(done); 
  }, 2000);
  
});
