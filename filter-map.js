'use strict';

var i              = require('es5-ext/function/i')
  , invoke         = require('es5-ext/function/invoke')
  , validFunction  = require('es5-ext/function/valid-function')
  , callable       = require('es5-ext/object/valid-callable')
  , value          = require('es5-ext/object/valid-value')
  , d              = require('d/d')
  , memoize        = require('memoizee/lib/regular')
  , memMethods     = require('memoizee/lib/d')(memoize)
  , createReadOnly = require('./create-read-only')

  , bind = Function.prototype.bind
  , defineProperties = Object.defineProperties
  , invokeDispose = invoke('_dispose');

require('memoizee/lib/ext/ref-counter');
require('memoizee/lib/ext/dispose');

module.exports = memoize(function (ObservableSet) {
	var ReadOnly = createReadOnly(validFunction(ObservableSet));

	defineProperties(ObservableSet.prototype, memMethods({
		filter: d(function (callbackFn/*, thisArg*/) {
			var result, thisArg, cb, disposed, addListener, delListener
			  , clearListener;
			(value(this) && callable(callbackFn));
			thisArg = arguments[1];
			cb = memoize(bind.call(callbackFn, thisArg), { length: 1 });
			result = new ReadOnly();
			this.on('add', addListener = function (value) {
				if (cb(value)) result._add(value);
			});
			this.on('delete', delListener = function (value) {
				result._delete(value);
			});
			this.on('clear', clearListener = function (value) { result._clear(); });
			this.forEach(addListener);
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
					this.off('add', addListener);
					this.off('delete', delListener);
					this.off('clear', clearListener);
					disposed = true;
				}.bind(this))
			});
			return result;
		}, { length: 2, refCounter: true, dispose: invokeDispose }),

		map: d(function (callbackFn/*, thisArg*/) {
			var result, thisArg, cb, disposed, addListener, delListener
			  , registry, clearListener, inClear;
			(value(this) && callable(callbackFn));
			thisArg = arguments[1];
			cb = memoize(bind.call(callbackFn, thisArg), { length: 1 });
			registry = memoize(i, { refCounter: true, dispose: function (val) {
				if (inClear) return;
				result._delete(val);
			} });
			result = new ReadOnly();
			this.on('add', addListener = function (value) {
				result._add(registry(cb(value)));
			});
			this.on('delete', delListener = function (value) {
				registry.clearRef(cb(value));
			});
			this.on('clear', clearListener = function (value) {
				inClear = true;
				registry.clearAll();
				inClear = false;
				result._clear();
			});
			this.forEach(addListener);
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
					this.off('add', addListener);
					this.off('delete', delListener);
					this.off('clear', clearListener);
					disposed = true;
				}.bind(this))
			});
			return result;
		}, { length: 2, refCounter: true, dispose: invokeDispose })
	}));

	return ObservableSet;
});
