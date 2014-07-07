'use strict';

var d                  = require('d')
  , lazy               = require('d/lazy')
  , memoize            = require('memoizee/plain')
  , getFirst           = require('es6-set/ext/get-first')
  , ReadOnly           = require('observable-value/create-read-only')(require('observable-value'))
  , validObservableSet = require('./valid-observable-set')

  , defineProperties = Object.defineProperties;

module.exports = memoize(function (prototype) {
	validObservableSet(prototype);

	return defineProperties(prototype, lazy({
		_first: d(function () {
			var result = new ReadOnly(getFirst.call(this));
			this.on('change', function () { result._setValue(getFirst.call(this)); });
			return result;
		})
	}));
}, { normalizer: require('memoizee/normalizers/get-1')() });
