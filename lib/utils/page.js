var url = require('url');
var session = require('../webdriver/driver-session');

module.exports = {

  visit: function (query) {
    var hasProtocol = !!(this.url || '').match('^https?:\/\/');
    var path = url.parse(hasProtocol ? this.url : session.config.baseUrl + this.url);
    if (query) {
      path.query = query;
    }
    session.getDriver().get(url.format(path));
    if (typeof this.onLoad === 'function') {
      session.execute(this.onLoad);
    }
  },

  getTitle: function () {
    return session.getDriver().getTitle();
  }

};
