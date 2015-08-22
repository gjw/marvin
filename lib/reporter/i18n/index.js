var config = require('marvin').config,
    translations = require('./translations');

module.exports = {

  default: translations.english,

  get: function (str) {
    if (!config.language) {
      return this.default[str];
    }
    else {
      var lang = translations[config.language.toLowerCase()] || this.default;
      return lang[str] || this.default[str];
    }
  }

};
