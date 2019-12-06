"use strict";

const GwcRequest = require("./GwcRequest");


class GwcSeedLayerRequest extends GwcRequest {

    constructor(baseUrl, urlWms, layerDefinition, seedOptions, callback) {
        super("POST", "application/json", baseUrl, layerDefinition, callback);

        this.urlWms = urlWms;
        this.seedOptions = seedOptions;

        this.defaultImageFormat = "image/png";
        this.defaultThreadCount = 32;
        this.defaultZoomStart = 0;
        this.defaultZoomStop = 9;
    }

    get restUri() {
        return this.baseUrl + "/rest/seed/" + this.layerDefinition.layerName + ".xml";
    }

    get body() {
        return this.toXml("seedRequest", this.seedRequestParams);
    }

    get seedRequestParams() {
        return {
            type: this.seedRequestType,
            name: this.layerDefinition.layerName,
            srs: this.seedOptions.srs,
            gridSetId: this.seedOptions.gridSetId,
            zoomStart: this.zoomStart,
            zoomStop: this.zoomStop,
            bounds: this.bbox,
            parameters: this.seedOptions.parameters,
            format: this.layerDefinition.imageFormat || this.defaultImageFormat,
            threadCount: this.seedOptions.threadCount || this.defaultThreadCount
        };
    }

    get seedRequestType() {
        return "seed";
    }
}

module.exports = GwcSeedLayerRequest;
