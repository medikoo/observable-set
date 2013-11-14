'use strict';

var remove    = require('es5-ext/array/#/remove')
  , isSet     = require('es6-set/is-set')
  , toArray   = require('es6-iterator/to-array')
  , filterMap = require('./filter-map').tests
  , andOrNot  = require('./and-or-not').tests
  , oToArray  = require('./to-array').tests;

module.exports = function (ObservableSet, a) {
	var arr = ['foo', 'bar', 23]
	  , set = new ObservableSet(arr), adds = 0, deletes = 0, clears = 0;

	a(isSet(set), true, "Is set");
	a(set instanceof ObservableSet, true, "Subclassed");

	a.deep(toArray(set.values()), arr, "Constructor");

	set.on('change', function (event) {
		if (event.type === 'add') ++adds;
		else if (event.type === 'delete') ++deletes;
		else ++clears;
	});

	set.delete('bar');
	remove.call(arr, 'bar');

	a.deep(toArray(set.values()), arr, "Delete: value");
	a.deep([adds, deletes, clears], [0, 1, 0], "Delete: event");

	set.delete('elo');
	a.deep(toArray(set.values()), arr, "Delete non existing: value");
	a.deep([adds, deletes, clears], [0, 1, 0], "Delete non existing: event");

	set.add('muszka');
	arr.push('muszka');
	a.deep(toArray(set.values()), arr, "Add: value");
	a.deep([adds, deletes, clears], [1, 1, 0], "Add: event");

	set.add('muszka');
	a.deep(toArray(set.values()), arr, "Add same: value");
	a.deep([adds, deletes, clears], [1, 1, 0], "Add same: event");

	set.clear();
	a.deep(toArray(set.values()), [], "Clear: value");
	a.deep([adds, deletes, clears], [1, 1, 1], "Clear: event");

	set.clear();
	a.deep(toArray(set.values()), [], "Clear on empty: value");
	a.deep([adds, deletes, clears], [1, 1, 1], "Clear on empty: event");

	filterMap(ObservableSet, a);
	andOrNot(ObservableSet, a);
	oToArray(ObservableSet, a);
};
