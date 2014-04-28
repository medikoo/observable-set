'use strict';

var d                  = require('d')
  , lazy               = require('d/lazy')
  , memoize            = require('memoizee/plain')
  , ReadOnly           = require('observable-value/create-read-only')(require('observable-value'))
  , validObservableSet = require('./valid-observable-set')

  , defineProperties = Object.defineProperties;

module.exports = memoize(function (prototype) {
	validObservableSet(prototype);

	return defineProperties(prototype, lazy({
		_size: d(function () {
			var current = this.size, result = new ReadOnly(current);
			this.on('change', function () { result._setValue(this.size); });
			return result;
		})
	}));
}, { normalizer: require('memoizee/normalizers/get-1')() });
