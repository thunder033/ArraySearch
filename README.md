# ArraySearch
------------
JavaScript utility that allows for robust deep searching of arrays of complex objects. Includes the ability to search by any number of properties within an object, or to find objects based on elements contained in within an array of that object.

See my blog post http://blog.thunderlab.net/arraysearch-and-natural-language-functions
for an explanation of how it works and some of the reasoning in my development.

# Installation

`npm install arraysearch` [![NPM](https://img.shields.io/npm/v/arraysearch.svg)](https://npmjs.org/package/arraysearch)

`bower install ArraySearch` [![Bower](https://img.shields.io/bower/v/ArraySearch.svg)](https://www.versioneye.com/javascript/thunder033:arraysearch/)

In node.js, require ArraySearch:

`var find = require('arraysearch').Finder`

To use a bower component or just in the browser, simply include the script and initialize the finder:

`var find = new Finder();`

# Usage

Calling the finder:

`result = find.[one|all].in(collection).with(filter)`

accepts a filter to compare against objects in the collection (either a array or a map)

`result = find.[one|all].in(collection).having(searchPath).with(filter)`

accepts a filter and a the target path of a array within the object to search in

Return Type:
 - `one`: returns the first object found meeting the search filter
 - `all`: returns an array or map (depends on original collection) of all objects found meeting the search filter
 
If no objects meeting the filter are found, either `undefined` or an empty collection will be returned, depending on the return type.

Parameters:
 - `collection`: an array or map of objects (with a similar structure)
 - `filter`: properties to search for within each object, should be an object (see examples below)
 - `searchPath`: an object indicating the location of any array within each object (see examples below)

With v1.1, a map of objects can be provided. Searching for a single result will return a single object, while searching for all will return a map of results.

# Examples

```javascript
var find = Finder(),
people = [
	{name: 'Joe', age: 21, hair: 'brown'},
	{name: 'Larry', age: 22},
	{name: 'Bob', age: 18, gender: 'M'}
],
buildings = [
	{
		id: 59,
		stories: 2,
		roof: {
			color: 'black',
			material: 'clay'
		},
		exitSigns : [
			{id: 0, floor: 1},
			{id: 1, floor: 1}
		]
	},
	{
		id: 62,
		stories: 3,
		address: '123 Main St',
		roof: {
			color: 'red',
			material: 'clay'
		},
		exitSigns : [
			{id: 0, floor: 1, color: 'red'},
			{id: 1, floor: 1},
			{id: 2, floor: 2}
		]
	}
]

//basic properties search
//Returns {name: 'Larry', age: 22}
find.one.in(people).with({name: 'Larry'})
//Returns [{name: 'Bob', age: 18, gender: 'M'}]
find.all.in(people).with({age: 18})

//nested properties search
//Returns {id: 62, ...}
find.one.in(buildings).with({roof: {color: 'red'}, stories: 3})

//nested array search
//Returns [{id: 59, ...}, {id: 62, ...}]
find.all.in(buildings).having('exitSigns').with({floor: 1})
find.all.in(buildings).having(['exitSigns']).with({floor: 1})
find.all.in(buildings).having({exitSigns: []}).with({floor: 1})

//keys search
//returns [{name: 'Bob', age: 18, gender: 'M'}]
find.all.in(people).with.keys('gender')
find.all.in(people).with.keys(['age','gender'])
//returns [{name: 'Joe',...},{name: 'Bob',...}]
find.all.in(people).with.any.keys(['hair','gender'])

//nested keys search
//returns [{id: 62, ...}]
find.all.in(buildings).having('exitSigns').with.keys('color')
//returns {id: 59, ...}
find.one.in(buildings).having('exitSigns').with.any.keys(['color','floor'])
```

# Future features
 - the ability to search for for objects using relational operators (`>`,`<`,...):

	`find.[all|one].in(array).having(searchPath).[above|below|at[least|most]](number)`
 - extend/replace array `find` prototype method (maybe)
