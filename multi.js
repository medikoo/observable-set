'use strict';

module.exports = require('./_create-multi')(
	require('./create-read-only')(require('./')),
	require('es6-map')
);
