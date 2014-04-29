'use strict';

var toArray = require('es5-ext/array/to-array');

module.exports = exports = function (t, a) {
	exports.tests(t(require('../create')(require('es6-set'))
		.prototype).constructor, a);
};

exports.tests = function (ObservableSet, a) {
	var set1, set2, set3, set, setB
	  , adds = 0, deletes = 0, clears = 0, elses = 0, listener;

	set1 = new ObservableSet(['zero', 'raz', 'dwa', 'trzy']);
	set2 = new ObservableSet(['zero', 'raz', 'cztery', 'sześć']);
	set3 = new ObservableSet(['trzy', 'cztery', 'siedem']);

	// And
	a.h1("And");
	set = set1.and(set2);
	a.deep(toArray(set.values()), ['zero', 'raz']);
	set.on('change', listener = function (event) {
		if (event.type === 'add') ++adds;
		else if (event.type === 'delete') ++deletes;
		else if (event.type === 'clear') ++clears;
		else ++elses;
	});

	a.h2("Memoize");
	a(set, set1.and(set2));
	a(set, set2.and(set1), "Reverse");

	a.h2("A");
	a.h3("Add matching");
	set1.add('sześć');
	a.deep(toArray(set.values()), ['zero', 'raz', 'sześć']);
	a.deep([adds, deletes, clears, elses], [1, 0, 0, 0], "Event");

	a.h3("Add not matching");
	set1.add('siedem');
	a.deep(toArray(set.values()), ['zero', 'raz', 'sześć']);
	a.deep([adds, deletes, clears, elses], [1, 0, 0, 0], "Event");

	a.h2("B");
	a.h3("Add matching");
	set2.add('siedem');
	a.deep(toArray(set.values()), ['zero', 'raz', 'sześć', 'siedem']);
	a.deep([adds, deletes, clears, elses], [2, 0, 0, 0], "Event");

	a.h3("Add not matching");
	set2.add('osiem');
	a.deep(toArray(set.values()), ['zero', 'raz', 'sześć', 'siedem']);
	a.deep([adds, deletes, clears, elses], [2, 0, 0, 0], "Event");

	a.h2("A");
	a.h3("Delete matching");
	set1.delete('raz');
	a.deep(toArray(set.values()), ['zero', 'sześć', 'siedem']);
	a.deep([adds, deletes, clears, elses], [2, 1, 0, 0], "Event");

	a.h3("Delete not matching");
	set1.delete('trzy');
	a.deep(toArray(set.values()), ['zero', 'sześć', 'siedem']);
	a.deep([adds, deletes, clears, elses], [2, 1, 0, 0], "Event");

	a.h2("B");
	a.h3("Delete matching");
	set2.delete('sześć');
	a.deep(toArray(set.values()), ['zero', 'siedem']);
	a.deep([adds, deletes, clears, elses], [2, 2, 0, 0], "Event");

	a.h3("Delete not matching");
	set2.delete('cztery');
	a.deep(toArray(set.values()), ['zero', 'siedem']);
	a.deep([adds, deletes, clears, elses], [2, 2, 0, 0], "Event");

	a.h2("3");
	setB = set.and(set3);
	a.deep(toArray(setB.values()), ['siedem']);
	a.h3("Memoize");
	a(setB, set1.and(set2, set3), "#1");
	a(setB, set3.and(set2, set1), "#2");
	a(setB, set.and(set3), "#3");
	a(setB, set.and(set3), "#4");
	a(setB, set2.and(set3).and(set1), "#");

	a.h2("A");
	a.h3("Clear");
	set1.clear();
	a.deep(toArray(set.values()), []);
	a.deep(toArray(setB.values()), [], "3");
	a.deep([adds, deletes, clears, elses], [2, 2, 1, 0], "Event");

	a.h2("B");
	a.h2("Clear");
	set2.clear();
	a.deep(toArray(set.values()), []);
	a.deep([adds, deletes, clears, elses], [2, 2, 1, 0], "Event");

	// Reset
	set.off('change', listener);
	set1 = new ObservableSet(['raz', 'dwa']);
	set2 = new ObservableSet(['raz', 'trzy']);
	set3 = new ObservableSet(['trzy', 'cztery']);
	adds = 0;
	deletes = 0;
	clears = 0;
	elses = 0;

	// Or
	a.h1("Or");
	set = set1.or(set2);
	a.deep(toArray(set.values()), ['raz', 'dwa', 'trzy']);
	set.on('change', listener);

	a.h2("Memoize");
	a(set, set1.or(set2));
	a(set, set2.or(set1), "Reverse");

	a.h2("A");
	a.h3("Add");
	set1.add('cztery');
	a.deep(toArray(set.values()), ['raz', 'dwa', 'trzy', 'cztery']);
	a.deep([adds, deletes, clears, elses], [1, 0, 0, 0], "Event");

	a.h3("Add existing");
	set1.add('trzy');
	a.deep(toArray(set.values()), ['raz', 'dwa', 'trzy', 'cztery']);
	a.deep([adds, deletes, clears, elses], [1, 0, 0, 0], "Event");

	a.h2("B");
	a.h3("Add");
	set2.add('siedem');
	a.deep(toArray(set.values()), ['raz', 'dwa', 'trzy', 'cztery', 'siedem']);
	a.deep([adds, deletes, clears, elses], [2, 0, 0, 0], "Event");

	a.h3("Add existing");
	set2.add('dwa');
	a.deep(toArray(set.values()), ['raz', 'dwa', 'trzy', 'cztery', 'siedem']);
	a.deep([adds, deletes, clears, elses], [2, 0, 0, 0], "Event");

	a.h2("A");
	a.h3("Delete");
	set1.delete('cztery');
	a.deep(toArray(set.values()), ['raz', 'dwa', 'trzy', 'siedem']);
	a.deep([adds, deletes, clears, elses], [2, 1, 0, 0], "Event");

	a.h3("Delete existing");
	set1.delete('trzy');
	a.deep(toArray(set.values()), ['raz', 'dwa', 'trzy', 'siedem']);
	a.deep([adds, deletes, clears, elses], [2, 1, 0, 0], "Event");

	a.h2("B");
	a.h3("Delete");
	set2.delete('siedem');
	a.deep(toArray(set.values()), ['raz', 'dwa', 'trzy']);
	a.deep([adds, deletes, clears, elses], [2, 2, 0, 0], "Event");

	a.h3("Delete existing");
	set2.delete('dwa');
	a.deep(toArray(set.values()), ['raz', 'dwa', 'trzy']);
	a.deep([adds, deletes, clears, elses], [2, 2, 0, 0], "Event");

	a.h2("3");
	setB = set.or(set3);
	a.deep(toArray(setB.values()), ['trzy', 'cztery', 'raz', 'dwa']);

	a.h3("Memoize");
	a(setB, set1.or(set2, set3), "#1");
	a(setB, set3.or(set2, set1), "#2");
	a(setB, set.or(set3), "#3");
	a(setB, set.or(set3), "#4");
	a(setB, set2.or(set3).or(set1), "#");

	a.h2("A");
	a.h3("Clear");
	set1.clear();
	a.deep(toArray(set.values()), ['raz', 'trzy']);
	a.deep([adds, deletes, clears, elses], [2, 3, 0, 0], "Event");

	a.h2("B");
	a.h3("Clear");
	set2.clear();
	a.deep(toArray(set.values()), []);
	a.deep([adds, deletes, clears, elses], [2, 3, 0, 1], "Event");

	// Reset
	set.off('change', listener);
	set1 = new ObservableSet(['raz', 'dwa']);
	set2 = new ObservableSet(['raz', 'trzy']);
	set3 = new ObservableSet(['trzy', 'dwa']);
	adds = 0;
	deletes = 0;
	clears = 0;
	elses = 0;

	// Not
	a.h1("Not");
	set = set1.not(set2);
	a.deep(toArray(set.values()), ['dwa']);
	set.on('change', listener);

	a.h2("Memoize");
	a(set, set1.not(set2));

	a.h2("A");
	a.h3("Add matching");
	set1.add('trzy');
	a.deep(toArray(set.values()), ['dwa']);
	a.deep([adds, deletes, clears, elses], [0, 0, 0, 0], "Event");

	a.h3("Add not matching");
	set1.add('cztery');
	a.deep(toArray(set.values()), ['dwa', 'cztery']);
	a.deep([adds, deletes, clears, elses], [1, 0, 0, 0], "Event");

	a.h2("B");
	a.h3("Add matching");
	set2.add('siedem');
	a.deep(toArray(set.values()), ['dwa', 'cztery']);
	a.deep([adds, deletes, clears, elses], [1, 0, 0, 0], "Event");

	a.h3("Add not matching");
	set2.add('dwa');
	a.deep(toArray(set.values()), ['cztery']);
	a.deep([adds, deletes, clears, elses], [1, 1, 0, 0], "Event");

	a.h2("A");
	a.h3("Delete matching");
	set1.delete('cztery');
	a.deep(toArray(set.values()), []);
	a.deep([adds, deletes, clears, elses], [1, 2, 0, 0], "Event");

	a.h3("Delete not matching");
	set1.delete('trzy');
	a.deep(toArray(set.values()), []);
	a.deep([adds, deletes, clears, elses], [1, 2, 0, 0], "Event");

	a.h2("B");
	a.h3("Delete matching");
	set2.delete('dwa');
	a.deep(toArray(set.values()), ['dwa']);
	a.deep([adds, deletes, clears, elses], [2, 2, 0, 0], "Event");

	a.h3("Delete not matching");
	set2.delete('siedem');
	a.deep(toArray(set.values()), ['dwa']);
	a.deep([adds, deletes, clears, elses], [2, 2, 0, 0], "Event");

	a.h2("3");
	setB = set1.not(set2, set3);
	a.deep(toArray(setB.values()), []);
	a.h3("Memoize");
	a(setB, set1.not(set2.or(set3)), "#1");
	a(setB, set1.not(set3, set2), "#2");
	a(setB, set1.not(set3.or(set2)), "#3");

	a.h3("Delete");
	set3.delete('dwa');
	a.deep(toArray(setB.values()), ['dwa']);

	a.h2("A");
	a.h3("Clear");
	set2.clear();
	a.deep(toArray(set.values()), ['dwa', 'raz']);
	a.deep([adds, deletes, clears, elses], [3, 2, 0, 0], "Event");

	a.h2("B");
	a.h2("Clear");
	set1.clear();
	a.deep(toArray(set.values()), []);
	a.deep([adds, deletes, clears, elses], [3, 2, 1, 0], "Event");
};
