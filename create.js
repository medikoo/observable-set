'use strict';

var validFunction      = require('es5-ext/function/valid-function')
  , assign             = require('es5-ext/object/assign')
  , setPrototypeOf     = require('es5-ext/object/set-prototype-of')
  , d                  = require('d')
  , lazy               = require('d/lazy')
  , ee                 = require('event-emitter')
  , memoize            = require('memoizee/plain')
  , validSet           = require('es6-set/valid-set')
  , isObservableSymbol = require('observable-value/symbol-is-observable')
  , createReadOnly     = require('./create-read-only')

  , defineProperty = Object.defineProperty;

module.exports = memoize(function (Constructor) {
	var Observable, add, clear, del, ReadOnly;

	validFunction(Constructor);
	validSet(Constructor.prototype);

	ReadOnly = createReadOnly(Constructor);

	Observable = function (/*iterable, comparator*/) {
		var comparator = arguments[1];
		if (!(this instanceof Observable)) {
			return new Observable(arguments[0], comparator);
		}
		Constructor.apply(this, arguments);
		if (!this.__comparator__) {
			defineProperty(this, '__comparator__', d('', comparator));
		}
	};
	if (setPrototypeOf) setPrototypeOf(Observable, Constructor);

	add = Constructor.prototype.add;
	clear = Constructor.prototype.clear;
	del = Constructor.prototype.delete;

	Observable.prototype = ee(Object.create(Constructor.prototype, assign({
		constructor: d(Observable),
		add: d(function (value) {
			var event;
			if (this.has(value)) return this;
			add.call(this, value);
			if (this.__postponed__) {
				event = this.__postponedEvent__;
				if (!event) event = this.__postponedEvent__ = {};
				if (event.deleted && event.deleted.has(value)) {
					event.deleted._delete(value);
				} else {
					if (!event.added) {
						event.added = new ReadOnly(null, this.__comparator__);
					}
					event.added._add(value);
				}
				return this;
			}
			this.emit('change', { type: 'add', value: value, target: this });
			return this;
		}),
		$add: d(add),
		clear: d(function () {
			var event;
			if (!this.size) return;
			if (this.__postponed__) {
				event = this.__postponedEvent__;
				if (!event) {
					event = this.__postponedEvent__ =
						{ deleted: new ReadOnly(this, this.__comparator__) };
				} else {
					this.forEach(function (value) {
						if (event.added && event.added.has(value)) {
							event.added._delete(value);
							return;
						}
						if (!event.deleted) {
							event.deleted = new ReadOnly(null, this.__comparator__);
						}
						event.deleted._add(value);
					}, this);
				}
			}
			clear.call(this);
			if (!this.__postponed__) this.emit('change', { type: 'clear', target: this });
		}),
		$clear: d(clear),
		delete: d(function (value) {
			var event;
			if (!del.call(this, value)) return false;
			if (this.__postponed__) {
				event = this.__postponedEvent__;
				if (!event) event = this.__postponedEvent__ = {};
				if (event.added && event.added.has(value)) {
					event.added._delete(value);
				} else {
					if (!event.deleted) {
						event.deleted = new ReadOnly(null, this.__comparator__);
					}
					event.deleted._add(value);
				}
				return this;
			}
			this.emit('change', { type: 'delete', value: value, target: this });
			return true;
		}),
		$delete: d(del),
		_postponed_: d.gs(function () {
			return this.__postponed__;
		}, function (value) {
			var event;
			this.__postponed__ = value;
			if (value) return;
			event = this.__postponedEvent__;
			if (!event) return;
			if (event.added && event.added.size) {
				if (event.deleted && event.deleted.size) {
					event.type = 'batch';
				} else if (event.added.size === 1) {
					event.type = 'add';
					event.value = event.added.values().next().value;
					delete event.deleted;
					delete event.added;
				} else {
					event.type = 'batch';
					delete event.deleted;
				}
			} else if (event.deleted && event.deleted.size) {
				if (event.deleted.size === 1) {
					event.type = 'delete';
					event.value = event.deleted.values().next().value;
					delete event.added;
					delete event.deleted;
				} else {
					event.type = 'batch';
					delete event.added;
				}
			} else {
				event = null;
			}
			this.__postponedEvent__ = null;
			if (!event) return;
			this.emit('change', event);
		})
	}, lazy({
		__postponed__: d('w', 0),
		__postponedEvent__: d('w', null)
	}))));
	defineProperty(Observable.prototype, isObservableSymbol, d('', true));

	return Observable;
}, { normalizer: require('memoizee/normalizers/get-1')() });
