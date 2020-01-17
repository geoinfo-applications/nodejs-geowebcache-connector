"use strict";

const GwcRequest = require("./GwcRequest");


class GwcCreateLayerRequest extends GwcRequest {

    constructor(baseUrl, urlWms, layerDefinition, callback) {
        super("PUT", "text/xml", baseUrl, layerDefinition, callback);

        this.urlWms = urlWms;
        this.concurrency = 64;

        this.imageFormat = "image/png";
    }

    get restUri() {
        return this.baseUrl + "/rest/layers/" + this.layerDefinition.layerName + ".xml";
    }

    get body() {
        return this.toXml("wmsLayer", {
            name: this.layerDefinition.layerName,
            mimeFormats: { string: this.layerDefinition.imageFormat || this.imageFormat },
            gridSubsets: { gridSubset: this.girdSubsets },
            metaWidthHeight: { int: [this.metaTileSize, this.metaTileSize] },
            wmsUrl: { string: this.urlWms },
            wmsLayers: this.layerDefinition.sourceLayer,
            wmsStyles: this.layerDefinition.sourceStyle,
            formatModifiers: { formatModifier: this.formatModifiers },
            parameterFilters: this.parameterFilters
        });
    }

    get parameterFilters() {
        if (!this.layerDefinition.parameterFilters) {
            return undefined;
        }

        const parameterFilters = {};

        for (const key of Object.keys(this.layerDefinition.parameterFilters)) {
            const param = this.layerDefinition.parameterFilters[key];
            const paramFilterType = param.type + "ParameterFilter";

            parameterFilters[paramFilterType] = parameterFilters[paramFilterType] || [];
            const paramFilter = this.formatParameterFilter(key, param);
            parameterFilters[paramFilterType].push(paramFilter);
        }

        return parameterFilters;
    }

    formatParameterFilter(key, param) {
        const paramFilter = { key };

        if (param.defaultValue) {
            paramFilter.defaultValue = param.defaultValue;
        }

        if (param.type === "string" && param.values) {
            paramFilter.values = { string: param.values };
        }

        if (param.type === "regex") {
            paramFilter.regex = param.regex;
        }

        return paramFilter;
    }

    get formatModifiers() {
        const compressionQuality = this.layerDefinition.imageFormat === "image/jpeg" ? "0.85" : "0.75";
        const requestFormat = this.layerDefinition.imageFormat || this.imageFormat;
        return [{
            responseFormat: requestFormat,
            requestFormat: requestFormat,
            transparent: this.layerDefinition.imageFormat !== "image/jpeg",
            compressionQuality: compressionQuality
        }
        ];
    }

    get metaTileSize() {
        return this.layerDefinition.metaTileSize > 1 ? this.layerDefinition.metaTileSize : 1;
    }

}

module.exports = GwcCreateLayerRequest;
