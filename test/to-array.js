'use strict';

var aFrom   = require('es5-ext/array/from')
  , toArray = require('es6-iterator/to-array')

  , isArray = Array.isArray
  , toString = function () { return this.val; }
  , compare = function (a, b) { return a.val - b.val; };

module.exports = exports = function (t, a) {
	exports.tests(t(require('../create')(require('es6-set'))
		.prototype).constructor, a);
	exports.tests(t(require('../create')(require('es6-set/primitive'))
		.prototype).constructor, a, true);
};

exports.tests = function (ObservableSet, a, isPrimitive) {
	var set, arr, x = {}, y, z, w, evented = 0, listener;

	x = { val: 12, toString: toString };
	y = { val: 43, toString: toString };
	z = { val: 54, toString: toString };
	set = new ObservableSet([x, y, z]);

	a.h1("");
	arr = set.toArray();
	arr.on('change', listener = function () { ++evented; });
	a(isArray(arr), true, "Instance of Array");
	if (isPrimitive) {
		a.deep(aFrom(arr).sort(compare), toArray(set).sort(compare), "Content");
	} else {
		a.deep(arr, toArray(set), "Content");
	}

	a.h2("Add");
	w = { val: 33, toString: toString };
	set.add(w);
	if (isPrimitive) {
		a.deep(aFrom(arr).sort(compare), toArray(set).sort(compare), "Content");
	} else {
		a.deep(arr, toArray(set), "Content");
	}
	a(evented, 1, "Event");

	a.h2("Add existing");
	set.add(y);
	if (isPrimitive) {
		a.deep(aFrom(arr).sort(compare), toArray(set).sort(compare), "Content");
	} else {
		a.deep(arr, toArray(set), "Content");
	}
	a(evented, 1, "Event");

	a.h2("Delete");
	set.delete(y);
	if (isPrimitive) {
		a.deep(aFrom(arr).sort(compare), toArray(set).sort(compare), "Content");
	} else {
		a.deep(arr, toArray(set), "Content");
	}
	a(evented, 2, "Event");

	a.h2("Delete not existing");
	set.delete({});
	if (isPrimitive) {
		a.deep(aFrom(arr).sort(compare), toArray(set).sort(compare), "Content");
	} else {
		a.deep(arr, toArray(set), "Content");
	}
	a(evented, 2, "Event");

	a.h2("Clear");
	set.clear();
	if (isPrimitive) {
		a.deep(aFrom(arr).sort(compare), toArray(set).sort(compare), "Content");
	} else {
		a.deep(arr, toArray(set), "Content");
	}
	a(evented, 3, "Event");

	a.h2("Clear again");
	set.clear();
	if (isPrimitive) {
		a.deep(aFrom(arr).sort(compare), toArray(set).sort(compare), "Content");
	} else {
		a.deep(arr, toArray(set), "Content");
	}
	a(evented, 3, "Event");

	set = new ObservableSet([x, y, z]);
	evented = 0;

	a.h1("Sorted");
	arr = set.toArray(compare = function (a, b) { return a.val - b.val; });
	arr.on('change', listener);
	a(isArray(arr), true, "Instance of Array");
	a.deep(arr, toArray(set).sort(compare), "Content");

	a.h2("Add");
	set.add(w);
	a.deep(arr, toArray(set).sort(compare), "Content");
	a(evented, 1, "Event");

	a.h2("Add existing");
	set.add(y);
	a.deep(arr, toArray(set).sort(compare), "Content");
	a(evented, 1, "Event");

	a.h2("Delete");
	set.delete(y);
	a.deep(arr, toArray(set).sort(compare), "Content");
	a(evented, 2, "Event");

	a.h2("Delete not existing");
	set.delete({});
	a.deep(arr, toArray(set).sort(compare), "Content");
	a(evented, 2, "Event");

	a.h2("Clear");
	set.clear();
	a.deep(arr, toArray(set).sort(compare), "Content");
	a(evented, 3, "Event");

	a.h2("Clear again");
	set.clear();
	a.deep(arr, toArray(set).sort(compare), "Content");
	a(evented, 3, "Event");
};
