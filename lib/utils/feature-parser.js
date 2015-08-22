var Yadda  = require('yadda');

module.exports = {

  parseFeatures: function (featuresDir, optTags, optLanguage) {
    if (optTags) var tags = sortTags(optTags);
    var features = [];
    var language = this.getLanguage(optLanguage);

    new Yadda.FeatureFileSearch(featuresDir).each(function (file) {
      var parser = new Yadda.parsers.FeatureFileParser(language);
      var feature = parser.parse(file);

      if (!optTags) {
        features.push(feature);
      } else if (shouldIncludeFeature(feature.annotations, tags)) {
        features.push(feature);
      }

    });
    return features;
  },

  getLanguage: function (language) {
    if (!language) return Yadda.localisation.English;
    var lang = language.charAt(0).toUpperCase() + language.slice(1);
    if (Yadda.localisation[lang]) {
      return Yadda.localisation[lang];
    }
    else {
      throw new Error("'" + language + "' is not a supported language.");
    }
  }

};

function sortTags(tagOpts) {
  var tags = { include: [], ignore: [] };
  tagOpts.split(',').forEach(function (tag) {
    if (tag.indexOf('!@') > -1) {
      tags.ignore.push(stripTag(tag));
    } else {
      tags.include.push(stripTag(tag));
    }
  });
  return tags;
}

function stripTag(tag) {
  return tag.replace('!', '').replace('@', '');
}

function shouldIncludeFeature(annotations, tags) {
  if (annotations.pending) return true;
  if (isTagged(tags.ignore, annotations)) return false;
  if (isTagged(tags.include, annotations)) return true;
  if (tags.include.length < 1) return true;
}

function isTagged(tagsArr, annotations) {
  var match = false;
  Object.keys(annotations).forEach(function (key) {
    if (tagsArr.indexOf(key) > -1) match = true;
  });
  return match;
}
