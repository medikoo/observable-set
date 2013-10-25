'use strict';

var Set     = require('es6-set')
  , isSet   = require('es6-set/is-set')
  , toArray = require('es6-iterator/to-array');

module.exports = function (t, a) {
	var ReadOnlySet = t(Set), arr = ['foo', 'bar']
	  , set = new ReadOnlySet(arr);

	a(isSet(set), true, "Set");
	a(set instanceof ReadOnlySet, true, "Subclass");
	a.deep(toArray(set.values()), ['foo', 'bar'], "Content");

	a.throws(function () { set.add('elo'); }, RangeError, "Add");
	a.throws(function () { set.delete('foo'); }, RangeError, "Delete");
	a.throws(function () { set.clear(); }, RangeError, "Clear");

	a.deep(toArray(set.values()), ['foo', 'bar'], "Content unaltered");
};