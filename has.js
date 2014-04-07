'use strict';

var d          = require('d/d')
  , memoize    = require('memoizee/lib/regular')
  , memMethods = require('memoizee/lib/d')(memoize)
  , ReadOnly   = require('observable-value/create-read-only')(
	require('observable-value/value')
)
  , validObservableSet = require('./valid-observable-set')

  , defineProperties = Object.defineProperties;

module.exports = memoize(function (prototype) {
	validObservableSet(prototype);

	return defineProperties(prototype, memMethods({
		_has: d(function (value) {
			var result = new ReadOnly(this.has(value));
			this.on('change', function () { result._setValue(this.has(value)); });
			return result;
		})
	}));
});
