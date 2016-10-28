var Yadda  = require('yadda');
var _ = require('lodash');

module.exports = {

  parseDirectoryToFeatures: function(featuresDir, language) {
    var features = [];
    new Yadda.FeatureFileSearch(featuresDir).each(function (file) {
      var parser = new Yadda.parsers.FeatureFileParser(language);
      features.push(parser.parse(file));
    });
    return features;
  },

  parseFeatures: function (featuresDir, optTags, optLanguage) {
    var tags = sortTags(optTags);
    var language = this.getLanguage(optLanguage);
    var features = this.parseDirectoryToFeatures(featuresDir, language);

    //console.log(Object.getOwnPropertyNames(feature));
    //-> title, annotations, description, scenarios

    console.log('=== ===');
    console.log('Running with tags;');
    console.log(tags);
    console.log('=== ===\r\n\r\n');

    // if a feature is excluded by tag, we run none of its included scenarios
    let [none, rest] = _.partition(features, function(f) {
      return (isTagged(tags.ignore, f.annotations));
    });

    // if a feature is included by tag, we run all of its included scenarios,
    //   EXCEPT scenarios that have a tag that is excluded
    let [most, other] = _.partition(rest, function(f) {
      return (isTagged(tags.include, f.annotations));
    });

    most = _.map(most, function(feature) {
      feature.scenarios = _.filter(feature.scenarios, function(scenario) {
        var r = shouldIncludeFeature(scenario.annotations, tags);
        if ((r === undefined) || ( r === true)) { return true;}
        return false;
      });
      return feature;
    });

    // if a feature is not included or excluded,
    //   if we did not explicitly ask for any particular tags, we assume we
    //   want everything, minus exclusions.
    //   if we did, we assume we want only those, minus exclusions.
    other = _.map(other, function(feature) {
      feature.scenarios = _.filter(feature.scenarios, function(scenario) {
        var r = shouldIncludeFeature(scenario.annotations, tags);
        if (r === undefined) {
          if (tags.include.length > 0) { return false; }
          else { return true; }
        }
        return r;
      });
      return feature;
    });

    return _.union(most, other);
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
  if (!tagOpts || 0 === tagOpts) {
    return tags;
  }
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
  return tag.replace(/[!@]/g, '').toLowerCase();
}

// it is intentional that some cases can return undefined, handle at higher level
function shouldIncludeFeature(annotations, tags) {
  if (annotations.pending) return true;
  if (isTagged(tags.ignore, annotations)) {
    // console.log('== ignoring');
    // console.log(annotations);
    return false;
  }
  if (isTagged(tags.include, annotations)) {
    // console.log('==including');
    // console.log(annotations);
    return true;
  }
  if (tags.include.length < 1) return true;
}

function isTagged(tagsArr, annotations) {
  var match = false;
  Object.keys(annotations).forEach(function (key) {
    if (tagsArr.indexOf(key) > -1) match = true;
  });
  return match;
}
