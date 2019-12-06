"use strict";

const js2xmlparser = require("js2xmlparser");


class GwcRequest {

    constructor(method, contentType, baseUrl, layerDefinition, callback) {
        this.method = method;
        this.contentType = contentType;
        this.baseUrl = baseUrl;

        this.layerDefinition = layerDefinition;
        this.callback = callback;

        this.xmlOptions = {
            useCDATA: true,
            prettyPrinting: { enabled: false }
        };

        this.defaultBBOX = [2702000, 1200000, 2770000, 1265000].join();
    }

    toXml(rootElementName, node) {
        return js2xmlparser(rootElementName, node, this.xmlOptions);
    }

    get girdSubsets() {
        return this.layerDefinition.gridSubsets;
    }

    get zoomStart() {
        return this.seedOptions.zoomStart || this.defaultZoomStart;
    }

    get zoomStop() {
        return this.seedOptions.zoomStop || this.defaultZoomStop;
    }

    get bbox() {
        const bbox = this.seedOptions.bbox || this.defaultBBOX;
        const coordinates = bbox.split(",").map((coordinate) => ("" + coordinate));
        return { coords: { double: coordinates } };
    }

}

module.exports = GwcRequest;
