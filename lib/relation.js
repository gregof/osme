var async = require('async.js');
var tagsToFields = require('./tagsToFields.js');

exports.load = function (relationObject, waysDictionary, callback) {
    //console.log('relation.load')
    var region = {
        id: relationObject['@'].id,
        outer: [],
        inner: []
    }
    tagsToFields(relationObject, region);

    async.forEach(
        relationObject.member,
        function (memberJSON, callback) {
            if (memberJSON['@'].type === 'way') {
                if (memberJSON['@'].role === 'outer') {
                    region.outer.push(memberJSON['@'].ref);
                } else if (memberJSON['@'].role === 'inner') {
                    region.inner.push(memberJSON['@'].ref);
                }
                waysDictionary[memberJSON['@'].ref] = memberJSON;
            }

            callback()    
        },
        function () {
            callback(region);
        }
    );
}