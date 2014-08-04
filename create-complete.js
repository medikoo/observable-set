'use strict';

var validFunction = require('es5-ext/function/valid-function')
  , memoize       = require('memoizee/plain')
  , validSet      = require('es6-set/valid-set')
  , filterMap     = require('./filter-map')
  , first         = require('./first')
  , has           = require('./has')
  , last          = require('./last')
  , size          = require('./size')
  , andOrNot      = require('./and-or-not')
  , toArray       = require('./to-array')
  , create        = require('./create');

module.exports = memoize(function (Set) {
	validFunction(Set);
	validSet(Set.prototype);
	Set = create(Set);
	toArray(andOrNot(size(has(last(first(filterMap(Set.prototype)))))));
	return Set;
}, { normalizer: require('memoizee/normalizers/get-1')() });
