'use strict';

var uniq               = require('es5-ext/array/#/uniq')
  , invoke             = require('es5-ext/function/invoke')
  , WeakMap            = require('es6-weak-map')
  , d                  = require('d')
  , memoize            = require('memoizee/plain')
  , createReadOnly     = require('./create-read-only')
  , validObservableSet = require('./valid-observable-set')

  , push = Array.prototype.push, slice = Array.prototype.slice
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , invokeDispose = invoke('_dispose')
  , invokeUnref = invoke('unref')
  , getSetId
  , sortSets = function (a, b) { return getSetId(a) - getSetId(b); };

getSetId = (function () {
	var map = new WeakMap(), i = 0;
	return function (set) { return map.get(set) || (map.set(set, ++i) && i); };
}());

require('memoizee/ext/ref-counter');
require('memoizee/ext/dispose');

module.exports = memoize(function (prototype) {
	var ReadOnly, and, or, not, orMethod;

	validObservableSet(prototype);
	if (prototype.$add) ReadOnly = createReadOnly(prototype.constructor);
	else ReadOnly = createReadOnly(require('./'));

	and = memoize(function (id, a, b) {
		var result = new ReadOnly(), aListener, bListener, disposed, resolved;
		a.forEach(function (value) {
			if (b.has(value)) result.$add(value);
		});
		a.on('change', aListener = function (event) {
			var type = event.type;
			if (type === 'add') {
				if (b.has(event.value)) result._add(event.value);
				return;
			}
			if (type === 'delete') {
				result._delete(event.value);
				return;
			}
			if (type === 'clear') {
				result._clear();
				return;
			}
			result._postponed_ += 1;
			if (type === 'batch') {
				if (event.added) {
					event.added.forEach(function (value) {
						if (!b.has(value)) return;
						result._add(value);
					});
				}
				if (event.deleted) {
					event.deleted.forEach(function (value) {
						if (!b.has(value)) return;
						result._delete(value);
					});
				}
			} else {
				result.forEach(function (value) {
					if (a.has(value)) return;
					result._delete(value);
				});
				a.forEach(function (value) {
					if (result.has(value) || !b.has(value)) return;
					result._add(value);
				});
			}
			result._postponed_ -= 1;
		});
		b.forEach(function (value) {
			if (a.has(value)) result.$add(value);
		});
		b.on('change', bListener = function (event) {
			var type = event.type;
			if (type === 'add') {
				if (a.has(event.value)) result._add(event.value);
				return;
			}
			if (type === 'delete') {
				result._delete(event.value);
				return;
			}
			if (type === 'clear') {
				result._clear();
				return;
			}
			result._postponed_ += 1;
			if (type === 'batch') {
				if (event.added) {
					event.added.forEach(function (value) {
						if (!a.has(value)) return;
						result._add(value);
					});
				}
				if (event.deleted) {
					event.deleted.forEach(function (value) {
						if (!a.has(value)) return;
						result._delete(value);
					});
				}
			} else {
				result.forEach(function (value) {
					if (b.has(value)) return;
					result._delete(value);
				});
				b.forEach(function (value) {
					if (result.has(value) || !a.has(value)) return;
					result._add(value);
				});
			}
			result._postponed_ -= 1;
		});
		resolved = [];
		if (a.__and__) push.apply(resolved, a.__and__);
		else resolved.push(a);
		if (b.__and__) push.apply(resolved, b.__and__);
		else resolved.push(b);
		resolved = uniq.call(resolved).sort(sortSets);
		defineProperties(result, {
			__and__: d('c', resolved),
			unref: d(function () {
				if (disposed) return;
				and.deleteRef(id);
			}),
			_dispose: d(function () {
				disposed = true;
				a.off('change', aListener);
				b.off('change', bListener);
				delete this.__and__;
				if (this.__innerDeps__) {
					this.__innerDeps__.forEach(invokeUnref);
					delete this.__innerDeps__;
				}
			})
		});
		return result;
	}, { length: 1, refCounter: true, dispose: invokeDispose });

	or = memoize(function (id, a, b) {
		var result = new ReadOnly(), onAdd, aListener, bListener, disposed
		  , resolved;
		a.forEach(onAdd = function (value) { result.$add(value); });
		a.on('change', aListener = function (event) {
			var type = event.type;
			if (type === 'add') {
				result._add(event.value);
				return;
			}
			if (type === 'delete') {
				if (!b.has(event.value)) result._delete(event.value);
				return;
			}
			result._postponed_ += 1;
			if (type === 'clear') {
				result.forEach(function (value) {
					if (b.has(value)) return;
					result._delete(value);
				});
			} else if (type === 'batch') {
				if (event.added) {
					event.added.forEach(function (value) {
						if (b.has(value)) return;
						result._add(value);
					});
				}
				if (event.deleted) {
					event.deleted.forEach(function (value) {
						if (b.has(value)) return;
						result._delete(value);
					});
				}
			} else {
				result.forEach(function (value) {
					if (a.has(value) || b.has(value)) return;
					result._delete(value);
				});
				a.forEach(function (value) {
					if (result.has(value)) return;
					result._add(value);
				});
			}
			result._postponed_ -= 1;
		});
		b.forEach(onAdd);
		b.on('change', bListener = function (event) {
			var type = event.type;
			if (type === 'add') {
				result._add(event.value);
				return;
			}
			if (type === 'delete') {
				if (!a.has(event.value)) result._delete(event.value);
				return;
			}
			result._postponed_ += 1;
			if (type === 'clear') {
				result.forEach(function (value) {
					if (a.has(value)) return;
					result._delete(value);
				});
			} else if (type === 'batch') {
				if (event.added) {
					event.added.forEach(function (value) {
						if (a.has(value)) return;
						result._add(value);
					});
				}
				if (event.deleted) {
					event.deleted.forEach(function (value) {
						if (a.has(value)) return;
						result._delete(value);
					});
				}
			} else {
				result.forEach(function (value) {
					if (a.has(value) || b.has(value)) return;
					result._delete(value);
				});
				b.forEach(function (value) {
					if (result.has(value)) return;
					result._add(value);
				});
			}
			result._postponed_ -= 1;
		});
		resolved = [];
		if (a.__or__) push.apply(resolved, a.__or__);
		else resolved.push(a);
		if (b.__or__) push.apply(resolved, b.__or__);
		else resolved.push(b);
		resolved = uniq.call(resolved).sort(sortSets);
		defineProperties(result, {
			__or__: d('c', resolved),
			unref: d(function () {
				if (disposed) return;
				or.deleteRef(id);
			}),
			_dispose: d(function () {
				disposed = true;
				a.off('change', aListener);
				b.off('change', bListener);
				delete this.__or__;
				if (this.__innerDeps__) {
					this.__innerDeps__.forEach(invokeUnref);
					delete this.__innerDeps__;
				}
			})
		});
		return result;
	}, { length: 1, refCounter: true, dispose: invokeDispose });

	not = memoize(function (id, a, b) {
		var result = new ReadOnly(), aListener, bListener, disposed;
		a.forEach(function (value) {
			if (!b.has(value)) result.$add(value);
		});
		a.on('change', aListener = function (event) {
			var type = event.type;
			if (type === 'add') {
				if (!b.has(event.value)) result._add(event.value);
				return;
			}
			if (type === 'delete') {
				result._delete(event.value);
				return;
			}
			if (type === 'clear') {
				result._clear();
				return;
			}
			result._postponed_ += 1;
			if (type === 'batch') {
				if (event.added) {
					event.added.forEach(function (value) {
						if (b.has(value)) return;
						result._add(value);
					});
				}
				if (event.deleted) {
					event.deleted.forEach(function (value) {
						if (!result.has(value)) return;
						result._delete(value);
					});
				}
			} else {
				result.forEach(function (value) {
					if (a.has(value)) return;
					result._delete(value);
				});
				a.forEach(function (value) {
					if (result.has(value) || b.has(value)) return;
					result._add(value);
				});
			}
			result._postponed_ -= 1;
		});
		b.on('change', bListener = function (event) {
			var type = event.type;
			if (type === 'add') {
				result._delete(event.value);
				return;
			}
			if (type === 'delete') {
				if (a.has(event.value)) result._add(event.value);
				return;
			}
			result._postponed_ += 1;
			if (type === 'clear') {
				a.forEach(function (value) {
					if (result.has(value)) return;
					result._add(value);
				});
			} else if (type === 'batch') {
				if (event.added) {
					event.added.forEach(function (value) {
						if (!result.has(value)) return;
						result._delete(value);
					});
				}
				if (event.deleted) {
					event.deleted.forEach(function (value) {
						if (!a.has(value)) return;
						result._add(value);
					});
				}
			} else {
				result.forEach(function (value) {
					if (!b.has(value)) return;
					result._delete(value);
				});
				a.forEach(function (value) {
					if (b.has(value) || result.has(value)) return;
					result._add(value);
				});
			}
			result._postponed_ -= 1;
		});
		defineProperties(result, {
			unref: d(function () {
				if (disposed) return;
				not.deleteRef(id);
			}),
			_dispose: d(function () {
				disposed = true;
				a.off('change', aListener);
				b.off('change', bListener);
				if (this.__innerDeps__) {
					this.__innerDeps__.forEach(invokeUnref);
					delete this.__innerDeps__;
				}
			})
		});
		return result;
	}, { length: 1, refCounter: true, dispose: invokeDispose });

	return defineProperties(prototype, {
		and: d(function (set1/*, …sets*/) {
			var sets = [this], set2, result, deps = [], resolved;
			push.apply(sets, arguments);
			sets.forEach(validObservableSet);
			if (sets.length < 2) validObservableSet();
			sets.forEach(function (set) {
				if (set.hasOwnProperty('__and__')) push.apply(this, set.__and__);
				else this.push(set);
			}, resolved = []);
			sets = resolved;
			while (sets.length) {
				sets.sort(sortSets);
				set1 = sets.shift();
				set2 = sets.shift();
				result = and(getSetId(set1) + '|' + getSetId(set2), set1, set2);
				if (sets.length) {
					deps.push(result);
					sets.push(result);
				}
			}
			if (deps.length) {
				if (!result.__innerDeps__) {
					defineProperty(result, '__innerDeps__', d(deps));
				} else {
					push.apply(result.__innerDeps__, deps);
				}
			}
			return result;
		}),

		or: d(orMethod = function (set1/*, …sets*/) {
			var sets = [this], set2, result, deps = [], resolved;
			push.apply(sets, arguments);
			sets.forEach(validObservableSet);
			if (sets.length < 2) validObservableSet();
			sets.forEach(function (set) {
				if (set.hasOwnProperty('__or__')) push.apply(this, set.__or__);
				else this.push(set);
			}, resolved = []);
			sets = resolved;
			while (sets.length) {
				sets.sort(sortSets);
				set1 = sets.shift();
				set2 = sets.shift();
				result = or(getSetId(set1) + '|' + getSetId(set2), set1, set2);
				if (sets.length) {
					deps.push(result);
					sets.push(result);
				}
			}
			if (deps.length) {
				if (!result.__innerDeps__) {
					defineProperty(result, '__innerDeps__', d(deps));
				} else {
					push.apply(result.__innerDeps__, deps);
				}
			}
			return result;
		}),

		not: d(function (set/*, …sets*/) {
			var result;
			if (!set) validObservableSet(set);
			if (arguments.length > 1) {
				set = orMethod.apply(arguments[0], slice.call(arguments, 1));
			}
			result = not(getSetId(this) + '|' + getSetId(set), this, set);
			if (arguments.length > 1) {
				if (!result.__innerDeps__) {
					defineProperty(result, '__innerDeps__', d([set]));
				} else {
					result.__innerDeps__.push(set);
				}
			}
			return result;
		})
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
