var cachedHttp = require('cachedHttp.js');
var async = require('async.js')
var xml = require('./xml.js');
var relation = require('./relation.js');
var way = require('./way.js');
var simplification = require('./simplification');

exports.export = function (countryCode, adminLevel, epsilon) {
    cachedHttp.load(
        'www.overpass-api.de',
        '/api/xapi?relation[admin_level=' + adminLevel + '][addr:country=' + countryCode + ']',
        function (xmlText) {
            if (xmlText.indexOf('<osm version="0.6"') !== -1) {
                xml.toJSON(xmlText, function (xmlJSON) {
                    createRegions(xmlJSON, epsilon, function (regions) {
                        console.log('var res =' + JSON.stringify(regions, null, '  ') + ';');
                        //console.log('done');
                    });
                })
                return true;
            } else {
                return false;
            }
        }
    );
}

function createRegions (osm, epsilon, callback) {
    //console.log('createRegions')
    var regions = [];
    var waysDictionary = {};    
    
    async.forEach(
        osm.relation,
        function (relationJSON, callback) {
            relation.load(relationJSON, waysDictionary, function (region) {
                regions.push(region);
                callback();    
            })            
        },
        function () {
            
            var loadedWays = {}

            async.forEach(
                Object.keys(waysDictionary),
                function (wayID, callback) {
                    way.load(waysDictionary[wayID], function (wayObj) {
                        wayObj.nodes = simplification.simplificate(wayObj.nodes, epsilon);
                        loadedWays[wayID] = wayObj;
                        callback();
                    });
                },
                function () {
                    callback({
                        regions: regions,
                        ways: loadedWays
                    });
                }
            );
        }
    );
}