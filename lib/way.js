var cachedHttp = require('cachedHttp.js');
var simplification = require('./simplification.js')

exports.loadByID = function (id, epsilon, callback, errorCallback) {    
    cachedHttp.load(
        'overpass-api.de', 
        '/api/interpreter?data=[out:json];(way(' + id + ');>);out;',
        function (responseText) {
            var responseJSON = JSON.parse(responseText);
            if (responseJSON.elements) {
                callback(createFromJSON(responseJSON, epsilon))
                return true;
            } else {
                console.log('wrong data for way@' + id);
                errorCallback();
                return false;
            }
        }, 
        'way'
    );
}

function createFromJSON (relationJSON, epsilon) {
    var way;
    var nodes = {};
    relationJSON.elements.forEach(function (element) {
        if (element.type === 'node') {
            nodes[element.id] = [element.lat, element.lon];
        } else if (element.type === 'way') {
            way = element;
        }
    });

    way.nodes.forEach(function (nodeID, index) {
        way.nodes[index] = nodes[nodeID];
    });

    if (epsilon) {
        way.nodes = simplification.simplify(way.nodes, epsilon);
    }

    return way;
}