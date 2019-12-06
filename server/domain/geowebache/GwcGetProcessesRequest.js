"use strict";

const GwcRequest = require("./GwcRequest");


class GwcGetProcessesRequest extends GwcRequest {

    constructor(baseUrl, callback) {
        super("GET", "application/json", baseUrl, null, callback);
    }

    get restUri() {
        return this.baseUrl + "/rest/seed.json";
    }

    get body() {
        return "";
    }

}

module.exports = GwcGetProcessesRequest;
