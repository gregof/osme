var async = require('async.js')
var relationManager = require('./relation.js');
var wayManager = require('./way.js');
var simplification = require('./simplification');

exports.rel = function (relationIDs, epsilon) {
    loadRelations(relationIDs, function (regions) {
        loadWays(getWays(regions), epsilon, function (ways) {
            // console.log(JSON.stringify(regions, null, '    '));
            // console.log('//////////////////////////////////////////////////////////////')
            console.log(
                'var res=' +
                JSON.stringify(
                    {
                        regions: regions,
                        ways: ways
                    }, 
                    null,
                    '    '
                )
            );
        });        
    })    
}

exports.subrel = function (parentID, adminLevel, epsilon) {}

function loadRelations (relationIDs, callback) {
    var regions = [];
    async.forEach(
        relationIDs,
        function (id, callback) {
            relationManager.loadByID(
                id, 
                function (region) {
                    regions.push(region);
                    callback();
                },
                callback
            );
        },
        function () {
            callback(regions);
        }
    );
}

function getWays (regions) {
    var ways = {};
    regions.forEach(function (region) {
        region.outer.forEach(function (wayID) {
            ways[wayID] = true;
        })
        region.inner.forEach(function (wayID) {
            ways[wayID] = true;
        })
    });
    return Object.keys(ways);    
}

function loadWays (wayIDs, epsilon, callback) {
    var ways = {};
    async.forEach(
        wayIDs,
        function (id, callback) {
            wayManager.loadByID(
                id,
                epsilon,
                function (way) {
                    ways[id] = way;
                    callback();
                },
                callback
            );
        },
        function () {
            callback(ways);
        }
    );
}