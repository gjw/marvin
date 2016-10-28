var chai = require('chai');
var fp = require('../lib/utils/feature-parser.js');

// these tests are admittedly kinda fucky because parseFeatures
// currently only takes a directory.  also it's hard to group things like this.
describe('parseFeatures should return ', function() {

  describe('all included scenarios ', function() {
    it('when sent a feature and no tags', function() {
      var res = fp.parseFeatures('test/features/all');
      chai.assert.equal(res.length, 1);
      var scenarios = res[0].scenarios;
      chai.assert.equal(scenarios.length, 2);
      chai.assert.equal(scenarios[0].title, "one");
      chai.assert.equal(scenarios[1].title, "two");
    });

    it('when sent a feature and excluding tags that the feature does not contain', function() {
      var res = fp.parseFeatures('test/features/all', "!@wip,!@ghosts");
      chai.assert.equal(res.length, 1);
      var scenarios = res[0].scenarios;
      chai.assert.equal(scenarios.length, 2);
      chai.assert.equal(scenarios[0].title, "one");
      chai.assert.equal(scenarios[1].title, "two");
    });

    it('when sent a feature and including tags that the feature does not contain', function() {
      var res = fp.parseFeatures('test/features/all', "@ghosts");
      chai.assert.equal(res[0].scenarios.length, 0);
    });
  });

describe('no scenarios ', function() {
    it('when sent a feature tagged X and taglist excluding X', function() {
      var res = fp.parseFeatures('test/features/none', "!@ghosts");
      chai.assert.equal(res.length, 0);
    });

    it('when sent a feature with all scenarios tagged X and taglist excluding X', function() {
      var res = fp.parseFeatures('test/features/none2', "!@ghosts");
      chai.assert.equal(res.length, 1);
      chai.assert.equal(res[0].scenarios.length, 0);
    });
});

describe('the proper subset of tests ', function() {
  describe('when sent a mix of features and a taglist of "!@x', function() {
    it.skip('garbage', function() {
      var res = fp.parseFeatures('test/features/mixed', "!@x");
    });
  });

  describe('when sent a mix of features and a taglist of "!@x,@y', function() {
    it('garbage', function() {
      var res = fp.parseFeatures('test/features/mixed', "!@x,@y");
      chai.assert.equal(res.length, 2);
      chai.assert.equal(res[0].title, 'basic3');
      chai.assert.equal(res[0].scenarios.length, 1);
      chai.assert.equal(res[0].scenarios[0].title, 'one');
      chai.assert.equal(res[1].title, 'basic');
      chai.assert.equal(res[1].scenarios.length, 1);
      chai.assert.equal(res[1].scenarios[0].title, 'two');
    });
  });

  describe('when sent a feature tagged with X', function() {
    it.skip('and a feature with a single scenario tagged X and a taglist including X', function() {
      var res = fp.parseFeatures('test/features/mixed', "@x");
      var scenarios = res[0].scenarios;
    });
    it('and a feature tagged with Y and a taglist including X and excluding Y');
  });

  describe('when sent a feature with no tags ', function() {
    describe(' but scenarios tagged with X, Y, and Z', function() {
      it('and a taglist including X and excluding Y');
      it('and a taglist including X');
      it('and a taglist excluding X');
    });
  });
});
});
