'use strict';

var validFunction = require('es5-ext/function/valid-function')
  , d             = require('d/d')
  , memoize       = require('memoizee/lib/regular')
  , validSet      = require('es6-set/valid-set')

  , create = Object.create, defineProperties = Object.defineProperties
  , getDescriptor = Object.getOwnPropertyDescriptor
  , getPrototypeOf = Object.getPrototypeOf
  , readOnlyThrow;

readOnlyThrow = d(function () { throw new RangeError("Set is read-only"); });

module.exports = memoize(function (Constructor) {
	var ReadOnly, descs;

	validFunction(Constructor);
	validSet(Constructor.prototype);

	if (Constructor.prototype.__isReadOnly__) return Constructor;

	ReadOnly = function (/* iterable, comparator */) {
		if (!(this instanceof ReadOnly)) {
			return new ReadOnly(arguments[0], arguments[1]);
		}
		Constructor.apply(this, arguments);
	};

	ReadOnly.prototype = create(Constructor.prototype, {
		constructor: d(ReadOnly),
		__isReadOnly__: d('', true)
	});

	descs = {};
	['add', 'clear', 'delete'].forEach(function (name) {
		var proto = Constructor.prototype;
		descs[name] = readOnlyThrow;
		while (proto && !proto.hasOwnProperty(name)) proto = getPrototypeOf(proto);
		if (!proto) {
			throw new TypeError(Constructor + " is not valid Set constructor");
		}
		descs['_' + name] = getDescriptor(proto, name);
	});
	defineProperties(ReadOnly.prototype, descs);

	return ReadOnly;
});
