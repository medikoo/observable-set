'use strict';

var validFunction = require('es5-ext/function/valid-function')
  , d             = require('d/d')
  , memoize       = require('memoizee/lib/regular')
  , validMultiSet = require('./valid-observable-multi-set')

  , create = Object.create, defineProperties = Object.defineProperties
  , getDescriptor = Object.getOwnPropertyDescriptor
  , readOnlyThrow;

readOnlyThrow = d(function () { throw new RangeError("Set is read-only"); });

module.exports = memoize(function (Constructor) {
	var ReadOnly, descs;

	validFunction(Constructor);
	validMultiSet(Constructor.prototype);

	ReadOnly = function (/* iterable, comparator */) {
		if (!(this instanceof ReadOnly)) {
			return new ReadOnly(arguments[0], arguments[1]);
		}
		Constructor.apply(this, arguments);
	};

	ReadOnly.prototype = create(Constructor.prototype, {
		constructor: d(ReadOnly)
	});

	descs = {};
	['addSet', 'clearSets', 'deleteSet'].forEach(function (name) {
		descs[name] = readOnlyThrow;
		descs['_' + name] = getDescriptor(Constructor.prototype, name);
	});
	defineProperties(ReadOnly.prototype, descs);

	return ReadOnly;
});
