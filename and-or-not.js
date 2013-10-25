'use strict';

var uniq           = require('es5-ext/array/#/uniq')
  , invoke         = require('es5-ext/function/invoke')
  , validFunction  = require('es5-ext/function/valid-function')
  , validSet       = require('es6-set/valid-set')
  , WeakMap        = require('es6-weak-map')
  , d              = require('d/d')
  , memoize        = require('memoizee/lib/regular')
  , memPrimitive   = require('memoizee/lib/primitive')
  , createReadOnly = require('./create-read-only')

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

require('memoizee/lib/ext/ref-counter');
require('memoizee/lib/ext/dispose');

module.exports = memoize(function (ObservableSet) {
	var ReadOnly = createReadOnly(validFunction(ObservableSet))
	  , and, or, not, orMethod;

	and = memPrimitive(function (id, a, b) {
		var result = new ReadOnly(), aAdd, bAdd, onDel, onClear, disposed
		  , resolved;
		a.forEach(aAdd = function (value) {
			if (b.has(value)) result._add(value);
		});
		a.on('add', aAdd);
		a.on('delete', onDel = function (value) { result._delete(value); });
		a.on('clear', onClear = function () { result._clear(); });
		b.forEach(bAdd = function (value) {
			if (a.has(value)) result._add(value);
		});
		b.on('add', bAdd);
		b.on('delete', onDel);
		b.on('clear', onClear);
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
				and.clearRef(id);
			}),
			_dispose: d(function () {
				disposed = true;
				a.off('add', aAdd);
				a.off('delete', onDel);
				a.off('clear', onClear);
				b.off('add', bAdd);
				b.off('delete', onDel);
				b.off('clear', onClear);
				delete this.__and__;
				if (this.__innerDeps__) {
					this.__innerDeps__.forEach(invokeUnref);
					delete this.__innerDeps__;
				}
			})
		});
		return result;
	}, { length: 1, refCounter: true, dispose: invokeDispose });

	or = memPrimitive(function (id, a, b) {
		var result = new ReadOnly(), onAdd, aDel, bDel, onClear, disposed
		  , resolved;
		a.forEach(onAdd = function (value) { result._add(value); });
		a.on('add', onAdd);
		a.on('delete', aDel = function (value) {
			if (!b.has(value)) result._delete(value);
		});
		a.on('clear', onClear = function () {
			result.forEach(function (value) {
				if (a.has(value) || b.has(value)) return;
				result._delete(value);
			});
		});
		b.forEach(onAdd);
		b.on('add', onAdd);
		b.on('delete', bDel = function (value) {
			if (!a.has(value)) result._delete(value);
		});
		b.on('clear', onClear);
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
				or.clearRef(id);
			}),
			_dispose: d(function () {
				disposed = true;
				a.off('add', onAdd);
				a.off('delete', aDel);
				a.off('clear', onClear);
				b.off('add', onAdd);
				b.off('delete', bDel);
				b.off('clear', onClear);
				delete this.__or__;
				if (this.__innerDeps__) {
					this.__innerDeps__.forEach(invokeUnref);
					delete this.__innerDeps__;
				}
			})
		});
		return result;
	}, { length: 1, refCounter: true, dispose: invokeDispose });

	not = memPrimitive(function (id, a, b) {
		var result = new ReadOnly(), aAdd, aDel, aClear, bDel, bClear, disposed;
		a.forEach(aAdd = function (value) {
			if (!b.has(value)) result._add(value);
		});
		a.on('add', aAdd);
		a.on('delete', aDel = function (value) { result._delete(value); });
		a.on('clear', aClear = function () { result._clear(); });
		b.forEach(aDel);
		b.on('add', aDel);
		b.on('delete', bDel = function (value) {
			if (a.has(value)) result._add(value);
		});
		b.on('clear', bClear = function () { a.forEach(aAdd); });
		defineProperties(result, {
			unref: d(function () {
				if (disposed) return;
				not.clearRef(id);
			}),
			_dispose: d(function () {
				disposed = true;
				a.off('add', aAdd);
				a.off('delete', aDel);
				a.off('clear', aClear);
				b.off('add', aDel);
				b.off('delete', bDel);
				b.off('clear', bClear);
				if (this.__innerDeps__) {
					this.__innerDeps__.forEach(invokeUnref);
					delete this.__innerDeps__;
				}
			})
		});
		return result;
	}, { length: 1, refCounter: true, dispose: invokeDispose });

	defineProperties(ObservableSet.prototype, {
		and: d(function (set1/*, …sets*/) {
			var sets = [this], set2, result, deps = [], resolved;
			push.apply(sets, arguments);
			sets.forEach(validSet);
			if (sets.length < 2) validSet();
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
			sets.forEach(validSet);
			if (sets.length < 2) validSet();
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
			if (!set) validSet(set);
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

	return ObservableSet;
});
