"use strict";

const GwcRequest = require("./GwcRequest");


class GwcTruncateCacheRequest extends GwcRequest {

    constructor(baseUrl, layerDefinition, seedOptions, callback) {
        super("POST", "text/xml", baseUrl, layerDefinition, callback);

        this.seedOptions = seedOptions;

        this.imageFormat = "image/png";
        this.threads = 1;
        this.defaultZoomStart = 0;
        this.defaultZoomStop = 14;
    }

    get restUri() {
        return this.baseUrl + "/rest/seed/" + this.layerDefinition.layerName + ".xml";
    }

    get body() {
        return this.toXml("seedRequest", this.seedRequestParams);
    }

    get seedRequestParams() {
        return {
            name: this.layerDefinition.layerName,
            type: "truncate",
            gridSetId: this.seedOptions.gridSetId,
            format: this.imageFormat,
            zoomStart: this.zoomStart,
            zoomStop: this.zoomStop,
            bounds: this.bbox,
            parameters: this.seedOptions.parameters,
            threadCount: this.threads
        };
    }
}

module.exports = GwcTruncateCacheRequest;
