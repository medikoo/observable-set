'use strict';

module.exports = exports = function (t, a) {
	exports.tests(t(require('../create')(require('es6-set'))
		.prototype).constructor, a);
	exports.tests(t(require('../create')(require('es6-set/primitive'))
		.prototype).constructor, a, true);
};

exports.tests = function (ObservableSet, a, isPrimitive) {
	var set, has, x, y, z, evented = 0;

	x = { toString: function () { return 'a'; } };
	y = { toString: function () { return 'b'; } };
	z = { toString: function () { return 'c'; } };
	set = new ObservableSet([x, z]);

	a.h1(isPrimitive ? "Primitive" : "");
	a.h2("");
	has = set._has(y);
	a(has.value, false, "Initial");
	has.on('change', function (e) { ++evented; });

	a.h2("Add other");
	set.add({});
	a(evented, 0, "Event");
	a(has.value, false, "Value");

	a.h2("Add");
	set.add(y);
	a(evented, 1, "Event");
	a(has.value, true, "Value");

	a.h2("Delete other");
	set.delete(x);
	a(evented, 1, "Event");
	a(has.value, true, "Value");

	a.h2("Delete");
	set.delete(y);
	a(evented, 2, "Event");
	a(has.value, false, "Value");

	a.h2("Clear");
	set.clear();
	a(evented, 2, "Event");
	a(has.value, false, "Value");

	a.h2("Readd");
	set.add(y);
	a(evented, 3, "Event");
	a(has.value, true, "Event");
};
