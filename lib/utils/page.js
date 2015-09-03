var url = require('url');
var session = require('../webdriver/driver-session');
var config = require('./config.js');

module.exports = {

  /*
   * @param {Object} pagaData
   * @prop {Array} pathValues: values used to replace url placeholder
   * @prop {String} querystring: value of the querystring
   */
  visit: function (pageData) {
    var pageUrl = this.url;
    if (pageData && pageData.pathValues.length > 0){
      pageUrl.match(/\${\w+}/gi).forEach(function(placeholder,i){
        pageUrl = pageUrl.replace(placeholder, pageData.pathValues[i]);
      });
    }

    var hasProtocol = !!(pageUrl || '').match('^https?:\/\/');
    var urlObj = url.parse(hasProtocol ? pageUrl : config.baseUrl + pageUrl);

    if (pageData && pageData.querystring) {
      urlObj.search = pageData.querystring;
    }

    session.getDriver().get(url.format(urlObj));
    if (typeof this.onLoad === 'function') {
      session.execute(this.onLoad);
    }
  }

};
