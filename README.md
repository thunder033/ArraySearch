# ArraySearch
Utility that allows for robust searching of object arrays

Usage examples:

```
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
find.one.in(people).by({name: 'Larry'});
//Returns [{name: 'Larry', age: 22}]
find.all.in(people).by({age: 18});
//Returns {id: 62, ...}
find.one.in(buildings).by({roof: {color: 'red'}, stories: 3});
//Returns [{id: 59, ...}, {id: 62, ...}]
find.all.in(buildings).with({floor: 1}, {exitSigns: []});
```
