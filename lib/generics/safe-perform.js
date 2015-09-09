
var session = require('marvin-js').session;

/**
 * Execute operation on WebdriverElement handling StaleElementReferenceError exception
 */
exports = module.exports = function safePerform(elem, method, retries){

  var retryCount = retries || 0;

  if (retryCount > 0){
    elem = typeof elem._root != "undefined" ? session.getDriver().findElement(elem._root).findElement(elem._locator) : session.getDriver().findElement(elem._locator);
  }

  return elem.then(function(el) {
    return el[method]();
  }).thenCatch(function(err) {
    if (err.name == "StaleElementReferenceError" && retryCount < 3){
      console.log(chalk.yellow("StaleElementReferenceError caught; tentative: "+retryCount));
      return safePerform(elem, method, ++retryCount);
    }
    console.log(chalk.red(JSON.stringify(err)));
    throw err.message;
  });

};