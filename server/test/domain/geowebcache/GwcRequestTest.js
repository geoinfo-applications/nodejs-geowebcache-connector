"use strict";


describe("Gwc Request Test", function () {

    const chai = require("chai");
    const expect = chai.expect;

    const GwcRequest = require("./../../../domain/geowebache/GwcRequest");

    this.timeout(100);
    let request, method, contentType, baseUrl, layerDefinition, callback;

    beforeEach(() => {
        method = "GET";
        contentType = "application/xml";
        baseUrl = "foo";
        layerDefinition = { imageFormat: "image/jpeg" };
        callback = () => {
        };

        request = new GwcRequest(method, contentType, baseUrl, layerDefinition, callback);
    });


    it("should call js2xmlparser", () => {
        const node = { name: "bar" };

        const result = request.toXml("foo", node);

        expect(result).to.be.eql("<?xml version=\"1.0\" encoding=\"UTF-8\"?><foo><name><![CDATA[bar]]></name></foo>");
    });


});
