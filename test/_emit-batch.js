'use strict';

var emitter = require('event-emitter/lib/core')();

module.exports = function (t, a) {
	var event;

	emitter.on('change', function (e) {
		if (event) a.never();
		event = e;
	});
	t(emitter);
	a(event, undefined, "No added, no deleted");

	t(emitter, [], []);
	a(event, undefined, "Both empty");

	t(emitter, [1], []);
	a.deep(event, { type: 'add', value: 1 }, "Add single");
	event = null;

	t(emitter, [1, 2], []);
	a.deep(event, { type: 'batch', added: [1, 2] }, "Add many");
	event = null;

	t(emitter, [1], [2]);
	a.deep(event, { type: 'batch', added: [1], deleted: [2] }, "Added & Deleted");
	event = null;

	t(emitter, [], [2]);
	a.deep(event, { type: 'delete', value: 2 }, "Deleted one");
	event = null;

	t(emitter, [], [1, 2]);
	a.deep(event, { type: 'batch', deleted: [1, 2] }, "Deleted many");
};
