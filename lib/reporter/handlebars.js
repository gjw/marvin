
var fs = require('fs');
var path = require('path');
var glob = require('glob');

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

// all the partial templates should be inside the ./partials folder, and their name should start with _.
// registering templates
glob.sync(path.join(templatesDir, 'partials', '*.html')).forEach(function (file) {
  var partial = fs.readFileSync(file);
  var partialName = /(_\w+).html$/g.exec(file)[1];
  Handlebars.registerPartial(partialName, partial.toString());
});

// reexporting Handelbars
exports = module.exports = Handlebars;