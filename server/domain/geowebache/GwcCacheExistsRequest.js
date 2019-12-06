"use strict";

const GwcRequest = require("./GwcRequest");


class GwcCacheExistsRequest extends GwcRequest {

    constructor(baseUrl, layerDefinition, callback) {
        super("GET", "application/xml", baseUrl, layerDefinition, callback);
    }

    get restUri() {
        return this.baseUrl + "/rest/layers/" + this.layerDefinition.layerName + ".xml";
    }

}

module.exports = GwcCacheExistsRequest;
