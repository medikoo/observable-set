'use strict';

var toArray = require('es6-iterator/to-array')
  , Set     = require('../');

module.exports = exports = function (t, a) {
	exports.tests(t(require('../create-read-only')(require('../')),
		require('es6-map')), a);
};

exports.tests = function (MultiSet, a) {
	var s1 = new Set(['raz', 'dwa', 'trzy', 'pięć', 'dziewięć'])
	  , s2 = new Set(['dwa', 'pięć', 'sześć', 'raz'])
	  , s3 = new Set(['raz', 'osiem', 'pięć', 'dziewięć'])
	  , set = new MultiSet([s1, s2])
	  , event;

	set.on('change', function (ev) {
		if (event) a.never();
		event = ev;
	});

	a.deep(toArray(set), ['raz', 'dwa', 'trzy', 'pięć', 'dziewięć', 'sześć'],
		"Content");
	a.h1("Add set");
	set.addSet(s3);
	a.deep(event, { type: 'add', value: 'osiem' }, "Event");
	a.deep(toArray(set), ['raz', 'dwa', 'trzy', 'pięć', 'dziewięć', 'sześć',
		'osiem'], "Content");
	event = null;

	a.h1("Delete set");
	set.deleteSet(s2);
	a.deep(event, { type: 'delete', value: 'sześć' }, "Event");
	a.deep(toArray(set), ['raz', 'dwa', 'trzy', 'pięć', 'dziewięć', 'osiem'],
		"Content");
	event = null;

	a.h1("Delete set #2");
	set.deleteSet(s1);
	a.deep(event, { type: 'batch', deleted: ['dwa', 'trzy'] }, "Event");
	a.deep(toArray(set), ['raz', 'pięć', 'dziewięć', 'osiem'], "Content");
	event = null;

	a.h1("Re-add set");
	set.addSet(s2);
	a.deep(event, { type: 'batch', added: ['dwa', 'sześć'] }, "Event");
	a.deep(toArray(set), ['raz', 'pięć', 'dziewięć', 'osiem', 'dwa', 'sześć'],
		"Content");
	event = null;

	a.h1("Re-add set #2");
	set.addSet(s1);
	a.deep(event, { type: 'add', value: 'trzy' }, "Event");
	a.deep(toArray(set), ['raz', 'pięć', 'dziewięć', 'osiem', 'dwa', 'sześć',
		'trzy'], "Content");
	event = null;

	a.h1("Add value");
	s1.add('dziesięć');
	a.deep(event, { type: 'add', value: 'dziesięć' }, "Event");
	a.deep(toArray(set), ['raz', 'pięć', 'dziewięć', 'osiem', 'dwa', 'sześć',
		'trzy', 'dziesięć'], "Content");
	event = null;

	a.h1("Add existing value");
	s2.add('dziesięć');
	a(event, null, "Event");
	a.deep(toArray(set), ['raz', 'pięć', 'dziewięć', 'osiem', 'dwa', 'sześć',
		'trzy', 'dziesięć'], "Content");
	event = null;

	a.h1("Delete existing value");
	s3.delete('pięć');
	a(event, null, "Event");
	a.deep(toArray(set), ['raz', 'pięć', 'dziewięć', 'osiem', 'dwa', 'sześć',
		'trzy', 'dziesięć'], "Content");
	event = null;

	a.h1("Delete existing value #2");
	s1.delete('pięć');
	a(event, null, "Event");
	a.deep(toArray(set), ['raz', 'pięć', 'dziewięć', 'osiem', 'dwa', 'sześć',
		'trzy', 'dziesięć'], "Content");
	event = null;

	a.h1("Final value delete");
	s2.delete('pięć');
	a.deep(event, { type: 'delete', value: 'pięć' }, "Event");
	a.deep(toArray(set), ['raz', 'dziewięć', 'osiem', 'dwa', 'sześć', 'trzy',
		'dziesięć'], "Content");
	event = null;

	a.h1("Lone value delete");
	s3.delete('osiem');
	a.deep(event, { type: 'delete', value: 'osiem' }, "Event");
	a.deep(toArray(set), ['raz', 'dziewięć', 'dwa', 'sześć', 'trzy', 'dziesięć'],
		"Content");
	event = null;
};
