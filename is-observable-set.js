'use strict';

var isObservable = require('observable-value/is-observable')
  , isSet        = require('es6-set/is-set');

module.exports = function (value) {
	return (isSet(value) && isObservable(value));
};
