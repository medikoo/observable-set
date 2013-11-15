'use strict';

var ee              = require('event-emitter/lib/core')
  , ObservableValue = require('observable-value/value')
  , ObservableSet   = require('../create')(require('es6-set'));

module.exports = function (t, a) {
	var x = {};
	a(t(), false, "Undefined");
	a(t(null), false, "Null");
	a(t('raz'), false, "String");
	a(t({}), false, "Object");
	a(t(new ObservableValue()), false, "Observable value");
	a(t(ee({})), false, "Event emitter");
	a(t([]), false, "Array");
	a(t(function () {}), false, "Function");
	a(t(ee(x)), false, "Emitter");
	a(t(new ObservableSet()), true, "Observable Set");
};
