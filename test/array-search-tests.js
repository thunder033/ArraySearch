/**
 * Created by Greg on 8/12/2015.
 */

var find = require('../finder.js').Finder,
    expect = require('chai').expect;

describe('Array Finder', function(){

    //example data
    var people = [
            {name: 'Joe', age: 21, hair: 'brown'},
            {name: 'Larry', age: 22},
            {name: 'Bob', age: 18, gender: 'M'},
            {name: 'Lisa', age: 18}
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
        ];

    //shortcuts to ID results
    var _people = {
            Joe: people[0],
            Larry: people[1],
            Bob: people[2],
            Lisa: people[3]
        },
        _buildings = {
            '59': buildings[0],
            '62': buildings[1]
        };


    it('finds one object in an array', function(){
        var predicate = {name: 'Larry'},
            expectedResult = _people.Larry;
            result = find.one.in(people).with(predicate);
        expect(result).to.deep.equal(expectedResult);
    });

    it('finds multiple objects in an array', function(){
        var predicate = {age: 18},
            expectedResult = [_people.Bob, _people.Lisa],
            result = find.all.in(people).with(predicate);
        expect(result).to.deep.equal(expectedResult);
    });

    it('deep searches objects', function(){
        var predicate = {roof: {color: 'red'}, stories: 3},
            expectedResult = _buildings['62'],
            result = find.one.in(buildings).with(predicate);
        expect(result).to.deep.equal(expectedResult);
    });

    it('deep searches by array', function(){
        var expectedResult = [_buildings['59'], _buildings['62']],
            result = find.all.in(buildings).having('exitSigns').with({floor: 1});
        expect(result).to.deep.equal(expectedResult);
    });

    it('searches by a contained key', function(){
        var expectedResult = _people.Bob,
            result = find.one.in(people).with.keys('gender');
        expect(result).to.deep.equal(expectedResult);
    });

    it('searches by multiple contained keys', function(){
        var expectedResult = _people.Joe,
            result = find.one.in(people).with.keys(['age', 'hair']);
        expect(result).to.deep.equal(expectedResult);
    });

    it('searches by any contained keys', function(){
        var expectedResult = [_people.Joe, _people.Bob],
            result = find.all.in(people).with.any.keys(['gender', 'hair']);
        expect(result).to.deep.equal(expectedResult);
    });

    it('searches by keys in nested object arrays', function(){
        var expectedResult = _buildings['62'],
            result = find.one.in(buildings).having('exitSigns').with.keys(['color']);
        expect(result).to.deep.equal(expectedResult);
    });

    it('throws an error if search context is not an object', function(){
        var badSearch = function(){
            return find.one.in('test').with({prop: 1});
            };
        expect(badSearch).to.throw(TypeError);
    });

    it('searches provided map and returns a single object', function(){
        var expectedResult = _people.Joe,
            result = find.one.in(_people).with({name: 'Joe'});
        expect(result).to.deep.equal(expectedResult);
    });

    it('searches for multiple results provided map and returns a map of results', function(){
        var expectedResult = {'Bob': _people.Bob, 'Lisa': _people.Lisa},
            result = find.all.in(_people).with({age: 18});
        expect(result).to.deep.equal(expectedResult);
    });

    it('doesn\'t leave key traces on returned objects', function(){
        var result = find.one.in(_people).with({name: 'Joe'});
        expect(result).to.not.have.keys('__arraySearchObjKey');
    })
});