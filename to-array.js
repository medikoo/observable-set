'use strict';

var aFrom          = require('es5-ext/array/from')
  , clear          = require('es5-ext/array/#/clear')
  , eIndexOf       = require('es5-ext/array/#/e-index-of')
  , isCopy         = require('es5-ext/array/#/is-copy')
  , invoke         = require('es5-ext/function/invoke')
  , validFunction  = require('es5-ext/function/valid-function')
  , callable       = require('es5-ext/object/valid-callable')
  , value          = require('es5-ext/object/valid-value')
  , d              = require('d/d')
  , memoize        = require('memoizee/lib/regular')
  , memMethods     = require('memoizee/lib/d')(memoize)
  , ReadOnly       = require('observable-array/create-read-only')(
	require('observable-array')
)
  , push = Array.prototype.push, sort = Array.prototype.sort
  , splice = Array.prototype.splice
  , defineProperties = Object.defineProperties
  , invokeDispose = invoke('_dispose');

require('memoizee/lib/ext/ref-counter');
require('memoizee/lib/ext/dispose');

module.exports = memoize(function (ObservableSet) {
	validFunction(ObservableSet);
	defineProperties(ObservableSet.prototype, memMethods({
		toArray: d(function (compareFn) {
			var result, setData, disposed, addListener, delListener, clearListener;
			(value(this) && ((compareFn === undefined) || callable(compareFn)));
			if (this.__setData__) {
				setData = this.__setData__;
				result = ReadOnly.from(setData);
				this.on('_add', addListener = function (index, value) {
					if (compareFn) {
						push.call(result, value);
						sort.call(result, compareFn);
					} else if (result.length === index) {
						push.call(result, value);
					} else {
						splice.call(result, index, 0, value);
					}
					result.emit('change');
				});
				this.on('_delete', delListener = function (index, value) {
					if (compareFn) {
						splice.call(result, setData.eIndexOf.call(result, value), 1);
					} else {
						splice.call(result, index, 1);
					}
					result.emit('change');
				});
			} else {
				result = ReadOnly.from(this);
				this.on('add', addListener = function (value) {
					push.call(result, value);
					if (compareFn) sort.call(result, compareFn);
					result.emit('change');
				});
				this.on('delete', delListener = function (value) {
					splice.call(result, eIndexOf.call(result, value), 1);
					result.emit('change');
				});
			}
			this.on('clear', clearListener = function (value) {
				clear.call(result);
				result.emit('change');
			});
			if (compareFn) sort.call(result, compareFn);
			defineProperties(result, {
				refresh: d(function () {
					var tmp;
					if (!compareFn || (this.size <= 1)) return;
					tmp = aFrom(result);
					sort.call(result, compareFn);
					if (!isCopy.call(result, tmp)) result.emit('change');
				}.bind(this)),
				unref: d(function () {
					if (disposed) return;
					this.toArray.clearRef(compareFn);
				}.bind(this)),
				_dispose: d(function () {
					if (setData) {
						this.off('_add', addListener);
						this.off('_delete', delListener);
					} else {
						this.off('add', addListener);
						this.off('delete', delListener);
					}
					this.off('clear', clearListener);
					disposed = true;
				}.bind(this))
			});
			return result;
		}, { refCounter: true, dispose: invokeDispose })
	}));

	return ObservableSet;
});
