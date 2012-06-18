var xml2js = require('xml2js'); //https://github.com/Leonidas-from-XIV/node-xml2js/

exports.toJSON = function (xml, callback) {
    var parser = new xml2js.Parser();
    parser.addListener('end', function(result) {
        callback(result);
    });
    parser.parseString(xml);
}

