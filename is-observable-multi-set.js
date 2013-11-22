'use strict';

var multiSetSymbol = require('./symbol-multi-set');

module.exports = function (value) {
	return Boolean(value && value[multiSetSymbol]);
};
