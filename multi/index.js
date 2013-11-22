'use strict';

module.exports = require('./_create')(
	require('../create-read-only')(require('../')),
	require('es6-map')
);
