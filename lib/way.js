var cachedHttp = require('cachedHttp.js');
var xml = require('./xml.js');
var tagsToFields = require('./tagsToFields.js');
var async = require('async.js');

exports.load = function (memberObject, callback) {
    //console.log('member.load')
    var way = {
        id: memberObject['@'].ref,
        type: memberObject['@'].type,
        nodes: []
    }
    // curl --globoff "http://overpass-api.de/api/interpreter?data=(way(6174257);>);out;"
    cachedHttp.load('overpass-api.de', '/api/interpreter?data=(way(' + memberObject['@'].ref + ');>);out;', function (xmlText) {
        if (xmlText.indexOf('<osm version="0.6"') !== -1) {
            xml.toJSON(xmlText, function (memberJSON) {

                tagsToFields(memberJSON.way, way);

                var loadedNodes = {};
                memberJSON.node.forEach(function (nodeJSON) {
                    loadedNodes[nodeJSON['@'].id] = [Number(nodeJSON['@'].lat), Number(nodeJSON['@'].lon)];
                });

                memberJSON.way.nd.forEach(function (nd) {
                    way.nodes.push(loadedNodes[nd['@'].ref]);
                });


                callback(way);
            })
            return true;
        } else {
            console.log('wrong data for way@' + memberObject['@'].ref);
            return false;
        }
    }, 'way');
}