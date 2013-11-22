'use strict';

var isMultiSet = require('./is-observable-multi-set');

module.exports = function (value) {
	if (isMultiSet(value)) return value;
	throw new TypeError(value + " is not an observable multi set");
};
