'use strict';
/**
 * Created by Greg Rozmarynowycz 6/15/2015
 * @description ArraySearch lib
 */

/**
 * Finds objects in a array with given properties
 * @returns {Finder}
 * @constructor
 */
var Finder = function Finder(){
	/* jshint validthis:true */
	//Determine necessary features exist
	if(!Array.prototype.some || !Array.prototype.every || !Array.prototype.forEach) {
		throw new Error('Array prototype does not contain necessary "some","every", and "forEach" functions');
	}

	/**
	 * Return one result
	 * @type {{in: arraySetter}}
	 */
	this.one = null;
	/**
	 * Return all results
	 * @type {object}
	 * @returns {{in: arraySetter}}
	 */
	this.all = null;

	//create basic search context
	var context = {
		array: [],
		returnMany: null,
		map: false
	};
	
	/* Construct the finder function */

	//find.[all|one].in(array)
	//sets whether we should return any array or a single object
	function setReturnType(many){
		return function(){
			context.returnMany = many;
			return {'in': arraySetter};
		};
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
	/**
	 * registers the array in the finder
	 * @name arraySetter
	 * @param {object} collection
	 * @returns {{with: findWith, having: setSearchPath}}
	 */
	function arraySetter(collection) {
		if(!(collection && collection.constructor === Array)) {

			if(collection && typeof(collection) === 'object'){
				context.map = true;
				collection = convertToArray(collection);
			}
			else {
				throw new TypeError('Search context is not an array or object map');
			}
		}
		context.array = collection;
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
	/**
	 * sets search path for nested search
	 * @name setSearchPath
	 * @param searchPath
	 * @returns {{with: findHaving}}
	 */
	function setSearchPath(searchPath) {
		searchPath = resolveToSearchPath(searchPath);
		return {with: attachHavingKeysSearch(findHaving.bind(context, searchPath, findWith), searchPath)};
	}

	function findWithAnyKeys(hasAny){
		return function(keys){
			return findWithKeys.call(this, hasAny, keys);
		};
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
				if(!results){
					return results;
				}

				var result = results.shift();
				if(result && result.hasOwnProperty('__arrSearchObjKey')){
					delete result.__arrSearchObjKey;
				}
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

	/**
	 * filters the array by the predicate
	 * @name findWith
	 * @param {object} filter
	 * @returns {*}
	 */
	function findWith(filter) {
		var result = [],
			pool = this.array;
		for(var prop in filter){
			result = [];
			if(filter.hasOwnProperty(prop)){
				pool.forEach(function search(elem){
					if(deepPartialCompare(elem, createPredicate(prop, filter[prop]))){
						result.push(elem);
					}
				});
			}
			pool = result.slice();
		}	
		return buildResult.call(this, result);
	}

	//find.[all|one].in(array).with.keys(keys)
	/**
	 * searches an object for the given keys, returning true or false
	 * @param hasAny
	 * @param keys
	 * @returns {*}
	 */
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

			var havingContext = {array: targetArray, returnMany: true};
			if(searchFunc.call(havingContext, predicate).length > 0) {
				result.push(elem);
			}
		});

		return buildResult.call(this, result);
	}

	/**
	 * Recursively determines if the predicate exists in the given object
	 * @param {object} entity Object to search in
	 * @param {object} partial Object with similar structure to entity
	 * @returns {boolean} If the partial is contained in the entity
	 */
	function deepPartialCompare(entity, partial){
		var key = Object.keys(partial)[0],
			value = partial[key];

		if(!key) { throw new Error("Invalid filter: " + JSON.stringify(partial)); }
		if(Boolean(entity) !== Boolean(partial)) {return false; } //prevents property checking on null values
		if(entity[key] === value) return true;
		if(JSON.stringify(entity[key]) === JSON.stringify(value)) return true;

		if(typeof(value) === 'object'  && value !== null) {
			var contains = true;
			for(var valueKey in value){
				//if any of the comparisons return false, "contains" will be false
				contains &= deepPartialCompare(entity[key], createPredicate(valueKey, value[valueKey]));
			}
			//convert to boolean
			return !!contains;	
		}
		return false;
	}

	return this;
};

if(typeof(module) !== 'undefined'){
	/**
	 * Returns an array finder instance
	 * @type {{Finder: Finder}}
	 */
	module.exports = {Finder: new Finder()};
}
