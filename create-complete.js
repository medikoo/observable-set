'use strict';

var validFunction = require('es5-ext/function/valid-function')
  , memoize       = require('memoizee/lib/regular')
  , validSet      = require('es6-set/valid-set')
  , filterMap     = require('./filter-map')
  , first         = require('./first')
  , size          = require('./size')
  , andOrNot      = require('./and-or-not')
  , toArray       = require('./to-array')
  , create        = require('./create');

module.exports = memoize(function (Set) {
	validFunction(Set);
	validSet(Set.prototype);
	Set = create(Set);
	toArray(andOrNot(size(first(filterMap(Set.prototype)))));
	return Set;
});
