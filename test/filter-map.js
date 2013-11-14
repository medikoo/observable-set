'use strict';

var toArray = require('es6-iterator/to-array');

module.exports = exports = function (t, a) {
	exports.tests(t(require('../create')(require('es6-set'))), a);
};

exports.tests = function (ObservableSet, a) {
	var set, x = {}, y, z, w, u, set2, fn
	  , adds = 0, deletes = 0, clears = 0, listener;

	// Filter
	a.h1("Filter");
	x = { val: 12 };
	y = { val: 43 };
	z = { val: 54 };
	set = new ObservableSet([x, y, z]);

	set2 = set.filter(fn = function (val) { return val.val % 2; });
	a.deep(toArray(set2.values()), [y]);
	a(set2, set.filter(fn), "Memoize");
	set2.on('change', listener = function (event) {
		if (event.type === 'add') ++adds;
		else if (event.type === 'delete') ++deletes;
		else ++clears;
	});

	a.h2("Add matching");
	w = { val: 33 };
	set.add(w);
	a.deep(toArray(set2.values()), [y, w]);
	a.deep([adds, deletes, clears], [1, 0, 0], "Event");

	a.h2("Add not matching");
	u = { val: 30 };
	set.add(u);
	a.deep(toArray(set2.values()), [y, w]);
	a.deep([adds, deletes, clears], [1, 0, 0], "Event");

	a.h2("Inner");
	y.val = 44;
	a.deep(toArray(set2.values()), [y, w]);
	a.deep([adds, deletes, clears], [1, 0, 0], "Event");

	a.h2("Refresh");
	set2.refresh(y);
	a.deep(toArray(set2.values()), [w]);
	a.deep([adds, deletes, clears], [1, 1, 0], "Event");

	a.h2("Refresh #2");
	y.val = 43;
	set2.refresh(y);
	a.deep(toArray(set2.values()), [w, y]);
	a.deep([adds, deletes, clears], [2, 1, 0], "Event");

	a.h2("Delete not matching");
	set.delete(x);
	a.deep(toArray(set2.values()), [w, y]);
	a.deep([adds, deletes, clears], [2, 1, 0], "Event");

	a.h2("Delete matching");
	set.delete(y);
	a.deep(toArray(set2.values()), [w]);
	a.deep([adds, deletes, clears], [2, 2, 0], "Event");

	a.h2("Clear");
	set.clear();
	a.deep(toArray(set2.values()), []);
	a.deep([adds, deletes, clears], [2, 2, 1], "Event");

	a.h2("Clear on empty");
	set.clear();
	a.deep(toArray(set2.values()), []);
	a.deep([adds, deletes, clears], [2, 2, 1], "Event");

	set2.off('change', listener);

	// Map
	a.h1("Map");
	x = { val: 12 };
	y = { val: 43 };
	z = { val: 54 };
	set = new ObservableSet([x, y, z]);
	adds = 0;
	deletes = 0;
	clears = 0;

	set2 = set.map(fn = function (val) { return val.val * 2; });
	a.deep(toArray(set2.values()), [24, 86, 108]);
	a(set2, set.map(fn), "Memoize");
	set2.on('change', listener);

	a.h2("Add");
	w = { val: 33 };
	set.add(w);
	a.deep(toArray(set2.values()), [24, 86, 108, 66]);
	a.deep([adds, deletes, clears], [1, 0, 0], "Event");

	a.h2("Inner");
	y.val = 44;
	a.deep(toArray(set2.values()), [24, 86, 108, 66]);
	a.deep([adds, deletes, clears], [1, 0, 0], "Event");

	a.h2("Refresh");
	set2.refresh(y);
	a.deep(toArray(set2.values()), [24, 108, 66, 88]);
	a.deep([adds, deletes, clears], [2, 1, 0], "Event");

	a.h2("Delete");
	set.delete(x);
	a.deep(toArray(set2.values()), [108, 66, 88]);
	a.deep([adds, deletes, clears], [2, 2, 0], "Event");

	a.h2("Clear");
	set.clear();
	a.deep(toArray(set2.values()), []);
	a.deep([adds, deletes, clears], [2, 2, 1], "Event");

	a.h2("Clear on empty");
	set.clear();
	a.deep(toArray(set2.values()), []);
	a.deep([adds, deletes, clears], [2, 2, 1], "Event");
};
