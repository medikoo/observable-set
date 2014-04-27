'use strict';

var d                 = require('d')
  , memoize           = require('memoizee/plain')
  , memoizeMethods    = require('memoizee/methods-plain')
  , getNormalizer     = require('memoizee/normalizers/get-1')
  , ReadOnly          = require('observable-value/create-read-only')(
	require('observable-value/value')
)
  , validObservableSet = require('./valid-observable-set')

  , defineProperties = Object.defineProperties;

module.exports = memoize(function (prototype) {
	validObservableSet(prototype);

	return defineProperties(prototype, memoizeMethods({
		_has: d(function (value) {
			var result = new ReadOnly(this.has(value));
			this.on('change', function () { result._setValue(this.has(value)); });
			return result;
		}, { getNormalizer: getNormalizer })
	}));
}, { normalizer: getNormalizer() });
