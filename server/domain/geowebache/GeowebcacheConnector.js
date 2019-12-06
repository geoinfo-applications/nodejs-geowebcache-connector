"use strict";

const Q = require("q");
const request = require("request");
const GwcCreateLayerRequest = require("./GwcCreateLayerRequest");
const GwcTruncateCacheLayerRequest = require("./GwcTruncateCacheLayerRequest");
const GwcTruncateCacheRequest = require("./GwcTruncateCacheRequest");
const GwcGetProcessesRequest = require("./GwcGetProcessesRequest");
const GwcGetProcessesForLayerRequest = require("./GwcGetProcessesForLayerRequest");
const GwcDeleteCacheRequest = require("./GwcDeleteCacheRequest");
const GwcCacheExistsRequest = require("./GwcCacheExistsRequest");
const GwcSeedLayerRequest = require("./GwcSeedLayerRequest");
const GwcReseedLayerRequest = require("./GwcReseedLayerRequest");


class GeowebcacheConnector {

    constructor(mapCacheServerConfig, logger) {
        this.baseUrl = mapCacheServerConfig.baseUrl;
        this.urlWms = mapCacheServerConfig.urlWmsService;
        this.auth = mapCacheServerConfig.auth;
        this.logger = logger || console;

        this.timeout = 60 * 1000;
    }

    getRequest(config) {
        if (!config.callback || !config.restUri) {
            throw new Error("URL and Callback required");
        }

        this.logger.debug("GWC Body", config.body);

        request({
            uri: config.restUri,
            method: config.method || "GET",
            body: config.body,
            headers: { "Content-Type": config.contentType },
            timeout: this.timeout,
            auth: {
                user: this.auth.user,
                pass: this.auth.pw,
                sendImmediately: true
            }
        }, config.callback);
    }

    createResponseListener(config) {
        const deferred = config.deferred;
        const responseStatusCode = config.responseStatusCode || 200;

        return (error, response, body) => {
            const getRejectValue = () => {
                return error || config.errorMessage;
            };

            const getResolvedValue = () => {
                return config.returnValue || response;
            };

            const responseHasError = () => {
                return !!error || (response && response.statusCode !== responseStatusCode);
            };

            const logError = (error, requestBody) => {
                const errorMsg = (error && error.message) || requestBody;
                this.logger.error(config.errorMessage, errorMsg);
            };

            if (responseHasError()) {
                logError(error, body);
                deferred.reject(getRejectValue());
            } else {
                deferred.resolve(getResolvedValue());
            }
        };

    }

    createResponseSearchListener(config) {
        const deferred = config.deferred;
        const responseStatusCode = config.responseStatusCode || 200;

        return (error, response) => {
            deferred.resolve(!!error || (response && response.statusCode === responseStatusCode));
        };
    }

    createResponseTruncateListener(config) {
        const deferred = config.deferred;

        return (error, response, body) => {
            if (error) {
                const errorMsg = (error && error.message) || body;
                this.logger.error(config.errorMessage, errorMsg);
            }
            deferred.resolve();
        };
    }

    createCacheLayer(layerDefinition) {
        const deferred = Q.defer();

        const gwcCreateLayerRequest = new GwcCreateLayerRequest(
            this.baseUrl,
            this.urlWms,
            layerDefinition,
            this.createResponseListener({
                deferred: deferred,
                responseStatusCode: 200,
                errorMessage: "Error creating cached Layer:" + layerDefinition.layerName
            }));

        this.getRequest(gwcCreateLayerRequest);

        return deferred.promise;
    }

    truncateWholeCacheLayer(layerDefinition) {
        const deferred = Q.defer();

        const gwcTruncateCacheLayer = new GwcTruncateCacheLayerRequest(this.baseUrl, layerDefinition, this.createResponseTruncateListener({
            deferred: deferred,
            responseStatusCode: 200,
            errorMessage: "Error truncate cached Layer:" + layerDefinition.layerName
        }));

        this.getRequest(gwcTruncateCacheLayer);

        return deferred.promise;
    }

    truncateMapCache(mapLayerDefinitions, params) {
        return GeowebcacheConnector.sequential(mapLayerDefinitions, (layerDefinition) => {
            return this.truncateMapLayerCache(layerDefinition, params).catch((error) => this.logger.error(error));
        });
    }

