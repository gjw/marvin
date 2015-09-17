
var config = require('./config.js');

var LEVELS = {
  info: 1,
  warning: 2,
  error: 3
};

exports = module.exports = {

  /**
   * @description Stores the logs of the current test step
   */
  logs: [],

  /**
   * @name _add
   * @param {Object} log: the log object; it may contain the following properties
   * @prop type
   * @prop text
   * @prop key
   * @prop value
   * @prop level
   * @prop status
   * @prop data
   * @description Add a new log in the logs list
   */
  _add: function(log) {
    this.logs.push(log);
  },

  /** 
   * @name reset
   * @description Reset the logs list; it should be called after each test step
   */
  reset: function() {
    this.logs = [];
  },

  /** 
   * @name log
   * @param {String} msg: a message that should appear in the report
   * @param {String} level: one of info, warning, error; default is Info.
   * @description Add in the report the msg message
   */
  log: function(msg, level){
    var lv = level && LEVELS[level.toLowerCase()] ? level.toLowerCase() : 'info';
    this._add({ type: 'text', text: msg, level: lv });
  },

  /** 
   * @name assert
   * @param {Primitive} value: the value that we want validate
   * @param {Primitive} expectedValue: the expected value of the param "value" 
   * @param {String} alert: the message displayed in the report in case the assertion fail
   * @description Check value against expectedValue.. it should be used for not blocking assertions. Assert should be used only on primitives.
   */
  assert: function(value, expectedValue, alert) {
    if (typeof value == 'object'){
      return this.log('assert should be used only on primitive values', 'warning');
    }
    var passed = value === expectedValue;
    if (!passed || config.verbose){
      this._add({ type: 'assertion', status: passed ? 'ok' : 'ko', text: alert });
    }
  },

  /** 
   * @name ok
   * @param {Primitive} value: the value that we want validate 
   * @param {String} alert: the message displayed in the report in case the assertion fail
   * @description Check if the provided value is strictly true. Assert should be used only on primitives.
   */
  ok: function(value, alert) {
    this.assert(value, true, alert);
  },

  /** 
   * @name dir
   * @param {Object} obj: a generic object
   * @param {String} objName: the name of the object
   * @description Add in the report a x-sized table with obj's own properties
   * @example With the following input: [{ id: 1, name: 'foo' }, { id: 2, name: 'bar', email: 'baz@cuz.biz' }], it should print something like:
   *
   *    | id | name  | email       |
   *    | 1  | foo   | -           |
   *    | 2  | bar   | baz@cuz.biz |
   */
  dir: function(obj, objName){
    if (obj && typeof obj == 'object'){
      var allKeys = [];
      obj = obj instanceof Array ? obj : [obj];
      // get all the keys
      obj.forEach(function(el) {
        if (el && typeof el == 'object'){
          allKeys = [].concat.call(allKeys, Object.keys(el).filter(function(key) { return allKeys.indexOf(key) == -1; }));  
        }
      });
      // prepare the data
      var entries = obj.map(function(el) {
        var newEl = [];
        allKeys.forEach(function(key) {
          var value;
          if (typeof el[key] == 'undefined'){
            value = '-';
          }
          else {
            value = el[key] !== null ? el[key].toString() : 'null';
          }
          newEl.push(value);
        });
        return newEl;
      });
      this._add({ type: 'table', text: objName, data: { keys: allKeys, entries: entries } });
    }
  },

  /** 
   * @name value
   * @param {String} key: the name of a variable
   * @param {String} value: the value of a variable
   * @description Add in the report a two-columns table with the mapping key/value
   */
  value: function (key, value){
    this._add({ type: 'value', key: key, value: value });
  },

  /** 
   * @name capture
   * @param {String} filename: the filename of the screenshot
   * @description Save a reference to the screenshot captured during the current test step
   */
  capture: function(filename){
    this._add({ type: 'image', value: filename });
  }

}