'use strict';

var isObservable = require('./is-observable-set');

module.exports = function (value) {
	if (isObservable(value)) return value;
	throw new TypeError(value + " is not an observable set");
};