    truncateMapLayerCache(layerDefinition, params) {
        const deferred = Q.defer();

        const gwcTruncateCacheRequest = new GwcTruncateCacheRequest(this.baseUrl, layerDefinition, params, this.createResponseListener({
            deferred: deferred,
            responseStatusCode: 200,
            errorMessage: "Error truncating layercache for bounds: " + layerDefinition.layerName + " " + params.bbox
        }));

        this.getRequest(gwcTruncateCacheRequest);

        return deferred.promise;
    }

    getProcessesForLayerDefinition(layerDefinition) {
        const deferred = Q.defer();

        const gwcGetProcessesForLayerRequest = new GwcGetProcessesForLayerRequest(this.baseUrl, layerDefinition, this.createResponseListener({
            deferred: deferred,
            responseStatusCode: 200,
            errorMessage: "Error get all Processes"
        }));

        this.getRequest(gwcGetProcessesForLayerRequest);

        return deferred.promise;
    }

    getProcesses() {
        const deferred = Q.defer();

        const gwcGetProcessesRequest = new GwcGetProcessesRequest(this.baseUrl, this.createResponseListener({
            deferred: deferred,
            responseStatusCode: 200,
            errorMessage: "Error get all Processes"
        }));

        this.getRequest(gwcGetProcessesRequest);

        return deferred.promise;
    }

    deleteCacheLayer(layerDefinition) {
        const deferred = Q.defer();

        const gwcDeleteCacheRequest = new GwcDeleteCacheRequest(this.baseUrl, layerDefinition, this.createResponseListener({
            deferred: deferred,
            responseStatusCode: 200,
            errorMessage: "Error deleting cached Layerdefinition: " + layerDefinition.layerName
        }));

        this.getRequest(gwcDeleteCacheRequest);

        return deferred.promise;
    }

    seedMapCache(mapLayerDefinitions, params) {
        return GeowebcacheConnector.sequential(mapLayerDefinitions, (layerDefinition) => {
            return this.seedMapLayerCache(layerDefinition, params).catch((error) => this.logger.error(error));
        });
    }

    seedMapLayerCache(layerDefinition, params) {
        const deferred = Q.defer();

        const gwcSeedLayerRequest = new GwcSeedLayerRequest(
            this.baseUrl,
            this.urlWms,
            layerDefinition,
            params,
            this.createResponseListener({
                deferred: deferred,
                responseStatusCode: 200,
                errorMessage: "Error seeding Layer: " + layerDefinition.layerName
            }));

        this.getRequest(gwcSeedLayerRequest);

        return deferred.promise;
    }

    reseedMapLayerCache(layerDefinition, params) {
        const deferred = Q.defer();

        const gwcReseedLayerRequest = new GwcReseedLayerRequest(
            this.baseUrl,
            this.urlWms,
            layerDefinition,
            params,
            this.createResponseListener({
                deferred: deferred,
                responseStatusCode: 200,
                errorMessage: "Error seeding Layer: " + layerDefinition.layerName
            }));

        this.getRequest(gwcReseedLayerRequest);

        return deferred.promise;
    }

    existCacheLayer(layerDefinition) {
        const deferred = Q.defer();

        const gwcCacheExistsRequest = new GwcCacheExistsRequest(this.baseUrl, layerDefinition, this.createResponseSearchListener({
            deferred: deferred,
            responseStatusCode: 200
        }));

        this.getRequest(gwcCacheExistsRequest);

        return deferred.promise;
    }

    deleteMapCache(mapLayerDefinitions) {
        return GeowebcacheConnector.sequential(mapLayerDefinitions, async (layerDefinition) => {
            if (await this.existCacheLayer(layerDefinition)) {
                await this.truncateWholeCacheLayer(layerDefinition);
                await this.deleteCacheLayer(layerDefinition);
            }
        });
    }

    createOrUpdateMapCache(mapLayerDefinitions) {
        return GeowebcacheConnector.sequential(mapLayerDefinitions, async (layerDefinition) => {
            if (await this.existCacheLayer(layerDefinition)) {
                await this.deleteCacheLayer(layerDefinition);
                await this.truncateWholeCacheLayer(layerDefinition);
            }

            await this.createCacheLayer(layerDefinition);
        });
    }

    static sequential(list, iterator, catcher = null) {
        return list.reduce((promise, item, index) => {
            promise = promise.then(() => iterator(item, index));

            if (catcher) {
                return promise.catch((error) => catcher(error, index));
            }

            return promise;
        }, Q.when());
    }

}

module.exports = GeowebcacheConnector;
