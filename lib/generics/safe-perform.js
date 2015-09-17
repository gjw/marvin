
var session = require('../webdriver/driver-session');

var retriesCount = 0;

/**
 * Execute operation on WebdriverElement handling StaleElementReferenceError exception
 */
exports = module.exports = function safePerform(elem, method){

  var args = Array.prototype.slice.apply(arguments);
  var rest = args.length > 2 ? args.splice(-arguments.length+2) : [];

  if (retriesCount > 0){
    elem = typeof elem._root != "undefined" ? session.getDriver().findElement(elem._root).findElement(elem._locator) : session.getDriver().findElement(elem._locator);
  }

  return elem.then(function(el) {
    retriesCount++;
    return el[method].apply(el, rest);
  }).then(function good() {
    // we succeded...
    // so we've to restart the retries count for the next call
    retriesCount = 0;
  }, function catcher(err) {
    if (err.name == "StaleElementReferenceError" && retriesCount < 5){
      console.log(chalk.yellow("StaleElementReferenceError caught; tentative: "+retriesCount));
      rest.unshift(method);
      rest.unshift(elem);
      return safePerform.apply(null, rest);
    }
    console.log(chalk.red(JSON.stringify(err)));
    throw err.message;
  });

};
