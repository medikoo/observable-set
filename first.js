'use strict';

var d                  = require('d')
  , lazy               = require('d/lazy')
  , memoize            = require('memoizee/lib/regular')
  , ReadOnly           = require('observable-value/create-read-only')(
	require('observable-value/value')
)
  , validObservableSet = require('./valid-observable-set')

  , defineProperties = Object.defineProperties
  , stopError = new Error('Stop propagation'), getFirst;

getFirst = function (set) {
	var result;
	try {
		set.forEach(function (item) {
			result = item;
			throw stopError;
		});
	} catch (e) {
		if (e !== stopError) throw e;
	}
	return result;
};

module.exports = memoize(function (prototype) {
	validObservableSet(prototype);

	return defineProperties(prototype, lazy({
		_first: d(function () {
			var result = new ReadOnly(getFirst(this));
			this.on('change', function () { result._setValue(getFirst(this)); });
			return result;
		})
	}));
});
