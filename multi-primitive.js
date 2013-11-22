'use strict';

module.exports = require('./_create-multi')(
	require('./create-read-only')(require('./primitive')),
	require('es6-map/primitive')
);
