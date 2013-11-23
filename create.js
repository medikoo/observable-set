'use strict';

var validFunction      = require('es5-ext/function/valid-function')
  , assign             = require('es5-ext/object/assign')
  , setPrototypeOf     = require('es5-ext/object/set-prototype-of')
  , d                  = require('d/d')
  , lazy               = require('d/lazy')
  , ee                 = require('event-emitter')
  , memoize            = require('memoizee/lib/regular')
  , validSet           = require('es6-set/valid-set')
  , isObservableSymbol = require('observable-value/symbol-is-observable')

  , defineProperty = Object.defineProperty;

module.exports = memoize(function (Constructor) {
	var Observable, add, clear, del;

	validFunction(Constructor);
	validSet(Constructor.prototype);

	Observable = function (/*iterable, comparator*/) {
		if (!(this instanceof Observable)) {
			return new Observable(arguments[0], arguments[1]);
		}
		Constructor.apply(this, arguments);
	};
	if (setPrototypeOf) setPrototypeOf(Observable, Constructor);

	add = Constructor.prototype.add;
	clear = Constructor.prototype.clear;
	del = Constructor.prototype.delete;

	Observable.prototype = ee(Object.create(Constructor.prototype, assign({
		constructor: d(Observable),
		add: d(function (value) {
			if (this.has(value)) return this;
			add.call(this, value);
			if (this.__onHold__) {
				if (!this.__added__) this.__added__ = [value];
				else this.__added__.push(value);
				return this;
			}
			this.emit('change', { type: 'add', value: value });
			return this;
		}),
		$add: d(add),
		clear: d(function () {
			if (!this.size) return;
			clear.call(this);
			this.emit('change', { type: 'clear' });
		}),
		$clear: d(clear),
		delete: d(function (value) {
			if (!del.call(this, value)) return false;
			if (this.__onHold__) {
				if (!this.__deleted__) this.__deleted__ = [value];
				else this.__deleted__.push(value);
				return this;
			}
			this.emit('change', { type: 'delete', value: value });
			return true;
		}),
		$delete: d(del),
		_release_: d(function () {
			var event, added = this.__added__, deleted = this.__deleted__;
			if (added && added.length) {
				if (deleted && deleted.length) {
					event = { type: 'batch', added: added, deleted: deleted };
				} else if (added.length === 1) {
					event = { type: 'add', value: added[0] };
				} else {
					event = { type: 'batch', added: added };
				}
			} else if (deleted && deleted.length) {
				if (deleted.length === 1) {
					event = { type: 'delete', value: deleted[0] };
				} else {
					event = { type: 'batch', deleted: deleted };
				}
			}
			this.__added__ = this.__deleted__ = this.__onHold__ = null;
			if (!event) return;
			this.emit('change', event);
		})
	}, lazy({
		__onHold__: d('w', null),
		__added__: d('w', null),
		__deleted__: d('w', null)
	}))));
	defineProperty(Observable.prototype, isObservableSymbol, d('', true));

	return Observable;
});
