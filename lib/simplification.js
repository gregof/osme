
exports.simplificate = function (geoPoints, epsilon) {
    var points = geoPoints.map(function (geoPoint, i) {
        var point = mercator.geoToMercator(geoPoint);
        point.index = i;
        return point;
    });

    //console.log(geoPoints);

    var simplifyPoints = DouglasPeucker(points, epsilon);
    var res = [];
    simplifyPoints.forEach(function (simplifyPoint) {
        res.push(geoPoints[simplifyPoint.index]);
    })

    //console.log('...........................');
    //console.log(res);
    return res;
}

function DouglasPeucker (points, epsilon) {
    var maxDistance = 0;
    var index = 0;
    var end = points.length - 1;

    for (var i = 1, distance; i < end; i++) {
        distance = perpendicularDistance(points[i], points[0], points[end]);
        //console.log(distance);
        if (distance > maxDistance) {
            maxDistance = distance;
            index = i;
        }
    }

    if (maxDistance > epsilon) {
        var arr1 = DouglasPeucker(points.slice(0, index + 1), epsilon);
        var arr2 = DouglasPeucker(points.slice(index), epsilon);
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

var mercator = new (function (options) {
    var radius = options && options.radius || 6378137,
        e = options && typeof options.e  != "undefined" ? options.e : 0.0818191908426,
    // Четные степени эксцентриситета
        e2 = e * e, e4 = e2 * e2, e6 = e4 * e2, e8 = e4 * e4,
        subradius = 1 / radius,
    // Предвычисленные коэффициенты для быстрого обратного преобразования Меркатора
    // Подробнее см. тут: http://mercator.myzen.co.uk/mercator.pdf формула 6.52
    // Работает только при небольших значения эксцентриситета!
        d2 = e2 / 2 + 5 * e4 / 24 + e6 / 12 + 13 * e8 / 360,
        d4 = 7 * e4 / 48 + 29 * e6 / 240 + 811 * e8 / 11520,
        d6 = 7 * e6 / 120 + 81 * e8 / 1120,
        d8 = 4279 * e8 / 161280,

        c_pi180 = Math.PI / 180,
        c_180pi = 180 / Math.PI;

    this.geoToMercator = function (geo) {
        return [
            this.longitudeToX(geo[1]),
            this.latitudeToY(geo[0])
        ];
    };

    this.longitudeToX = function (lng) {
        var longitude = cycleRestrict(lng * c_pi180, -Math.PI, Math.PI);
        return radius * longitude;
    }
    
    this.latitudeToY = function (lat) {
        var latitude = boundaryRestrict(lat, -90, 90) * c_pi180,
            epsilon = 1e-10,
            esinLat = e * Math.sin(latitude);

        // Для широты -90 получается 0, и в результате по широте выходит -Infinity
        var tan_temp = Math.tan(Math.PI * 0.25 + latitude * 0.5) || epsilon,
            pow_temp = Math.pow( Math.tan(Math.PI * 0.25+ Math.asin(esinLat) * 0.5), e),
            U = tan_temp / pow_temp;

        return radius * Math.log(U);
    };
});

function boundaryRestrict(value, min, max) {
    return Math.max(Math.min(value, max), min);
};

function cycleRestrict (value, min, max) {
    if (value == Number.POSITIVE_INFINITY) {
        return max;
    } else if (value == Number.NEGATIVE_INFINITY) {
        return min;
    }
    return value - Math.floor((value - min) / (max - min)) * (max - min);
}
