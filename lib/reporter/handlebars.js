
var fs = require('fs');
var path = require('path');

var Handlebars = require('handlebars');
var i18n = require('./i18n/index.js');

var reporterDir = path.join('node_modules', 'marvin-js', 'lib', 'reporter');
var templatesDir = path.join(reporterDir, 'templates');

Handlebars.registerHelper('ifEqual', function(a, b, options) {
  if(a != b) {
    return options.inverse(this);
  }
  return options.fn(this);
});

Handlebars.registerHelper('i18n', function (str) {
  return i18n.get(str);
});

Handlebars.registerHelper('anchor', function () {
  var args = Array.prototype.slice.apply(arguments);
  var envData = args.filter(function(el){ return typeof(el) == 'string'; });
  return envData.reduce(function(a,b) { return a + b; });
});

var logsPartial = fs.readFileSync(path.join(templatesDir, 'partials', '_logs.html'));
Handlebars.registerPartial('_logs', logsPartial.toString());

// reexporting Handelbars
exports = module.exports = Handlebars;