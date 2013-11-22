'use strict';

var ee              = require('event-emitter/lib/core')
  , ObservableValue = require('observable-value/value')
  , Set             = require('es6-set')
  , ObservableSet   = require('../create')(Set)
  , MultiSet        = require('../multi');

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
	a(t(new Set()), false, "Set");
	a(t(new ObservableSet()), false, "Observable Set");
	a(t(new MultiSet()), true, "Multi Set");
};
