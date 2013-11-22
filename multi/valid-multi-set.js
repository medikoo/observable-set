'use strict';

var isMultiSet = require('./is-multi-set');

module.exports = function (value) {
	if (isMultiSet(value)) return value;
	throw new TypeError(value + " is not an observable multi set");
};
