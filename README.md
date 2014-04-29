# observable-set

## Configure observable set collections

### Based on native ECMAScript6 Set

### Installation

	$ npm install observable-set

To port it to Browser or any other (non CJS) environment, use your favorite CJS bundler. No favorite yet? Try: [Browserify](http://browserify.org/), [Webmake](https://github.com/medikoo/modules-webmake) or [Webpack](http://webpack.github.io/)

### Usage

```javascript
var ObservableSet = require('observable-set');

var set = new ObservableSet(['raz', 'dwa']);

set.on('change', function (event) {
  if (event.type === 'add') console.log("Added:", event.value);
  else if (event.type === 'delete') console.log(Deleted:", event.value);
  else if (event.type === 'clear') console.log("Set cleared");
});

set.add('trzy');   // Added: trzy
set.add('raz');    // (ignored)
set.delete('raz'); // Deleted: raz
set.delete('raz'); // (ignored)
set.clear();       // Set cleared
set.clear();       // (ignored)

// Observable filters:
set = ObservableSet([1, 2, 3, 4, 5, 6]);
var filtered = set.filter(function (num) { return num % 2; }); // { 1, 3, 5 }

filtered.on('change', function (event) {
  if (event.type === 'add') console.log("Added:", event.value);
  else if (event.type === 'delete') console.log(Deleted:", event.value);
  else if (event.type === 'clear') console.log("Set cleared");
});

set.add(7);    // Added: 7
set.add(8);    // (ignored)
set.delete(3); // Deleted: 3
set.delete(2); // (ignored)
set.clear();   // Set cleared

// Observable maps:
set = ObservableSet([1, 2, 3, 4, 5, 6]);
var mapped = set.map(function (num) { return num * 2; }); // { 4, 6, 8, 10, 12 }

mapped.on('change', function (event) {
  if (event.type === 'add') console.log("Added:", event.value);
  else if (event.type === 'delete') console.log(Deleted:", event.value);
  else if (event.type === 'clear') console.log("Set cleared");
});

set.add(7);    // Added: 14
set.delete(3); // Deleted: 6
set.clear();   // Set cleared

// Observable intersections:
var set1 = ObservableSet(['raz', 'dwa']);
var set2 = ObservableSet(['dwa', 'trzy']);
var intersection = set1.and(set2); // {'dwa' }

intersection.on('change', function (event) {
  if (event.type === 'add') console.log("Added:", event.value);
  else if (event.type === 'delete') console.log(Deleted:", event.value);
  else if (event.type === 'clear') console.log("Set cleared");
});

set1.add('cztery'); // (ignored)
set1.add('trzy'); // Added: trzy

set2.delete('trzy'); // Deleted: trzy
set1.clear(); // Set cleared

// Observable unions:
set1 = ObservableSet(['raz', 'dwa']);
set2 = ObservableSet(['dwa', 'trzy']);
var union = set1.or(set2); // { 'raz', 'dwa', 'trzy' }

union.on('change', function (event) {
  if (event.type === 'add') console.log("Added:", event.value);
  else if (event.type === 'delete') console.log(Deleted:", event.value);
  else if (event.type === 'clear') console.log("Set cleared");
});

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

complement.on('change', function (event) {
  if (event.type === 'add') console.log("Added:", event.value);
  else if (event.type === 'delete') console.log(Deleted:", event.value);
  else if (event.type === 'clear') console.log("Set cleared");
});

set1.add('cztery'); // Added: cztery
set1.add('trzy');   // (ignored)

set2.delete('trzy'); // Added: trzy
set1.clear(); // Set cleared
```

## Tests [![Build Status](https://travis-ci.org/medikoo/observable-set.png)](https://travis-ci.org/medikoo/observable-set)

	$ npm test
