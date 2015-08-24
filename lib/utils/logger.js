
var session = require('../webdriver/driver-session');

exports = module.exports = {

  logs: [],

  /** 
   * @name log
   * @param {String} msg: a message that should appear in the report
   * @param {String} level: one of Info, Warning, Error; default is Info.
   * @description Add in the report the msg message
   */
  log: function(msg, level){

    if (!this.logs[session.currentStep]){
      this.logs[session.currentStep] = {}
    }

    this.logs[session.currentStep].text = msg;

  },

  /** 
   * @name assert
   * @param {Any} value: the value that we want validate
   * @param {Any} expectedValue: the expected value of the param "value" 
   * @param {String} alert: the message displayed in the report in case the assertion fail
   * @description Check value against expectedValue.. it should be used for not blocking assertions.
   */
  assert: function(value, expectedValue, alert) {
    throw "Not implemented";
  },

  /** 
   * @name dir
   * @param {Object} obj: a generic object
   * @description Add in the report a x-sized table with obj's own properties
   */
  dir: function(obj){
    throw "Not implemented";
  },

  /** 
   * @name value
   * @param {String} key: the name of a variable
   * @param {String} value: the value of a variable
   * @description Add in the report a two-columns table with the mapping key/value
   */
  value: function (key, value){
    throw "Not implemented";
  },

  /** 
   * @name value
   * @param {Array} list: a list of key/value object
   * @description Add in the report a two-columns list.length-rows table with all the mapping key/value
   */
  values: function (list){
    throw "Not implemented";
  }

}