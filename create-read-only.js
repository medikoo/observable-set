'use strict';

var validFunction = require('es5-ext/function/valid-function')
  , d             = require('d/d')
  , memoize       = require('memoizee/lib/regular')

  , create = Object.create, defineProperties = Object.defineProperties
  , getDescriptor = Object.getOwnPropertyDescriptor
  , readOnlyThrow;

readOnlyThrow = d(function () { throw new RangeError("Set is read-only"); });

module.exports = memoize(function (Constructor) {
	var ReadOnly, descs;

	validFunction(Constructor);
	ReadOnly = function (/* iterable, comparator */) {
		if (!(this instanceof ReadOnly)) {
			return new ReadOnly(arguments[0], arguments[1]);
		}
		this.add = this._add;
		Constructor.apply(this, arguments);
		delete this.add;
	};

	ReadOnly.prototype = create(Constructor.prototype, {
		constructor: d(ReadOnly)
	});

	descs = {};
	['add', 'clear', 'delete'].forEach(function (name) {
		descs[name] = readOnlyThrow;
		descs['_' + name] = getDescriptor(Constructor.prototype, name);
	});
	defineProperties(ReadOnly.prototype, descs);

	return ReadOnly;
});
