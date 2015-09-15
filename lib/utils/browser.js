
var util = require('util');

function Browser (browser){
  if (!(this instanceof Browser)){
    return new Browser(browser);
  }

  if (!browser.browserName){
    throw new TypeError("browserName cannot be empty.");
  }

  for (var k in browser){
    if (browser.hasOwnProperty(k)){
      this[k] = browser[k];
    }
  }
}

Browser.prototype.getKey = function() {
  var key = [];

  // Platform
  if (this.platform) {
    key.push(this.platform);
  }
  else if (this.os) {
    key.push(this.os + " " + this.os_version);
  }
  // Browser
  key.push(this.browserName);
  // Version
  if (this.version) {
    key.push(this.version);
  }
  else if (this.browser_version) {
    key.push(this.browser_version);
  }

  return key.join("-").replace(/^-|-$| |\./g, "");
};

exports = module.exports = Browser;
