
var util = require('util');

function Browser (browser){
  if (!(this instanceof Browser)){
    return new Browser(browser);
  }
  this.version = browser.version || "";
  this.platform = browser.platform || "";
  this.browserName = browser.browserName;
}

Browser.prototype.getKey = function() {
  var key = util.format("%s-%s-%s", this.platform,  this.browserName, this.version);
  return key.replace(/^-|-$/g, "");
}

exports = module.exports = Browser;
