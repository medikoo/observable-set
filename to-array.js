'use strict';

var aFrom           = require('es5-ext/array/from')
  , clear           = require('es5-ext/array/#/clear')
  , eIndexOf        = require('es5-ext/array/#/e-index-of')
  , isCopy          = require('es5-ext/array/#/is-copy')
  , invoke          = require('es5-ext/function/invoke')
  , validFunction   = require('es5-ext/function/valid-function')
  , callable        = require('es5-ext/object/valid-callable')
  , value           = require('es5-ext/object/valid-value')
  , d               = require('d/d')
  , memoize         = require('memoizee/lib/regular')
  , memMethods      = require('memoizee/lib/d')(memoize)
  , ReadOnly        = require('observable-array/create-read-only')(
	require('observable-array')
)
  , isObservableSet = require('./is-observable-set')

  , push = Array.prototype.push, sort = Array.prototype.sort
  , splice = Array.prototype.splice
  , defineProperties = Object.defineProperties
  , invokeDispose = invoke('_dispose');

require('memoizee/lib/ext/ref-counter');
require('memoizee/lib/ext/dispose');

module.exports = memoize(function (ObservableSet) {
	validFunction(ObservableSet);
	if (!isObservableSet(new ObservableSet())) {
		throw new TypeError(ObservableSet + " is not observable set constructor");
	}
	defineProperties(ObservableSet.prototype, memMethods({
		toArray: d(function (compareFn) {
			var result, setData, disposed, listener, delListener, clearListener, tmp;
			(value(this) && ((compareFn === undefined) || callable(compareFn)));
			if (this.__setData__) {
				setData = this.__setData__;
				result = ReadOnly.from(setData);
				this.on('_add', listener = function (index, value) {
					if (compareFn) {
						push.call(result, value);
						sort.call(result, compareFn);
						result.emit('change', {
							type: 'splice',
							arguments: [setData.eIndexOf.call(result, value), 0, value],
							removed: []
						});
					} else if (result.length === index) {
						push.call(result, value);
						result.emit('change', { type: 'set', index: index });
					} else {
						result.emit('change', {
							type: 'splice',
							arguments: [index, 0, value],
							removed: splice.call(result, index, 0, value)
						});
					}
				});
				this.on('_delete', delListener = function (index, value) {
					if (compareFn) index = setData.eIndexOf.call(result, value);
					result.emit('change', { type: 'splice', arguments: [index, 1],
						removed: splice.call(result, index, 1) });
				});
				this.on('_clear', clearListener = function (value) {
					clear.call(result);
					result.emit('change', { type: 'clear' });
				});
			} else {
				result = ReadOnly.from(this);
				this.on('change', listener = function (event) {
					var index, type = event.type;
					if (type === 'add') {
						index = push.call(result, event.value);
						if (compareFn) {
							sort.call(result, compareFn);
							result.emit('change', {
								type: 'splice',
								arguments: [setData.eIndexOf.call(result, value), 0, value],
								removed: []
							});
						} else {
							result.emit('change', { type: 'set', index: index - 1 });
						}
					} else if (type === 'delete') {
						index = eIndexOf.call(result, event.value);
						result.emit('change', { type: 'splice', arguments: [index, 1],
							removed: splice.call(result, index, 1) });
					} else if (type === 'clear') {
						clear.call(result);
						result.emit('change', { type: 'clear' });
					} else {
						tmp = aFrom(result);
						clear.call(result);
						this.forEach(function (value) { push.call(result, value); });
						if (compareFn) sort.call(result, compareFn);
						if (!isCopy.call(result, tmp)) result.emit('change', {});
					}
				});
			}
			if (compareFn) sort.call(result, compareFn);
			defineProperties(result, {
				refresh: d(function () {
					var tmp;
					if (!compareFn || (this.size <= 1)) return;
					tmp = aFrom(result);
					sort.call(result, compareFn);
					if (!isCopy.call(result, tmp)) result.emit('change', {});
				}.bind(this)),
				unref: d(function () {
					if (disposed) return;
					this.toArray.clearRef(compareFn);
				}.bind(this)),
				_dispose: d(function () {
					if (setData) {
						this.off('_add', listener);
						this.off('_delete', delListener);
						this.off('_clear', clearListener);
					} else {
						this.off('change', listener);
					}
					disposed = true;
				}.bind(this))
			});
			return result;
		}, { refCounter: true, dispose: invokeDispose })
	}));

	return ObservableSet;
});
