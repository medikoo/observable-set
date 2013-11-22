'use strict';

var ee              = require('event-emitter/lib/core')
  , ObservableValue = require('observable-value/value')
  , Set             = require('es6-set')
  , ObservableSet   = require('../create')(Set)
  , MultiSet        = require('../multi');

module.exports = function (t, a) {
	var x = {}, set;
	a.throws(function () { t(); }, TypeError, "Undefined");
	a.throws(function () { t(null); }, TypeError, "Null");
	a.throws(function () { t('raz'); }, TypeError, "String");
	a.throws(function () { t({}); }, TypeError, "Object");
	a.throws(function () { t(new ObservableValue()); }, TypeError,
		"Observable value");
	a.throws(function () { t(ee({})); }, TypeError, "Event emitter");
	a.throws(function () { t([]); }, TypeError, "Array");
	a.throws(function () { t(function () {}); }, TypeError, "Function");
	a.throws(function () { t(ee(x)); }, TypeError, "Emitter");
	a.throws(function () { t(new Set()); }, TypeError, "Set");
	a.throws(function () { t(new ObservableSet()); }, TypeError,
		"Observable Set");
	set = new MultiSet();
	a(t(set), set, "Multi Set");
};
