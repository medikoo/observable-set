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
			if (this.__hold__) {
				if (this.__deleted__ && this.__deleted__.has(value)) {
					this.__deleted__.delete(value);
				} else {
					if (!this.__added__) this.__added__ = new Constructor();
					this.__added__.add(value);
				}
				return this;
			}
			this.emit('change', { type: 'add', value: value });
			return this;
		}),
		$add: d(add),
		clear: d(function () {
			if (!this.size) return;
			clear.call(this);
			if (this.__hold__) this.__added__ = this.__deleted__ = null;
			this.emit('change', { type: 'clear' });
		}),
		$clear: d(clear),
		delete: d(function (value) {
			if (!del.call(this, value)) return false;
			if (this.__hold__) {
				if (this.__added__ && this.__added__.has(value)) {
					this.__added__.delete(value);
				} else {
					if (!this.__deleted__) this.__deleted__ = new Constructor();
					this.__deleted__.add(value);
				}
				return this;
			}
			this.emit('change', { type: 'delete', value: value });
			return true;
		}),
		$delete: d(del),
		_hold_: d.gs(function () { return this.__hold__; }, function (value) {
			var event, added, deleted;
			this.__hold__ = value;
			if (value) return;
			added = this.__added__;
			deleted = this.__deleted__;
			if (added && added.size) {
				if (deleted && deleted.size) {
					event = { type: 'batch', added: added, deleted: deleted };
				} else if (added.size === 1) {
					added.forEach(function (value) { added = value; });
					event = { type: 'add', value: added };
				} else {
					event = { type: 'batch', added: added };
				}
			} else if (deleted && deleted.size) {
				if (deleted.size === 1) {
					deleted.forEach(function (value) { deleted = value; });
					event = { type: 'delete', value: deleted };
				} else {
					event = { type: 'batch', deleted: deleted };
				}
			}
			this.__added__ = this.__deleted__ = null;
			if (!event) return;
			this.emit('change', event);
		})
	}, lazy({
		__hold__: d('w', 0),
		__added__: d('w', null),
		__deleted__: d('w', null)
	}))));
	defineProperty(Observable.prototype, isObservableSymbol, d('', true));

	return Observable;
});
