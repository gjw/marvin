
var session = require('../webdriver/driver-session');

exports = module.exports = {

  logs: [],

  log: function log(msg){

    if (!this.logs[session.currentStep]){
      this.logs[session.currentStep] = {}
    }

    this.logs[session.currentStep].text = msg;

  }

}