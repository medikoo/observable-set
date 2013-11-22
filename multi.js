'use strict';

var setPrototypeOf     = require('es5-ext/object/set-prototype-of')
  , iterator           = require('es6-iterator/valid-iterable')
  , forOf              = require('es6-iterator/for-of')
  , Map                = require('es6-map')
  , Set                = require('es6-set')
  , d                  = require('d/d')
  , ObservableSet      = require('./create-read-only')(
	require('./')
)
  , validObservableSet = require('./valid-observable-set')

  , create = Object.create, defineProperties = Object.defineProperties
  , MultiSet;

MultiSet = module.exports = function (/* iterable, comparator */) {
	var iterable = arguments[0], comparator = arguments[1], sets;
	if (!(this instanceof MultiSet)) return new MultiSet(iterable, comparator);
	if (iterable != null) {
		iterator(iterable);
		sets = new Set();
		forOf(iterable, function (value) {
			sets.add(validObservableSet(value));
		});
	}
	ObservableSet.call(this, undefined, comparator);
	defineProperties(this, {
		__map__: d(new Map(undefined, comparator)),
		__sets__: d(sets),
		__listeners__: d(new Map())
	});
	sets.forEach(function (set) {
		var listener;
		set.forEach(function (value) {
			var count = (this.__map__.get(value) || 0) + 1;
			this.__map__.set(value, count);
			if (count > 1) return;
			this.$add(value);
		}, this);
		set.on('change', listener = this._onUpdate.bind(this, set));
		this.__listeners__.set(set, listener);
	}, this);
};
if (setPrototypeOf) setPrototypeOf(MultiSet, ObservableSet);

MultiSet.prototype = create(ObservableSet.prototype, {
	constructor: d(MultiSet),
	addSet: d(function (set) {
		var added, event, listener;
		if (this.__sets__.has(validObservableSet(set))) return this;
		this.__sets__.add(set);
		added = [];
		set.forEach(function (value) {
			var count = (this.__map__.get(value) || 0) + 1;
			this.__map__.set(value, count);
			if (count > 1) return;
			added.push(value);
			this.$add(value);
		}, this);
		set.on('change', listener = this._onUpdate.bind(this, set));
		this.__listeners__.set(set, listener);
		if (added.length) {
			if (added.length === 1) event = { type: 'add', value: added[0] };
			else event = { type: 'batch', added: added };
			this.emit('change', event);
		}
		return this;
	}),
	clearSets: d(function () {
		if (!this.__sets__.size) return;
		this.__sets__.forEach(function (set) {
			set.off('change', this.__listeners__.get(set));
		}, this);
		this.__sets__.clear();
		this.__map__.clear();
		this.__listeners__.clear();
		this._clear();
	}),
	deleteSet: d(function (set) {
		var deleted, event;
		if (!this.__sets__.has(validObservableSet(set))) return false;
		this.__sets__.delete(set);
		deleted = [];
		set.forEach(function (value) {
			var count = this.__map__.get(value) - 1;
			if (count) {
				this.__map__.set(value, count);
				return;
			}
			deleted.push(value);
			this.__map__.delete(value);
			this.$delete(value);
		}, this);
		set.off('change', this.__listeners__.get(set));
		this.__listeners__.delete(set);
		if (deleted.length) {
			if (deleted.length === 1) event = { type: 'delete', value: deleted[0] };
			else event = { type: 'batch', deleted: deleted };
			this.emit('change', event);
		}
		return true;
	}),
	forEachSet: d(function (cb/*, thisArg*/) {
		return this.__sets__.forEach(cb, arguments[1]);
	}),
	hasSet: d(function (set) { return this.__sets__.has(set); }),
	_onUpdate: d(function (current, event) {
		var type = event.type, count, deleted, added;
		if (type === 'add') {
			count = (this.__map__.get(event.value) || 0) + 1;
			this.__map__.set(event.value, count);
			if (count > 1) return;
			this._add(event.value);
			return;
		}
		if (type === 'delete') {
			count = (this.__map__.get(event.value) || 0) - 1;
			if (count) {
				this.__map__.set(event.value, count);
				return;
			}
			this.__map__.delete(event.value);
			this._delete(event.value);
			return;
		}
		if (type === 'clear') {
			if (this.__sets__.size === 1) {
				this.__map__.clear();
				this._clear();
				return;
			}
			deleted = [];
			this.__map__.forEach(function (count, value) {
				forOf(this.__sets__, function (set, doBreak) {
					if (set === current) return;
					if (set.has(value)) --count;
					if (!count) doBreak();
				});
				if (!count) return;
				--count;
				if (count) {
					this.__map__.set(value, count);
					return;
				}
				deleted.push(value);
				this.__map__.delete(value);
				this.$delete(value);
			}, this);
			if (!deleted.length) return;
			if (!this.size) {
				event = { type: 'clear' };
			} else if (deleted.length === 1) {
				event = { type: 'delete', value: deleted[0] };
			} else {
				event = { type: 'batch', deleted: deleted };
			}
			this.emit('change', event);
			return;
		}
		if (type === 'batch') {
			if (event.added) {
				added = [];
				event.added.forEach(function (value) {
					var count = (this.__map__.get(value) || 0) + 1;
					this.__map__.set(value, count);
					if (count > 1) return;
					this.$add(value);
					added.push(value);
				}, this);
			}
			if (event.deleted) {
				deleted = [];
				event.deleted.forEach(function (value) {
					var count = this.__map__.get(value) - 1;
					if (count) {
						this.__map__.set(value, count);
						return;
					}
					this.__map__.delete(value);
					this.$delete(value);
					deleted.push(value);
				}, this);
			}
		} else {
			deleted = [];
			this.__map__.forEach(function (count, value) {
				var nu = 0;
				forOf(this.__sets__, function (set, doBreak) {
					if (set.has(value)) ++nu;
					if (nu > count) doBreak();
				});
				if (nu === count) return;
				if (nu) {
					this.__map__.set(value, nu);
					return;
				}
				deleted.push(value);
				this.__map__.delete(value);
				this.$delete(value);
			}, this);
			added = [];
			current.forEach(function (value) {
				if (this.has(value)) return;
				this.__map__.set(value, 1);
				this.$add(value);
				added.push(value);
			}, this);
		}
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
		if (event) this.emit('change', event);
	})
});
