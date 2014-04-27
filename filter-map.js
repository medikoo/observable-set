'use strict';

var eIndexOf           = require('es5-ext/array/#/e-index-of')
  , identity           = require('es5-ext/function/identity')
  , invoke             = require('es5-ext/function/invoke')
  , callable           = require('es5-ext/object/valid-callable')
  , value              = require('es5-ext/object/valid-value')
  , d                  = require('d')
  , memoize            = require('memoizee/plain')
  , memoizeMethods     = require('memoizee/methods-plain')
  , getNormalizer      = require('memoizee/normalizers/get-fixed')
  , getNormalizer1     = require('memoizee/normalizers/get-1')
  , createReadOnly     = require('./create-read-only')
  , validObservableSet = require('./valid-observable-set')

  , bind = Function.prototype.bind
  , defineProperties = Object.defineProperties
  , invokeDispose = invoke('_dispose');

require('memoizee/ext/ref-counter');
require('memoizee/ext/dispose');

module.exports = memoize(function (prototype) {
	var ReadOnly;

	validObservableSet(prototype);
	if (prototype.$add) ReadOnly = createReadOnly(prototype.constructor);
	else ReadOnly = createReadOnly(require('./'));

	return defineProperties(prototype, memoizeMethods({
		filter: d(function (callbackFn/*, thisArg*/) {
			var result, thisArg, cb, disposed, listener;
			(value(this) && callable(callbackFn));
			thisArg = arguments[1];
			cb = memoize(bind.call(callbackFn, thisArg), { normalizer: getNormalizer1() });
			result = new ReadOnly();
			this.on('change', listener = function (event) {
				var type = event.type;
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
				result._postponed_ += 1;
				if (type === 'batch') {
					if (event.added) {
						event.added.forEach(function (value) {
							if (!cb(value)) return;
							result._add(value);
						});
					}
					if (event.deleted) {
						event.deleted.forEach(function (value) { result._delete(value); });
					}
				} else {
					result.forEach(function (value) {
						if (this.has(value)) return;
						result._delete(value);
					}, this);
					this.forEach(function (value) {
						if (result.has(value)) return;
						if (!cb(value)) return;
						result._add(value);
					});
				}
				result._postponed_ -= 1;
			}.bind(this));
			this.forEach(function (value) {
				if (cb(value)) result.$add(value);
			});
			defineProperties(result, {
				refresh: d(function (value) {
					cb.clear(value);
					if (!this.has(value)) return;
					if (cb(value)) result._add(value);
					else result._delete(value);
				}.bind(this)),
				refreshAll: d(function () {
					cb.clear();
					this.forEach(function (value) {
						if (cb(value)) result._add(value);
						else result._delete(value);
					});
				}.bind(this)),
				unref: d(function () {
					if (disposed) return;
					this.filter.deleteRef(callbackFn, thisArg);
				}.bind(this)),
				_dispose: d(function () {
					this.off('change', listener);
					disposed = true;
				}.bind(this))
			});
			return result;
		}, { length: 2, refCounter: true, dispose: invokeDispose, getNormalizer: getNormalizer }),

		map: d(function (callbackFn/*, thisArg*/) {
			var result, thisArg, cb, disposed, listener, registry, inClear;
			(value(this) && callable(callbackFn));
			thisArg = arguments[1];
			cb = memoize(bind.call(callbackFn, thisArg), { normalizer: getNormalizer1() });
			registry = memoize(identity, { refCounter: true, dispose: function (val) {
				if (inClear) return;
				result._delete(val);
			}, normalizer: getNormalizer1() });
			result = new ReadOnly();
			this.on('change', listener = function (event) {
				var type = event.type, valid;
				if (type === 'add') {
					result._add(registry(cb(event.value)));
					return;
				}
				if (type === 'delete') {
					registry.deleteRef(cb(event.value));
					return;
				}
				if (type === 'clear') {
					inClear = true;
					registry.clear();
					inClear = false;
					result._clear();
					return;
				}
				result._postponed_ += 1;
				if (type === 'batch') {
					if (event.added) {
						event.added.forEach(function (value) {
							value = registry(cb(value));
							if (result.has(value)) return;
							result._add(value);
						});
					}
					if (event.deleted) {
						inClear = true;
						event.deleted.forEach(function (value) {
							value = cb(value);
							registry.deleteRef(value);
							if (!registry.getRefCount(value)) {
								result._delete(value);
							}
						});
						inClear = false;
					}
				} else {
					inClear = true;
					registry.clear();
					inClear = false;
					valid = [];
					this.forEach(function (value) {
						value = registry(cb(value));
						valid.push(value);
						if (result.has(value)) return;
						result._add(value);
					});
					result.forEach(function (value) {
						if (eIndexOf.call(valid, value)) return;
						result._delete(value);
					});
				}
				result._postponed_ -= 1;
			});
			this.forEach(function (value) { result.$add(registry(cb(value))); });
			defineProperties(result, {
				refresh: d(function (value) {
					var pre, post;
					if (!this.has(value)) {
						cb.delete(value);
						return;
					}
					pre = cb(value);
					cb.delete(value);
					post = cb(value);
					if (pre === post) return;
					registry.delete(pre);
					result._add(registry(post));
				}.bind(this)),
				refreshAll: d(function () {
					this.forEach(this.refresh, this);
				}.bind(this)),
				unref: d(function () {
					if (disposed) return;
					this.map.deleteRef(callbackFn, thisArg);
				}.bind(this)),
				_dispose: d(function () {
					this.off('change', listener);
					disposed = true;
				}.bind(this))
			});
			return result;
		}, { length: 2, refCounter: true, dispose: invokeDispose, getNormalizer: getNormalizer  })
	}));
}, { normalizer: getNormalizer1() });
