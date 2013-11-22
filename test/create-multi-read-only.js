'use strict';

var toArray    = require('es6-iterator/to-array')
  , MultiSet   = require('../multi')
  , Set        = require('../')
  , isMultiSet = require('../is-observable-multi-set');

module.exports = function (t, a) {
	var ReadOnlySet = t(MultiSet), set = new Set(['foo', 'bar'])
	  , multiSet = new ReadOnlySet([set]);

	a(isMultiSet(multiSet), true, "Multi Set");
	a(multiSet instanceof ReadOnlySet, true, "Subclass");
	a.deep(toArray(multiSet), ['foo', 'bar'], "Content");

	a.throws(function () { multiSet.add('elo'); }, RangeError, "Add");
	a.throws(function () { multiSet.delete('foo'); }, RangeError, "Delete");
	a.throws(function () { multiSet.clear(); }, RangeError, "Clear");

	a.deep(toArray(multiSet.values()), ['foo', 'bar'], "Content unaltered");
};
