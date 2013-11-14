'use strict';

var validFunction  = require('es5-ext/function/valid-function')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d/d')
  , ee             = require('event-emitter')
  , memoize        = require('memoizee/lib/regular');

module.exports = memoize(function (Constructor) {
	var Observable, add, clear, del;

	validFunction(Constructor);
	Observable = function (/* iterable, comparator */) {
		if (!(this instanceof Observable)) {
			return new Observable(arguments[0], arguments[1]);
		}
		Constructor.apply(this, arguments);
	};
	if (setPrototypeOf) setPrototypeOf(Observable, Constructor);

	add = Constructor.prototype.add;
	clear = Constructor.prototype.clear;
	del = Constructor.prototype.delete;

	Observable.prototype = ee(Object.create(Constructor.prototype, {
		constructor: d(Observable),
		add: d(function (value) {
			if (this.has(value)) return this;
			add.call(this, value);
			this.emit('change', { type: 'add', value: value });
			return this;
		}),
		clear: d(function () {
			if (!this.size) return;
			clear.call(this);
			this.emit('change', { type: 'clear' });
		}),
		delete: d(function (value) {
			if (!del.call(this, value)) return false;
			this.emit('change', { type: 'delete', value: value });
			return true;
		})
	}));

	return Observable;
});
