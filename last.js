'use strict';

var d                  = require('d')
  , lazy               = require('d/lazy')
  , memoize            = require('memoizee/plain')
  , getLast           = require('es6-set/ext/get-last')
  , ReadOnly           = require('observable-value/create-read-only')(require('observable-value'))
  , validObservableSet = require('./valid-observable-set')

  , defineProperties = Object.defineProperties;

module.exports = memoize(function (prototype) {
	validObservableSet(prototype);

	return defineProperties(prototype, lazy({
		_last: d(function () {
			var result = new ReadOnly(getLast.call(this));
			this.on('change', function () { result._setValue(getLast.call(this)); });
			return result;
		})
	}));
}, { normalizer: require('memoizee/normalizers/get-1')() });
