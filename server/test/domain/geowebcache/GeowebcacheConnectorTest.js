"use strict";

describe("Geowebcache Connector Test", function () {

    const Q = require("q");
    const chai = require("chai");
    const expect = chai.expect;
    const sinon = require("sinon");
    const sinonChai = require("sinon-chai");
    chai.use(sinonChai);

    this.timeout(500);
    const GeowebcacheConnector = require("../../../domain/geowebache/GeowebcacheConnector");

    let gwcConnector, config, deferred, layerDefinition, targetMapLayersDefinition;

    beforeEach(() => {
        config = {
            auth: { user: "", pw: "" },
            urlWebcache: "//test/",
            urlWmsService: "//testwms/"
        };

        gwcConnector = new GeowebcacheConnector(config);

        gwcConnector.getRequest = sinon.stub();
        gwcConnector.createResponseListener = sinon.spy((config) => config.deferred.resolve());
        gwcConnector.createResponseSearchListener = sinon.spy((config) => config.deferred.resolve(true));
        gwcConnector.createResponseTruncateListener = sinon.spy((config) => config.deferred.resolve(true));

        targetMapLayersDefinition = [{
            layerName: "fancy_layer",
            sourceLayer: "fancy_layer_a,fancy_layer_b",
            sourceStyle: "fancy_layer_a_style,fancy_layer_b_style",
            parameterFilters: {
                CQL_FILTER: { type: "regex", regex: ".*", defaultValue: "myval=123" },
                additionalFlag: { type: "string", defaultValue: 1 }
                // formatOptions: { type: "string", defaultValue: "dpi:200", values: ["dpi:100", "dpi:200", "dpi:300"] }
            }
        }, {
            layerName: "sketchy_layer",
            sourceLayer: "sketchy_layer_a,sketchy_layer_b",
            sourceStyle: "sketchy_layer_a_style,sketchy_layer_b_style",
            parameterFilters: {
                CQL_FILTER: { type: "regex", regex: ".*", defaultValue: "yoval=456" },
                additionalFlag: { type: "string", defaultValue: 0 }
                // formatOptions: { type: "string", defaultValue: "dpi:200", values: ["dpi:100", "dpi:200", "dpi:300"] }
            }
        }
        ];

        deferred = Q.defer();

        layerDefinition = targetMapLayersDefinition[0];
    });

    describe("create cache layer configuration", () => {

        it("should create cache layer, default imageFormat png, tilesize 512px", async () => {
            layerDefinition.gridSubsets = [
                { gridSetName: "EPSG:2056:512" },
                { gridSetName: "EPSG:4326:256", extent: { coords: { double: [6, 46, 11, 48] } } }
            ];

            const resultConfig = {
                body: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                    "<wmsLayer><name><![CDATA[" + layerDefinition.layerName + "]]></name>" +
                    "<mimeFormats><string><![CDATA[image/png]]></string></mimeFormats>" +
                    "<gridSubsets>" +
                    "<gridSubset><gridSetName><![CDATA[EPSG:2056:512]]></gridSetName></gridSubset>" +
                    "<gridSubset>" +
                    "<gridSetName><![CDATA[EPSG:4326:256]]></gridSetName>" +
                    "<extent><coords>" +
                    "<double><![CDATA[6]]></double>" +
                    "<double><![CDATA[46]]></double>" +
                    "<double><![CDATA[11]]></double>" +
                    "<double><![CDATA[48]]></double>" +
                    "</coords></extent>" +
                    "</gridSubset>" +
                    "</gridSubsets>" +
                    "<metaWidthHeight><int><![CDATA[1]]></int><int><![CDATA[1]]></int></metaWidthHeight>" +
                    "<wmsUrl><string><![CDATA[" + config.urlWmsService + "]]></string></wmsUrl>" +
                    "<wmsLayers><![CDATA[" + layerDefinition.sourceLayer + "]]></wmsLayers>" +
                    "<wmsStyles><![CDATA[" + layerDefinition.sourceStyle + "]]></wmsStyles>" +
                    "<formatModifiers><formatModifier>" +
                    "<responseFormat><![CDATA[image/png]]></responseFormat>" +
                    "<requestFormat><![CDATA[image/png]]></requestFormat>" +
                    "<transparent><![CDATA[true]]></transparent>" +
                    "<compressionQuality><![CDATA[0.75]]></compressionQuality>" +
                    "</formatModifier></formatModifiers>" +
                    "<parameterFilters>" +
                    "<regexParameterFilter><key><![CDATA[CQL_FILTER]]></key>" +
                    "<defaultValue><![CDATA[myval=123]]></defaultValue>" +
                    "<regex><![CDATA[.*]]></regex>" +
                    "</regexParameterFilter>" +
                    "<stringParameterFilter><key><![CDATA[additionalFlag]]></key><defaultValue><![CDATA[1]]></defaultValue></stringParameterFilter>" +
                    "</parameterFilters>" +
                    // "<concurrency><int><![CDATA[64]]></int></concurrency>" +
                    "</wmsLayer>",
                restUri: config.baseUrl + "/rest/layers/fancy_layer.xml",
                method: "PUT",
                contentType: "text/xml",
                callback: gwcConnector.createResponseListener({
                    deferred: deferred,
                    responseStatusCode: 200,
                    errorMessage: "Error creating cached Layer:25_sit"
                })
            };

            await gwcConnector.createCacheLayer(layerDefinition);

            const requestConfig = gwcConnector.getRequest.args[0][0];
            expect(requestConfig.body).to.be.eql(resultConfig.body);
            expect(requestConfig.restUri).to.be.eql(resultConfig.restUri);
            expect(requestConfig.method).to.be.eql(resultConfig.method);
            expect(requestConfig.contentType).to.be.eql(resultConfig.contentType);
            expect(requestConfig.callback).to.be.eql(resultConfig.callback);
        });

        it("should create cache layer with specified image format ", async () => {
            layerDefinition.gridSubsets = [
                { gridSetName: "EPSG:2056:256" },
                { gridSetName: "EPSG:4326:256", extent: { coords: { double: [6, 46, 11, 48] } } }
            ];
            layerDefinition.imageFormat = "image/jpeg";
            const resultConfig = {
                body: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                    "<wmsLayer><name><![CDATA[" + layerDefinition.layerName + "]]></name>" +
                    "<mimeFormats><string><![CDATA[image/jpeg]]></string></mimeFormats>" +
                    "<gridSubsets>" +
                    "<gridSubset><gridSetName><![CDATA[EPSG:2056:256]]></gridSetName></gridSubset>" +
                    "<gridSubset>" +
                    "<gridSetName><![CDATA[EPSG:4326:256]]></gridSetName>" +
                    "<extent><coords>" +
                    "<double><![CDATA[6]]></double>" +
                    "<double><![CDATA[46]]></double>" +
                    "<double><![CDATA[11]]></double>" +
                    "<double><![CDATA[48]]></double>" +
                    "</coords></extent>" +
                    "</gridSubset>" +
                    "</gridSubsets>" +
                    "<metaWidthHeight><int><![CDATA[1]]></int><int><![CDATA[1]]></int></metaWidthHeight>" +
                    "<wmsUrl><string><![CDATA[" + config.urlWmsService + "]]></string></wmsUrl>" +
                    "<wmsLayers><![CDATA[" + layerDefinition.sourceLayer + "]]></wmsLayers>" +
                    "<wmsStyles><![CDATA[" + layerDefinition.sourceStyle + "]]></wmsStyles>" +
                    "<formatModifiers><formatModifier>" +
                    "<responseFormat><![CDATA[image/jpeg]]></responseFormat>" +
                    "<requestFormat><![CDATA[image/jpeg]]></requestFormat>" +
                    "<transparent><![CDATA[false]]></transparent>" +
                    "<compressionQuality><![CDATA[0.85]]></compressionQuality>" +
                    "</formatModifier>" +
                    "</formatModifiers>" +
                    "<parameterFilters>" +
                    "<regexParameterFilter><key><![CDATA[CQL_FILTER]]></key>" +
                    "<defaultValue><![CDATA[myval=123]]></defaultValue>" +
                    "<regex><![CDATA[.*]]></regex>" +
                    "</regexParameterFilter>" +
                    "<stringParameterFilter><key><![CDATA[additionalFlag]]></key><defaultValue><![CDATA[1]]></defaultValue></stringParameterFilter>" +
                    "</parameterFilters>" +
                    // "<concurrency><int><![CDATA[64]]></int></concurrency>" +
                    "</wmsLayer>",
                restUri: config.baseUrl + "/rest/layers/fancy_layer.xml",
                method: "PUT",
                contentType: "text/xml",
                callback: gwcConnector.createResponseListener({
                    deferred: deferred,
                    responseStatusCode: 200,
                    errorMessage: "Error creating cached Layer:25_sit"
                })
            };

            await gwcConnector.createCacheLayer(layerDefinition);

            const requestConfig = gwcConnector.getRequest.args[0][0];
            expect(requestConfig.body).to.be.eql(resultConfig.body);
            expect(requestConfig.restUri).to.be.eql(resultConfig.restUri);
            expect(requestConfig.method).to.be.eql(resultConfig.method);
            expect(requestConfig.contentType).to.be.eql(resultConfig.contentType);
            expect(requestConfig.callback).to.be.eql(resultConfig.callback);
        });

        it("should create cache layer with specified meta tile size", async () => {
            layerDefinition.gridSubsets = [
                { gridSetName: "EPSG:2056:512" },
                { gridSetName: "EPSG:4326:256", extent: { coords: { double: [6, 46, 11, 48] } } }
            ];
            layerDefinition.metaTileSize = 3;
            const resultConfig = {
                body: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                    "<wmsLayer><name><![CDATA[" + layerDefinition.layerName + "]]></name>" +
                    "<mimeFormats><string><![CDATA[image/png]]></string></mimeFormats>" +
                    "<gridSubsets>" +
                    "<gridSubset><gridSetName><![CDATA[EPSG:2056:512]]></gridSetName></gridSubset>" +
                    "<gridSubset>" +
                    "<gridSetName><![CDATA[EPSG:4326:256]]></gridSetName>" +
                    "<extent><coords>" +
                    "<double><![CDATA[6]]></double>" +
                    "<double><![CDATA[46]]></double>" +
                    "<double><![CDATA[11]]></double>" +
                    "<double><![CDATA[48]]></double>" +
                    "</coords></extent>" +
                    "</gridSubset>" +
                    "</gridSubsets>" +
                    "<metaWidthHeight><int><![CDATA[3]]></int><int><![CDATA[3]]></int></metaWidthHeight>" +
                    "<wmsUrl><string><![CDATA[" + config.urlWmsService + "]]></string></wmsUrl>" +
                    "<wmsLayers><![CDATA[" + layerDefinition.sourceLayer + "]]></wmsLayers>" +
                    "<wmsStyles><![CDATA[" + layerDefinition.sourceStyle + "]]></wmsStyles>" +
                    "<formatModifiers><formatModifier>" +
                    "<responseFormat><![CDATA[image/png]]></responseFormat>" +
                    "<requestFormat><![CDATA[image/png]]></requestFormat>" +
                    "<transparent><![CDATA[true]]></transparent>" +
                    "<compressionQuality><![CDATA[0.75]]></compressionQuality>" +
                    "</formatModifier>" +
                    "</formatModifiers>" +
                    "<parameterFilters>" +
                    "<regexParameterFilter><key><![CDATA[CQL_FILTER]]></key>" +
                    "<defaultValue><![CDATA[myval=123]]></defaultValue>" +
                    "<regex><![CDATA[.*]]></regex>" +
                    "</regexParameterFilter>" +
                    "<stringParameterFilter><key><![CDATA[additionalFlag]]></key><defaultValue><![CDATA[1]]></defaultValue></stringParameterFilter>" +
                    "</parameterFilters>" +
                    // "<concurrency><int><![CDATA[64]]></int></concurrency>" +
                    "</wmsLayer>",
                restUri: config.baseUrl + "/rest/layers/fancy_layer.xml",
                method: "PUT",
                contentType: "text/xml",
                callback: gwcConnector.createResponseListener({
                    deferred: deferred,
                    responseStatusCode: 200,
                    errorMessage: "Error creating cached Layer:25_sit"
                })
            };

            await gwcConnector.createCacheLayer(layerDefinition);

            const requestConfig = gwcConnector.getRequest.args[0][0];
            expect(requestConfig.body).to.be.eql(resultConfig.body);
            expect(requestConfig.restUri).to.be.eql(resultConfig.restUri);
            expect(requestConfig.method).to.be.eql(resultConfig.method);
            expect(requestConfig.contentType).to.be.eql(resultConfig.contentType);
            expect(requestConfig.callback).to.be.eql(resultConfig.callback);
        });

    });

    describe("truncateWholeCacheLayer", () => {

        it("should truncate cache layer ", async () => {
            const resultConfig = {
                body: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                    "<truncateLayer><layerName><![CDATA[" + layerDefinition.layerName + "]]></layerName></truncateLayer>",
                restUri: config.baseUrl + "/rest/masstruncate",
                method: "POST",
                contentType: "text/xml",
                callback: gwcConnector.createResponseTruncateListener({
                    deferred: deferred,
                    responseStatusCode: 200,
                    errorMessage: "Error truncate cached Layer:" + layerDefinition.layerName
                })
            };

            await gwcConnector.truncateWholeCacheLayer(layerDefinition);

            const requestConfig = gwcConnector.getRequest.args[0][0];
            expect(requestConfig.body).to.be.eql(resultConfig.body);
            expect(requestConfig.restUri).to.be.eql(resultConfig.restUri);
            expect(requestConfig.method).to.be.eql(resultConfig.method);
            expect(requestConfig.contentType).to.be.eql(resultConfig.contentType);
            expect(requestConfig.callback).to.be.eql(resultConfig.callback);
        });

    });

    describe("truncateCache", () => {

        it("should truncate cache layer in bounds", async () => {
            const resultConfig = {
                body: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                    "<seedRequest>" +
                    "<name><![CDATA[fancy_layer]]></name>" +
                    "<type><![CDATA[truncate]]></type>" +
                    "<gridSetId><![CDATA[EPSG:2056:512]]></gridSetId>" +
                    "<format><![CDATA[image/png]]></format>" +
                    "<zoomStart><![CDATA[0]]></zoomStart><zoomStop><![CDATA[14]]></zoomStop>" +
                    "<bounds><coords>" +
                    "<double><![CDATA[0]]></double><double><![CDATA[0]]></double><double><![CDATA[1]]></double><double><![CDATA[1]]></double>" +
                    "</coords></bounds>" +
                    "<parameters><![CDATA[]]></parameters>" +
                    "<threadCount><![CDATA[1]]></threadCount>" +
                    "</seedRequest>",
                restUri: config.baseUrl + "/rest/seed/fancy_layer.xml",
                method: "POST",
                contentType: "text/xml",
                callback: gwcConnector.createResponseTruncateListener({
                    deferred: deferred,
                    responseStatusCode: 200,
                    errorMessage: "Error truncate cached Layer:" + layerDefinition.layerName
                })
            };

            await gwcConnector.truncateMapLayerCache(layerDefinition, { bbox: "0,0,1,1", gridSetId: "EPSG:2056:512" });

            const requestConfig = gwcConnector.getRequest.args[0][0];
            expect(requestConfig.body).to.be.eql(resultConfig.body);
            expect(requestConfig.restUri).to.be.eql(resultConfig.restUri);
            expect(requestConfig.method).to.be.eql(resultConfig.method);
            expect(requestConfig.contentType).to.be.eql(resultConfig.contentType);
            expect(requestConfig.callback).to.be.eql(resultConfig.callback);
        });

        it("should truncate cache layer in bounds with parameters", async () => {
            const resultConfig = {
                body: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                    "<seedRequest>" +
                    "<name><![CDATA[fancy_layer]]></name>" +
                    "<type><![CDATA[truncate]]></type>" +
                    "<gridSetId><![CDATA[EPSG:1234:567]]></gridSetId>" +
                    "<format><![CDATA[image/png]]></format>" +
                    "<zoomStart><![CDATA[0]]></zoomStart><zoomStop><![CDATA[14]]></zoomStop>" +
                    "<bounds><coords>" +
                    "<double><![CDATA[0]]></double><double><![CDATA[0]]></double><double><![CDATA[1]]></double><double><![CDATA[1]]></double>" +
                    "</coords></bounds>" +
                    "<parameters>" +
                    "<entry>" +
                    "<string><![CDATA[CQL_FILTER]]></string>" +
                    "<string>" +
                    "<![CDATA[include]]></string>" +
                    "</entry>" +
                    "<entry>" +
                    "<string><![CDATA[ADDITIONALFLAG]]></string>" +
                    "<string><![CDATA[1]]></string>" +
                    "</entry>" +
                    "</parameters>" +
                    "<threadCount><![CDATA[1]]></threadCount>" +
                    "</seedRequest>",
                restUri: config.baseUrl + "/rest/seed/fancy_layer.xml",
                method: "POST",
                contentType: "text/xml",
                callback: gwcConnector.createResponseTruncateListener({
                    deferred: deferred,
                    responseStatusCode: 200,
                    errorMessage: "Error truncate cached Layer:" + layerDefinition.layerName
                })
            };

            await gwcConnector.truncateMapLayerCache(layerDefinition, {
                bbox: "0,0,1,1",
                gridSetId: "EPSG:1234:567",
                parameters: {
                    entry: [
                        { string: ["CQL_FILTER", "include"] },
                        { string: ["ADDITIONALFLAG", "1"] }
                    ]
                }
            });

            const requestConfig = gwcConnector.getRequest.args[0][0];
            expect(requestConfig.body).to.be.eql(resultConfig.body);
            expect(requestConfig.restUri).to.be.eql(resultConfig.restUri);
            expect(requestConfig.method).to.be.eql(resultConfig.method);
            expect(requestConfig.contentType).to.be.eql(resultConfig.contentType);
            expect(requestConfig.callback).to.be.eql(resultConfig.callback);
        });

    });

    describe("deleteCacheLayer", () => {

        it("should delete cache layer ", async () => {
            const resultConfig = {
                restUri: config.baseUrl + "/rest/layers/" + layerDefinition.layerName + ".xml",
                method: "DELETE",
                callback: gwcConnector.createResponseListener({
                    deferred: deferred,
                    responseStatusCode: 200,
                    errorMessage: "Error deleting cached Layerdefinition:" + layerDefinition.layerName
                })
            };

            await gwcConnector.deleteCacheLayer(layerDefinition);

            const requestConfig = gwcConnector.getRequest.args[0][0];
            expect(requestConfig.restUri).to.be.eql(resultConfig.restUri);
            expect(requestConfig.method).to.be.eql(resultConfig.method);
            expect(requestConfig.callback).to.be.eql(resultConfig.callback);
        });

    });

    describe("existCacheLayer", () => {

        it("should exists cache layer ", async () => {
            const resultConfig = {
                restUri: config.baseUrl + "/rest/layers/" + layerDefinition.layerName + ".xml",
                method: "GET",
                callback: gwcConnector.createResponseSearchListener({
                    deferred: deferred,
                    responseStatusCode: 200
                })
            };

            await gwcConnector.existCacheLayer(layerDefinition);

            const requestConfig = gwcConnector.getRequest.args[0][0];
            expect(requestConfig.restUri).to.be.eql(resultConfig.restUri);
            expect(requestConfig.method).to.be.eql(resultConfig.method);
            expect(requestConfig.callback).to.be.eql(resultConfig.callback);
        });

    });

    describe("deleteCacheForMap", () => {

        it("should delete all cache layers for map ", async () => {
            gwcConnector.existCacheLayer = sinon.stub().returns(Promise.resolve(true));
            gwcConnector.truncateWholeCacheLayer = sinon.stub().returns(Promise.resolve());
            gwcConnector.deleteCacheLayer = sinon.stub().returns(Promise.resolve());

            await gwcConnector.deleteMapCache(targetMapLayersDefinition);

            expect(gwcConnector.existCacheLayer).to.have.callCount(2);
            expect(gwcConnector.truncateWholeCacheLayer).to.have.been.calledAfter(gwcConnector.existCacheLayer);
            expect(gwcConnector.deleteCacheLayer).to.have.been.calledAfter(gwcConnector.truncateWholeCacheLayer);
        });

    });

    describe("createCacheForMap", () => {

        it("should recreate all cache layers for existing map ", async () => {
            gwcConnector.existCacheLayer = sinon.stub().returns(Promise.resolve(true));
            gwcConnector.truncateWholeCacheLayer = sinon.stub().returns(Promise.resolve());
            gwcConnector.deleteCacheLayer = sinon.stub().returns(Promise.resolve());
            gwcConnector.createCacheLayer = sinon.stub().returns(Promise.resolve());

            await gwcConnector.createOrUpdateMapCache(targetMapLayersDefinition);

            expect(gwcConnector.existCacheLayer).to.have.callCount(2);
            expect(gwcConnector.deleteCacheLayer).to.have.callCount(2);
            expect(gwcConnector.deleteCacheLayer).to.have.been.calledAfter(gwcConnector.existCacheLayer);
            expect(gwcConnector.truncateWholeCacheLayer).to.have.been.calledAfter(gwcConnector.deleteCacheLayer);
            expect(gwcConnector.createCacheLayer).to.have.been.calledAfter(gwcConnector.truncateWholeCacheLayer);
        });

        it("should create all cache layers for new map ", async () => {
            gwcConnector.existCacheLayer = sinon.stub().returns(Promise.resolve(false));
            gwcConnector.deleteCacheLayer = sinon.stub().returns(Promise.resolve());
            gwcConnector.createCacheLayer = sinon.stub().returns(Promise.resolve());

            await gwcConnector.createOrUpdateMapCache(targetMapLayersDefinition);

            expect(gwcConnector.existCacheLayer).to.have.callCount(2);
            expect(gwcConnector.createCacheLayer).to.have.been.calledAfter(gwcConnector.existCacheLayer);
            expect(gwcConnector.createCacheLayer).to.not.have.been.calledAfter(gwcConnector.deleteCacheLayer);
        });

    });

});
