var url = require('url');
var session = require('../webdriver/driver-session');
var config = require('./config.js');

module.exports = {

  visit: function (query) {
    var hasProtocol = !!(this.url || '').match('^https?:\/\/');
    var path = url.parse(hasProtocol ? this.url : config.baseUrl + this.url);
    if (query) {
      path.query = query;
    }
    session.getDriver().get(url.format(path));
    if (typeof this.onLoad === 'function') {
      session.execute(this.onLoad);
    }
  }

};
