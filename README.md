# observable-set

## Configure observable set collections

### Based on native ECMAScript6 Set

### Usage

```javascript
var ObservableSet = require('observable-set');

var set = new ObservableSet(['raz', 'dwa']);

set.on('add', function (value) { console.log("Added:", value); });
set.on('delete', function (value) { console.log("Deleted:", value); });
set.on('clear', function () { console.log("Set cleared"); });


set.add('trzy');   // Added: trzy
set.add('raz');    // (ignored)
set.delete('raz'); // Deleted: raz
set.delete('raz'); // (ignored)
set.clear();       // Set cleared
set.clear();       // (ignored)

// Observable filters:
set = ObservableSet([1, 2, 3, 4, 5, 6]);
var filtered = set.filter(function (num) { return num % 2; }); // { 1, 3, 5 }

filtered.on('add', function (value) { console.log("Added:", value); });
filtered.on('delete', function (value) { console.log("Deleted:", value); });
filtered.on('clear', function () { console.log("Set cleared"); });

set.add(7);    // Added: 7
set.add(8);    // (ignored)
set.delete(3); // Deleted: 3
set.delete(2); // (ignored)
set.clear();   // Set cleared

// Observable maps:
set = ObservableSet([1, 2, 3, 4, 5, 6]);
var mapped = set.map(function (num) { return num * 2; }); // { 4, 6, 8, 10, 12 }

mapped.on('add', function (value) { console.log("Added:", value); });
mapped.on('delete', function (value) { console.log("Deleted:", value); });
mapped.on('clear', function () { console.log("Set cleared"); });

set.add(7);    // Added: 14
set.delete(3); // Deleted: 6
set.clear();   // Set cleared

// Observable intersections:
var set1 = ObservableSet(['raz', 'dwa']);
var set2 = ObservableSet(['dwa', 'trzy']);
var intersection = set1.and(set2); // {'dwa' }

intersection.on('add', function (value) { console.log("Added:", value); });
intersection.on('delete', function (value) { console.log("Deleted:", value); });
intersection.on('clear', function () { console.log("Set cleared"); });

set1.add('cztery'); // (ignored)
set1.add('trzy'); // Added: trzy

set2.delete('trzy'); // Deleted: trzy
set1.clear(); // Set cleared

// Observable unions:
set1 = ObservableSet(['raz', 'dwa']);
set2 = ObservableSet(['dwa', 'trzy']);
var union = set1.or(set2); // { 'raz', 'dwa', 'trzy' }

union.on('add', function (value) { console.log("Added:", value); });
union.on('delete', function (value) { console.log("Deleted:", value); });
union.on('clear', function () { console.log("Set cleared"); });

set1.add('cztery'); // Added: cztery
set1.add('trzy'); // (ignored)
set2.add('pięć'); // Added: pięć

set2.delete('trzy'); // (ignored)
set1.delete('trzy'); // Deleted: trzy

set1.clear(); // Set cleared

// Observable complements
var set1 = ObservableSet(['raz', 'dwa']);
var set2 = ObservableSet(['dwa', 'trzy']);
var complement = set1.not(set2); // { 'raz' }

complement.on('add', function (value) { console.log("Added:", value); });
complement.on('delete', function (value) { console.log("Deleted:", value); });
complement.on('clear', function () { console.log("Set cleared"); });

set1.add('cztery'); // Added: cztery
set1.add('trzy');   // (ignored)

set2.delete('trzy'); // Added: trzy
set1.clear(); // Set cleared
```

### Installation
#### NPM

In your project path:

	$ npm install observable-set

##### Browser

You can easily bundle _observable-set_ for browser with [modules-webmake](https://github.com/medikoo/modules-webmake)

## Tests [![Build Status](https://travis-ci.org/medikoo/observable-set.png)](https://travis-ci.org/medikoo/observable-set)

	$ npm test
