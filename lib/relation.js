var cachedHttp = require('cachedHttp.js');

exports.loadByID = function (id, callback, errorCallback) {    
    cachedHttp.load(
        'overpass-api.de', 
        '/api/interpreter?data=[out:json];(relation(' + id + '););out;',
        function (responseText) {
            var responseJSON = JSON.parse(responseText);
            if (responseJSON.elements) {
                callback(exports.createFromJSON(responseJSON.elements[0]))
                return true;
            } else {
                console.log('wrong data for relation@' + id);
                errorCallback();
                return false;
            }
        }, 
        'relation'
    );
}

exports.createFromJSON = function (relationJSON) {
    var relation = {
        id: relationJSON.id,
        outer: [],
        inner: []
    };

    if (relationJSON.tags) {
        relation.tags = relationJSON.tags;
    }
    
    relationJSON.members.forEach(function (memberJSON) {
        if (memberJSON.type === 'way') {
            if (memberJSON.role === 'outer') {
                relation.outer.push(memberJSON.ref);
            } else if (memberJSON.role === 'inner') {
                relation.inner.push(memberJSON.ref);
            }
        }
    });

    return relation;
}