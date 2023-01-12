/**
Copyright 2022 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict'

const should = require('should')
const path = require('path')
const generateApi = require('../../lib/commands/generateApi/generateApi')
const fs = require('fs')
const xml2js = require('xml2js')

describe('generateApi with CORS proxy (array)', function () {
  const options = {
    source: path.join(__dirname, '/openapi_files/cors-array.yaml'),
    destination: path.join(__dirname, '../../api_bundles'),
    apiProxy: 'petStoreCorsArray'
  }

  describe('generate', function () {
    it('Correct openapi file should generate proxy', function (done) {
      generateApi.generateApi(options.apiProxy, options, function (err, reply) {
        should.equal(err, null)
        done()
      })
    })
  })

  describe('Add cors policy', function () {
    it('Cors policy should be generated', function (done) {
      const corsFilePath = path.join(options.destination, options.apiProxy + '/apiproxy/policies/add-cors.xml')
      const corsFile = fs.lstatSync(corsFilePath)
      should.equal(corsFile.isFile(), true)

      const corsFileData = fs.readFileSync(corsFilePath)
      const parser = new xml2js.Parser()
      parser.parseString(corsFileData, function (err, result) {
        should.equal(err, null)
        result.should.have.property('AssignMessage')
        result.should.have.property('AssignMessage').property('Add')
        const headers = result.AssignMessage.Add[0].Headers[0]
        // Check Header name and value
        should.equal(headers.Header[0].$.name, 'Access-Control-Allow-Origin', 'Access-Control-Allow-Origin not found: ')
        should.equal(headers.Header[0]._, '*', 'Access-Control-Allow-Origin not correct')
        done()
      })
    })

    it('Proxies should contain add-cors step in PreFlow', function (done) {
      const proxiesFilePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml')
      const proxiesFileData = fs.readFileSync(proxiesFilePath)
      const parser = new xml2js.Parser()
      parser.parseString(proxiesFileData, function (err, result) {
        should.equal(err, null)
        result.should.have.property('ProxyEndpoint')
        result.should.have.property('ProxyEndpoint').property('PreFlow')
        should.equal(result.ProxyEndpoint.PreFlow[0].Response[0].Step[0].Name[0], 'add-cors', 'add-cors step in found in PreFlow')
        should.equal(result.ProxyEndpoint.PreFlow[0].Response[0].Step[0].Condition[0], 'request.verb != "OPTIONS"', 'add-cors condition in found in PreFlow')
        done()
      })
    })

    it('Proxies should contain noRoute for options request', function (done) {
      const proxiesFilePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml')
      const proxiesFileData = fs.readFileSync(proxiesFilePath)
      const parser = new xml2js.Parser()
      parser.parseString(proxiesFileData, function (err, result) {
        should.equal(err, null)
        result.should.have.property('ProxyEndpoint')
        result.should.have.property('ProxyEndpoint').property('RouteRule')
        should.equal(result.ProxyEndpoint.RouteRule[0].$.name, 'noRoute', 'noRoute found')
        should.equal(result.ProxyEndpoint.RouteRule[0].Condition[0], 'request.verb == "OPTIONS"', 'condition is not correct')
        done()
      })
    })

    it('Proxies should contain OptionsPreFlight step in Flow', function (done) {
      const proxiesFilePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml')
      const proxiesFileData = fs.readFileSync(proxiesFilePath)
      const parser = new xml2js.Parser()
      parser.parseString(proxiesFileData, function (err, result) {
        should.equal(err, null)
        result.should.have.property('ProxyEndpoint')
        result.should.have.property('ProxyEndpoint').property('Flows')
        should.equal(result.ProxyEndpoint.Flows[0].Flow[0].$.name, 'OptionsPreFlight', 'OptionsPreFlight step in found in Flows')
        should.equal(result.ProxyEndpoint.Flows[0].Flow[0].Response[0].Step[0].Name[0], 'add-cors', 'Response step found')
        done()
      })
    })

    it('Target should not contain header step in PreFlow', function (done) {
      const filePath = path.join(options.destination, options.apiProxy, '/apiproxy/targets/default.xml')
      const fileData = fs.readFileSync(filePath)
      const parser = new xml2js.Parser()
      parser.parseString(fileData, function (err, result) {
        should.equal(err, null)
        result.should.have.property('TargetEndpoint')
        result.should.have.property('TargetEndpoint').property('PreFlow')
        should.exist(result.TargetEndpoint.PreFlow[0].Request[0], 'Request found in PreFlow')
        should.equal(result.TargetEndpoint.PreFlow[0].Request[0].length, 0, 'Request step not found in PreFlow')
        done()
      })
    })
  })
})
