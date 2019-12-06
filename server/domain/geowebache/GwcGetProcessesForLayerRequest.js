"use strict";

const GwcRequest = require("./GwcRequest");


class GwcGetProcessesRequest extends GwcRequest {

    constructor(baseUrl, layerDefinition, callback) {
        super("GET", "application/json", baseUrl, layerDefinition, callback);
    }

    get restUri() {
        return this.baseUrl + "/rest/seed/" + this.layerDefinition.layerName + ".json";
    }

    get body() {
        return "";
    }

}

module.exports = GwcGetProcessesRequest;
