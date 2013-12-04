'use strict';

var toArray = require('es6-iterator/to-array')

  , isArray = Array.isArray;

module.exports = exports = function (t, a) {
	exports.tests(t(require('../create')(require('es6-set'))
		.prototype).constructor, a);
};

exports.tests = function (ObservableSet, a) {
	var set, arr, x = {}, y, z, w, evented = 0, listener, compare;

	x = { val: 12 };
	y = { val: 43 };
	z = { val: 54 };
	set = new ObservableSet([x, y, z]);

	a.h1("");
	arr = set.toArray();
	arr.on('change', listener = function () { ++evented; });
	a(isArray(arr), true, "Instance of Array");
	a.deep(arr, toArray(set.values()), "Content");

	a.h2("Add");
	w = { val: 33 };
	set.add(w);
	a.deep(arr, toArray(set.values()), "Content");
	a(evented, 1, "Event");

	a.h2("Add existing");
	set.add(y);
	a.deep(arr, toArray(set.values()), "Content");
	a(evented, 1, "Event");

	a.h2("Delete");
	set.delete(y);
	a.deep(arr, toArray(set.values()), "Content");
	a(evented, 2, "Event");

	a.h2("Delete not existing");
	set.delete({});
	a.deep(arr, toArray(set.values()), "Content");
	a(evented, 2, "Event");

	a.h2("Clear");
	set.clear();
	a.deep(arr, toArray(set.values()), "Content");
	a(evented, 3, "Event");

	a.h2("Clear again");
	set.clear();
	a.deep(arr, toArray(set.values()), "Content");
	a(evented, 3, "Event");

	set = new ObservableSet([x, y, z]);
	evented = 0;

	a.h1("Sorted");
	arr = set.toArray(compare = function (a, b) { return a.val - b.val; });
	arr.on('change', listener);
	a(isArray(arr), true, "Instance of Array");
	a.deep(arr, toArray(set.values()).sort(compare), "Content");

	a.h2("Add");
	set.add(w);
	a.deep(arr, toArray(set.values()).sort(compare), "Content");
	a(evented, 1, "Event");

	a.h2("Add existing");
	set.add(y);
	a.deep(arr, toArray(set.values()).sort(compare), "Content");
	a(evented, 1, "Event");

	a.h2("Delete");
	set.delete(y);
	a.deep(arr, toArray(set.values()).sort(compare), "Content");
	a(evented, 2, "Event");

	a.h2("Delete not existing");
	set.delete({});
	a.deep(arr, toArray(set.values()).sort(compare), "Content");
	a(evented, 2, "Event");

	a.h2("Clear");
	set.clear();
	a.deep(arr, toArray(set.values()).sort(compare), "Content");
	a(evented, 3, "Event");

	a.h2("Clear again");
	set.clear();
	a.deep(arr, toArray(set.values()).sort(compare), "Content");
	a(evented, 3, "Event");
};
