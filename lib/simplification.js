var mercator = require('./mercator.js');

exports.simplify = function (geoPoints, epsilon) {
    var points = geoPoints.map(function (geoPoint, i) {
        var point = mercator.geoToMercator(geoPoint);
        point.index = i;
        return point;
    });

    var simplifyPoints = simplifyByDouglasPeucker(points, epsilon);
    var res = [];
    simplifyPoints.forEach(function (simplifyPoint) {
        res.push(geoPoints[simplifyPoint.index]);
    })

    return res;
}

function simplifyByDouglasPeucker (points, epsilon) {
    var maxDistance = 0;
    var index = 0;
    var end = points.length - 1;

    for (var i = 1, distance; i < end; i++) {
        distance = perpendicularDistance(points[i], points[0], points[end]);
        if (distance > maxDistance) {
            maxDistance = distance;
            index = i;
        }
    }

    if (maxDistance > epsilon) {
        var arr1 = simplifyByDouglasPeucker(points.slice(0, index + 1), epsilon);
        var arr2 = simplifyByDouglasPeucker(points.slice(index), epsilon);
        return arr1.concat(arr2.slice(1));
    } else {
        return [points[0], points[end]];
    }

}

function perpendicularDistance (p1, p2, p3) {
    var a = distance(p2, p3);
    var b = distance(p2, p1);
    var c = distance(p1, p3);
    var p = (a + b + c) / 2;

    return 2 * Math.sqrt(p * (p - a) * (p - b) * (p - c)) / a;
}

function distance (p1, p2) {
    var diffX = p1[0] - p2[0],
        diffY = p1[1] - p2[1];
    return Math.sqrt(diffX * diffX + diffY * diffY);
}