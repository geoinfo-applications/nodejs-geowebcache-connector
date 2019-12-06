"use strict";

const GwcRequest = require("./GwcRequest");


class GwcDeleteCacheRequest extends GwcRequest {

    constructor(baseUrl, layerDefinition, callback) {
        super("DELETE", "application/json", baseUrl, layerDefinition, callback);
    }

    get restUri() {
        return this.baseUrl + "/rest/layers/" + this.layerDefinition.layerName + ".xml";
    }

}

module.exports = GwcDeleteCacheRequest;
