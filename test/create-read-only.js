'use strict';

var Set     = require('es6-set')
  , isSet   = require('es6-set/is-set')
  , toArray = require('es5-ext/array/to-array')

  , create = Object.create;

module.exports = function (t, a) {
	var ReadOnlySet = t(Set), arr = ['foo', 'bar']
	  , set = new ReadOnlySet(arr), X;

	a(isSet(set), true, "Set");
	a(set instanceof ReadOnlySet, true, "Subclass");
	a.deep(toArray(set.values()), ['foo', 'bar'], "Content");

	a.throws(function () { set.add('elo'); }, RangeError, "Add");
	a.throws(function () { set.delete('foo'); }, RangeError, "Delete");
	a.throws(function () { set.clear(); }, RangeError, "Clear");

	a.deep(toArray(set.values()), ['foo', 'bar'], "Content unaltered");

	X = function () {};
	X.prototype = create(Set.prototype);
	X.prototype.constructor = X;

	X = t(X);
	a(X.prototype._add, Set.prototype.add, "Prototype: deep");
};
