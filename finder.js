var Finder = function(){
	this.one = null;
	this.all = null;

	var context = {
		array: [],
		returnMany: null
	};

	//sets wether we should return any array or a single object
	function setReturnType(many){
		context.returnMany = many;
		return {'in': arraySetter};
	}

	Object.defineProperty(this, 'one', {get: setReturnType.bind(null, false)});
	Object.defineProperty(this, 'all', {get: setReturnType.bind(null, true)});

	function createPredicate(prop, value){
		var predicate = new Object();
		predicate[prop] = value;
		return predicate;
	}

	//registers the array in the finder
	function arraySetter(array) {
		context.array = array;
		return {by: findBy.bind(context), with: findWith.bind(context)};
	}

	//filters the array by the predicate
	function findBy(predicate) {
		var result = [],
			pool = this.array;
		for(var prop in predicate){
			pool.forEach(function search(elem){
				if(deepCompare(elem, new createPredicate(prop, predicate[prop]))){
					result.push(elem);
				}
			});
			pool = result;
		}
		return (this.returnMany) ? result : result[0];
	}

	//filters the array based on  a given array property contains elements that match the predicate
	//example search path: {leve1 : {level2: {level3: []}}}
	function findWith(predicate, searchPath) {
		var key, keys = [], targetPath = searchPath;
		do {
			key = Object.keys(targetPath)[0];
			keys.push(key);
			targetPath = targetPath[key];
		}
		while(targetPath[key]);

		var result = [];
		this.array.forEach(function searchIn(elem){
			var targetArray = elem;
			keys.forEach(function navigateObject(key){
				targetArray = targetArray[key];
			});
			if(findBy.call({array: targetArray, returnMany: true}, predicate).length > 0) {
				result.push(elem);
			}
		});
		return (this.returnMany) ? result : result[0];
	}

	//Recursively determines if the predicate exists in the given object
	function deepCompare(elem, predicate){
		var key = Object.keys(predicate)[0],
			value = predicate[key];

		if(!key) throw "Invalid predicate: " + JSON.stringify(predicate);

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
}
