"use strict";

const GwcSeedLayerRequest = require("./GwcSeedLayerRequest");


class GwcReseedLayerRequest extends GwcSeedLayerRequest {

    constructor(baseUrl, urlWms, layerDefinition, seedOptions, callback) {
        super(baseUrl, urlWms, layerDefinition, seedOptions, callback);
    }

    get seedRequestType() {
        return "reseed";
    }

}

module.exports = GwcReseedLayerRequest;
