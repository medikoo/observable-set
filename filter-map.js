'use strict';

var eIndexOf           = require('es5-ext/array/#/e-index-of')
  , i                  = require('es5-ext/function/i')
  , invoke             = require('es5-ext/function/invoke')
  , validFunction      = require('es5-ext/function/valid-function')
  , callable           = require('es5-ext/object/valid-callable')
  , value              = require('es5-ext/object/valid-value')
  , d                  = require('d/d')
  , memoize            = require('memoizee/lib/regular')
  , memMethods         = require('memoizee/lib/d')(memoize)
  , createReadOnly     = require('./create-read-only')
  , validObservableSet = require('./valid-observable-set')
  , emitBatch          = require('./_emit-batch')

  , bind = Function.prototype.bind
  , defineProperties = Object.defineProperties
  , invokeDispose = invoke('_dispose');

require('memoizee/lib/ext/ref-counter');
require('memoizee/lib/ext/dispose');

module.exports = memoize(function (ObservableSet) {
	var ReadOnly;

	validFunction(ObservableSet);
	validObservableSet(ObservableSet.prototype);
	ReadOnly = createReadOnly(ObservableSet);

	defineProperties(ObservableSet.prototype, memMethods({
		filter: d(function (callbackFn/*, thisArg*/) {
			var result, thisArg, cb, disposed, listener;
			(value(this) && callable(callbackFn));
			thisArg = arguments[1];
			cb = memoize(bind.call(callbackFn, thisArg), { length: 1 });
			result = new ReadOnly();
			this.on('change', listener = function (event) {
				var type = event.type, added, deleted;
				if (type === 'add') {
					if (cb(event.value)) result._add(event.value);
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
				if (type === 'batch') {
					if (event.added) {
						added = [];
						event.added.forEach(function (value) {
							if (!cb(value)) return;
							result.$add(value);
							added.push(value);
						});
					}
					if (event.deleted) {
						deleted = [];
						event.deleted.forEach(function (value) {
							if (!result.$delete(value)) return;
							deleted.push(value);
						});
					}
				} else {
					deleted = [];
					result.forEach(function (value) {
						if (this.has(value)) return;
						result.$delete(value);
						deleted.push(value);
					}, this);
					added = [];
					this.forEach(function (value) {
						if (result.has(value)) return;
						if (!cb(value)) return;
						result.$add(value);
						added.push(value);
					});
				}
				emitBatch(result, added, deleted);
			}.bind(this));
			this.forEach(function (value) {
				if (cb(value)) result.$add(value);
			});
			defineProperties(result, {
				refresh: d(function (value) {
					if (!this.has(value)) return;
					cb.clear(value);
					if (cb(value)) result._add(value);
					else result._delete(value);
				}.bind(this)),
				refreshAll: d(function () {
					cb.clearAll();
					this.forEach(function (value) {
						if (cb(value)) result._add(value);
						else result._delete(value);
					});
				}.bind(this)),
				unref: d(function () {
					if (disposed) return;
					this.filter.clearRef(callbackFn, thisArg);
				}.bind(this)),
				_dispose: d(function () {
					this.off('change', listener);
					disposed = true;
				}.bind(this))
			});
			return result;
		}, { length: 2, refCounter: true, dispose: invokeDispose }),

		map: d(function (callbackFn/*, thisArg*/) {
			var result, thisArg, cb, disposed, listener, registry, inClear;
			(value(this) && callable(callbackFn));
			thisArg = arguments[1];
			cb = memoize(bind.call(callbackFn, thisArg), { length: 1 });
			registry = memoize(i, { refCounter: true, dispose: function (val) {
				if (inClear) return;
				result._delete(val);
			} });
			result = new ReadOnly();
			this.on('change', listener = function (event) {
				var type = event.type, added, deleted, valid;
				if (type === 'add') {
					result._add(registry(cb(event.value)));
					return;
				}
				if (type === 'delete') {
					registry.clearRef(cb(event.value));
					return;
				}
				if (type === 'clear') {
					inClear = true;
					registry.clearAll();
					inClear = false;
					result._clear();
					return;
				}
				if (type === 'batch') {
					if (event.added) {
						added = [];
						event.added.forEach(function (value) {
							value = registry(cb(value));
							if (result.has(value)) return;
							result.$add(value);
							added.push(value);
						});
					}
					if (event.deleted) {
						deleted = [];
						inClear = true;
						event.deleted.forEach(function (value) {
							value = cb(value);
							registry.clearRef(value);
							if (!registry.getRefCount(value)) {
								result.$delete(value);
								deleted.push(value);
							}
						});
						inClear = false;
					}
				} else {
					inClear = true;
					registry.clearAll();
					inClear = false;
					valid = [];
					added = [];
					this.forEach(function (value) {
						value = registry(cb(value));
						valid.push(value);
						if (result.has(value)) return;
						result.$add(value);
						added.push(value);
					});
					deleted = [];
					result.forEach(function (value) {
						if (eIndexOf.call(valid, value)) return;
						result.$delete(value);
						deleted.push(value);
					});
				}
				emitBatch(result, added, deleted);
			});
			this.forEach(function (value) { result.$add(registry(cb(value))); });
			defineProperties(result, {
				refresh: d(function (value) {
					var pre, post;
					if (!this.has(value)) return;
					pre = cb(value);
					cb.clear(value);
					post = cb(value);
					if (pre === post) return;
					registry.clear(pre);
					result._add(registry(post));
				}.bind(this)),
				refreshAll: d(function () {
					this.forEach(this.refresh, this);
				}.bind(this)),
				unref: d(function () {
					if (disposed) return;
					this.map.clearRef(callbackFn, thisArg);
				}.bind(this)),
				_dispose: d(function () {
					this.off('change', listener);
					disposed = true;
				}.bind(this))
			});
			return result;
		}, { length: 2, refCounter: true, dispose: invokeDispose })
	}));

	return ObservableSet;
});
