# ArraySearch
JavaScript utility that allows for robust deep searching of arrays of complex objects. Includes the ability to search by any number of properties within an object, or to find objects based on elements contained in within an array of that object.

See my blog post http://blog.thunderlab.net/arraysearch-and-natural-language-functions
for an explanation of how it works and some of the reasoning in my development.

# Usage

Initialize the ArrayFinder:
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
 - `array`: an array of objects (with a similiar structure)
 - `predicate`: properties to search for within each object, should be an object (see examples below)
 - `searchPath`: an object indicating the location of any array within each object (see examples below)

# Examples:

```javascript
var find = Finder(),
	people = [
		{name: 'Joe', age: 21},
		{name: 'Larry', age: 22},
		{name: 'Bob', age: 18}
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
			roof: {
				color: 'red',
				material: 'clay'
			},
			exitSigns : [
				{id: 0, floor: 1},
				{id: 1, floor: 1},
				{id: 2, floor: 2}
			]
		}
	]

//Returns {name: 'Larry', age: 22}
find.one.in(people).with({name: 'Larry'});
//Returns [{name: 'Bob', age: 18}]
find.all.in(people).with({age: 18});
//Returns {id: 62, ...}
find.one.in(buildings).with({roof: {color: 'red'}, stories: 3});
//Returns [{id: 59, ...}, {id: 62, ...}]
find.all.in(buildings).having({exitSigns: []}).with({floor: 1});
```

# Future features
 - the ability to search for for objects using relational operators (`>`,`<`,...):

	`find.[all|one].in(array).having(searchPath).[above|below|at[least|most]](number)`
 - extend/replace array `find` prototype method (maybe)
