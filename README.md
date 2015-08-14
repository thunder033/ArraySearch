# ArraySearch
JavaScript utility that allows for robust deep searching of arrays of complex objects. Includes the ability to search by any number of properties within an object, or to find objects based on elements contained in within an array of that object.

See my blog post http://blog.thunderlab.net/arraysearch-and-natural-language-functions
for an explanation of how it works and some of the reasoning in my development.

# Usage

[![NPM](https://nodei.co/npm/arraysearch.png)](https://npmjs.org/package/arraysearch)

In node.js, require ArraySearch:

`var find = require('arraysearch').Finder`

This module can be used outside of node, simply common out the "module.exports" at the end of the file and initialize the finder:

`var find = Finder();`

Calling the array finder

`result = find.[one|all].in(array).with(predicate)`

accepts a predicate to compare against objects in the array

`result = find.[one|all].in(array).having(searchPath).with(predicate)`

accepts a predicate and a the target path of an array within the object to search in

Return Type:
 - `one`: returns the first object found meeting the search predicate
 - `all`: returns an array of all objectrs found meeting the search predicate
 
If no objects meeting the predicate are found, either `undefined` or an empty array will be returned, depending on the return type.

Parameters:
 - `array`: an array or map of objects (with a similiar structure)
 - `predicate`: properties to search for within each object, should be an object (see examples below)
 - `searchPath`: an object indicating the location of any array within each object (see examples below)

With v1.1, a map of object can be provided. Searching for a single result will return a single object, while searching for all will return a map of results. This will temporarily modify each object in the map to preserve its key.

# Examples:

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
