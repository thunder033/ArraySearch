# ArraySearch
Utility that allows for robust searching of object arrays

Usage examples:

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

`find...with`
accepts a predicate to compare against objects in the array

`find...having...with`
accepts a predicate and a the target path of an array within the object to search in
