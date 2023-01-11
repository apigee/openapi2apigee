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

var should = require('should')
var path = require('path')
var generateApi = require('../../lib/commands/generateApi/generateApi')
var generateSkeleton = require('../../lib/commands/generateApi/generateSkeleton.js')
var fs = require('fs')
const xml2js = require('xml2js')

describe('generateApi', function () {
  var options = {
    source: path.join(__dirname, '/openapi_files/oapi.json'),
    destination: path.join(__dirname, '../../api_bundles'),
    backendurl: 'https://app-name-env.gcp.companyname.companylocation.loc/serviceName',
    oauth: 'true',
    apiProxy: 'petStoreOauth'
  }
  describe('generate', function () {
    it('Correct openapi file should not generate error..', function (done) {
      generateApi.generateApi('petStoreOauth', options, function (err, reply) {
        should.equal(err, null)
        done()
      })
    })
  })
  describe('Add oauth policy', function () {
    it('Oauth policy should be generated', function (done) {
      var oauthFilePath = path.join(options.destination, options.apiProxy + '/apiproxy/policies/verifyAccessToken.xml')
      var oauthFile = fs.lstatSync(oauthFilePath)
      should.equal(oauthFile.isFile(), true)

      var oauthFileData = fs.readFileSync(oauthFilePath)
      var parser = new xml2js.Parser()
      parser.parseString(oauthFileData, function (err, result) {
        should.equal(err, null)
        result.should.have.property('OAuthV2')
        result.should.have.property('OAuthV2').property('Operation')
        var operation = result.OAuthV2.Operation
                // Check Header name and value
        should.equal(operation[0], 'VerifyAccessToken', 'VerifyAccessToken operation not found: ')
        done()
      })
    })

    it('Proxies should contain oauth step in PreFlow', function (done) {
      var proxiesFilePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml')
      var proxiesFileData = fs.readFileSync(proxiesFilePath)
      var parser = new xml2js.Parser()
      parser.parseString(proxiesFileData, function (err, result) {
        should.equal(err, null)
        result.should.have.property('ProxyEndpoint')
        result.should.have.property('ProxyEndpoint').property('PreFlow')
        should.equal(result.ProxyEndpoint.PreFlow[0].Request[0].Step[0].Name[0], 'verifyAccessToken', 'verifyAccessToken step in found in PreFlow')
        done()
      })
    })
  })

  describe('generatePolicies', function () {
    it('....', function () {

    })
  })

  describe('generateProxy', function () {
    it('....', function () {

    })
  })

  describe('generateProxyEndPoint', function () {
    it('....', function () {

    })
  })

  describe('generateSkeleton', function () {
    it('generate Skeleton should create folder structure', function (done) {
      var options = {
        source: path.join(__dirname, '/openapi_files/oapi.json'),
        destination: path.join(__dirname, '../../api_bundles'),
        apiProxy: randomText()
      }
      generateSkeleton(options.apiProxy, options, function (err, reply) {
        should.equal(err, null)
        var rootFolder = fs.lstatSync(path.join(options.destination, options.apiProxy))
        var proxiesFolder = fs.lstatSync(path.join(options.destination, options.apiProxy + '/apiproxy/proxies'))
        var targetsFolder = fs.lstatSync(path.join(options.destination, options.apiProxy + '/apiproxy/targets'))
        var policiesFolder = fs.lstatSync(path.join(options.destination, options.apiProxy + '/apiproxy/policies'))
        should.equal(rootFolder.isDirectory(), true)
        should.equal(proxiesFolder.isDirectory(), true)
        should.equal(targetsFolder.isDirectory(), true)
        should.equal(policiesFolder.isDirectory(), true)
        done()
      })
    })
    it('destination path ending with / should generate Skeleton Folder', function (done) {
      generateSkeleton(options.apiProxy, options, function (err, reply) {
        should.equal(err, null)
        var rootFolder = fs.lstatSync(path.join(options.destination, options.apiProxy))
        var proxiesFolder = fs.lstatSync(path.join(options.destination, options.apiProxy + '/apiproxy/proxies'))
        var targetsFolder = fs.lstatSync(path.join(options.destination, options.apiProxy + '/apiproxy/proxies'))
        should.equal(rootFolder.isDirectory(), true)
        should.equal(proxiesFolder.isDirectory(), true)
        should.equal(targetsFolder.isDirectory(), true)
        done()
      })
    })
  })

  describe('generateTargetEndPoint', function () {
    it('....', function () {

    })
  })
})

function randomText () {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  for (var i = 0; i < 10; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
