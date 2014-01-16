'use strict';

var toString = function () { return this.val; };

module.exports = exports = function (t, a) {
	exports.tests(t(require('../create')(require('es6-set'))
		.prototype).constructor, a);
	exports.tests(t(require('../create')(require('es6-set/primitive'))
		.prototype).constructor, a, true);
};

exports.tests = function (ObservableSet, a, isPrimitive) {
	var set, first, x, y, z, evented = 0;

	x = { val: 12, toString: toString };
	y = { val: 43, toString: toString };
	z = { val: 54, toString: toString };
	set = new ObservableSet([x, y, z]);

	a.h1("");
	first = set._first;
	a(first.value, x, "Initial");
	first.on('change', function (e) { ++evented; });

	a.h1("Add");
	set.add('foo');
	a(evented, 0, "Event");
	a(first.value, x, "Value");

	a.h1("Clear");
	set.clear();
	a(evented, 1, "Event");
	a(first.value, undefined, "Event");

	a.h1("Add to empty");
	set.add('morda');
	a(evented, 2, "Event");
	a(first.value, 'morda', "Event");
};
