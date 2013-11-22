'use strict';

var multiSetSymbol = require('./symbol');

module.exports = function (value) {
	return Boolean(value && value[multiSetSymbol]);
};
