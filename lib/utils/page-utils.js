var session = require('../env/session'),
    url     = require('url');

module.exports = {

  visit: function (query) {
    var config = require('marvin-js').config;
    var hasProtocol = !!(this.url || '').match('^https?:\/\/');
    var path = url.parse(hasProtocol ? this.url : config.baseUrl + this.url);
    if (query) path.query = query;
    session.getDriver().get(url.format(path));
    if (typeof this.onLoad === 'function') session.execute(this.onLoad);
  },

  title: function (titleHandler) {
    session.getDriver().getTitle().then(function (title) {
      titleHandler(title);
    });
  }

};
