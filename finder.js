'use strict';
/**
 * Created by Greg Rozmarynowycz 6/15/2015
 */

/**
 * Finds objects in a array with given properties
 * @returns {Finder}
 * @constructor
 */
var Finder = function(){
	/* jshint validthis:true */
	//Determine necessary features exist
	if(!Array.prototype.some || !Array.prototype.every || !Array.prototype.forEach) {
		throw new Error('Array prototype does not contain necessary "some","every", and "forEach" functions');
	}
	
	this.one = null;
	this.all = null;

	//create basic search context
	var context = {
		array: [],
		returnMany: null,
		map: false
	};
	
	/* Construct the finder function */

	//find.[all|one].in(array)
	//sets wether we should return any array or a single object
	function setReturnType(many){
		return function(){
			context.returnMany = many;
			return {'in': arraySetter};
		}
	}
	
	//find.[all|one]
	Object.defineProperty(this, 'one', {get: setReturnType(false)});
	Object.defineProperty(this, 'all', {get: setReturnType(true)});

	function convertToArray(map){
		return Object.keys(map).map(function(key){
			var obj =  map[key];
			Object.defineProperty(obj, '__arrSearchObjKey', {
				value: key,
				configurable: true
			});
			return obj;
		});
	}

	//find.[all|one].in(array).with(predicate)
	//registers the array in the finder
	function arraySetter(array) {
		if(!(array && array.constructor === Array)) {

			if(array && typeof(array) === 'object'){
				context.map = true;
				array = convertToArray(array);
			}
			else {
				throw new TypeError('Search context is not an array or object map');
			}
		}
		context.array = array;
		return  {with: attachKeysSearch(findWith.bind(context)), having: setSearchPath};
	}
	
	//find.[all|one].in(array).with.keys(keys)
	//find.[all|one].in(array).with.any.keys(keys)
	function attachKeysSearch(func){
		func.keys = findWithKeys.bind(context, false);
		Object.defineProperty(func, 'any', {
			get: function(){
				return {keys: findWithKeys.bind(context, true)};
			}
		});
		return func;
	}
	
	//find.[all|one].in(array).having(searchPath).with(predicate)
	//curries the search path for findHaving
	function setSearchPath(searchPath) {
		searchPath = resolveToSearchPath(searchPath);
		return {with: attachHavingKeysSearch(findHaving.bind(context, searchPath, findWith), searchPath)};
	}

	function findWithAnyKeys(hasAny){
		return function(keys){
			return findWithKeys.call(this, hasAny, keys);
		}
	}

	//find.[all|one].in(array).having(searchPath).with.keys(keys)
	//find.[all|one].in(array).having(searchPath).with.any.keys(keys)
	function attachHavingKeysSearch(func, searchPath){
		func.keys = findHaving.bind(context, searchPath, findWithAnyKeys(false));
		Object.defineProperty(func, 'any', {
			get: function(){
				return {keys: findHaving.bind(context, searchPath, findWithAnyKeys(true))};
			}
		});
		return func;
	}
	
	/* Finder functions */
	
	//creates a predicate from property and value
	function createPredicate(prop, value){
		var predicate = {};
		predicate[prop] = value;
		return predicate;
	}

	function buildResult(results){

		if(this.map){
			var resultOjb = {};

			if(!this.returnMany){
				var result = results.shift();
				delete result.__arrSearchObjKey;
				return result;
			}

			results.map(function(result){
				var key = result.__arrSearchObjKey;
				delete result.__arrSearchObjKey;
				resultOjb[key] = result;
			});

			return resultOjb;
		}
		else {
			return (this.returnMany) ? results : results[0];
		}

	}

	//filters the array by the predicate
	function findWith(predicate) {
		var result = [],
			pool = this.array;
		for(var prop in predicate){
			result = [];
			if(predicate.hasOwnProperty(prop)){
				pool.forEach(function search(elem){
					if(deepCompare(elem, createPredicate(prop, predicate[prop]))){
						result.push(elem);
					}
				});
			}
			pool = result.slice();
		}	
		return buildResult.call(this, result);
	}

	//find.[all|one].in(array).with.keys(keys)
	//searches an object for the given keys, returning true or false
	function findWithKeys(hasAny, keys){
		if(typeof(keys) === 'string') keys = [keys];
		if(!(keys && keys.constructor === Array)) {
			throw new TypeError(JSON.stringify(keys) + ' is not array');
		}
		var result = [];
		this.array.forEach(function(elem){
			var searchFunc = (hasAny === true) ? 'some' : 'every';
			if(keys[searchFunc](elem.hasOwnProperty, elem)){
				result.push(elem);
			}
		});
		return buildResult.call(this, result);
	}
	
	
	//Allows the object search path to be defined in variety of ways
	function resolveToSearchPath(value){
		if(value.constructor === Array) return value;
		
		if(typeof(value) === 'string') {
			return value.split(/[\.\>]/);
		}
		else if(typeof(value) === 'object' || value !== null) {
			var key, keys = [], targetPath = value;
			do {
				key = Object.keys(targetPath)[0];
				keys.push(key);
				targetPath = targetPath[key];
			}
			while(targetPath[key]);
			return keys;
		}
		throw new Error(JSON.stringify(value) + ' is not a valid search path');
	}
	
	//filters the array based on  a given array property contains elements that match the predicate
	//example search path: {leve1 : {level2: {level3: []}}}
	function findHaving(searchPath, searchFunc, predicate) {
		var result = [];
		this.array.forEach(function searchIn(elem){
			var targetArray = elem;
			searchPath.forEach(function navigateObject(key){
				targetArray = targetArray[key];
			});
			if(searchFunc.call({array: targetArray, returnMany: true}, predicate).length > 0) {
				result.push(elem);
			}
		});
		return buildResult.call(this, result);
	}

	//Recursively determines if the predicate exists in the given object
	function deepCompare(elem, predicate){
		var key = Object.keys(predicate)[0],
			value = predicate[key];

		if(!key) { throw new Error("Invalid filter: " + JSON.stringify(predicate)); }
		if(Boolean(elem) !== Boolean(predicate)) {return false; } //prevents property checking on null values
		if(elem[key] === value) return true;
		if(JSON.stringify(elem[key]) === JSON.stringify(value)) return true;

		if(typeof(value) === 'object'  && value !== null) {
			var contains = true;
			for(var valueKey in value){
				//if any of the comparisons return false, "contains" will be false
				contains &= deepCompare(elem[key], createPredicate(valueKey, value[valueKey]));
			}
			//convert to boolean
			return !!contains;	
		}
		return false;
	}

	return this;
};

if(typeof(module) !== 'undefined'){
	module.exports = {Finder: new Finder()};
}
