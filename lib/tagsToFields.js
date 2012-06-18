module.exports = tagsToFields = function (osmJSONObj, obj) {
    if (osmJSONObj.tag) {
        if (!Array.isArray(osmJSONObj.tag)) {
            obj[osmJSONObj.tag['@'].k] = osmJSONObj.tag['@'].v;
            return;
        } else {
            osmJSONObj.tag.forEach(function (tag) {
                obj[tag['@'].k] = tag['@'].v;
            })
        }
    }
}