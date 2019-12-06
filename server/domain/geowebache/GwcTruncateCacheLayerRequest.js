"use strict";

const GwcRequest = require("./GwcRequest");


class GwcTruncateCacheLayerRequest extends GwcRequest {

    constructor(baseUrl, layerDefinition, callback) {
        super("POST", "text/xml", baseUrl, layerDefinition, callback);
    }

    get restUri() {
        return this.baseUrl + "/rest/masstruncate";
    }

    get body() {
        return this.toXml("truncateLayer", { layerName: this.layerDefinition.layerName });
    }

}

module.exports = GwcTruncateCacheLayerRequest;
