'use strict';

module.exports = require('./and-or-not')(
	require('./filter-map')(require('./create')(require('es6-set')))
);
