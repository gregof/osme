var radius = 6378137,
    e = 0.0818191908426,
    c_pi180 = Math.PI / 180;

exports.geoToMercator = function (geo) {
    return [
        longitudeToX(geo[1]),
        latitudeToY(geo[0])
    ];
};

function longitudeToX (lng) {
    var longitude = cycleRestrict(lng * c_pi180, -Math.PI, Math.PI);
    return radius * longitude;
};

function latitudeToY (lat) {
    var latitude = boundaryRestrict(lat, -90, 90) * c_pi180,
        epsilon = 1e-10,
        esinLat = e * Math.sin(latitude);

    // Для широты -90 получается 0, и в результате по широте выходит -Infinity
    var tan_temp = Math.tan(Math.PI * 0.25 + latitude * 0.5) || epsilon,
        pow_temp = Math.pow( Math.tan(Math.PI * 0.25+ Math.asin(esinLat) * 0.5), e),
        U = tan_temp / pow_temp;

    return radius * Math.log(U);
};

function cycleRestrict (value, min, max) {
    if (value == Number.POSITIVE_INFINITY) {
        return max;
    } else if (value == Number.NEGATIVE_INFINITY) {
        return min;
    }
    return value - Math.floor((value - min) / (max - min)) * (max - min);
};

function boundaryRestrict(value, min, max) {
    return Math.max(Math.min(value, max), min);
};
