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

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const assign = require('lodash.assign')
const serviceUtils = require('../../util/service.js')
const quota = require('../../policy_templates/quota/quota.js')
const spike = require('../../policy_templates/spikeArrest/spikeArrest.js')
const cache = require('../../policy_templates/cache/responseCache.js')
const cors = require('../../policy_templates/cors/cors.js')
const headers = require('../../policy_templates/headers/headers.js')
const regex = require('../../policy_templates/regex-protection/regex.js')
const extractVars = require('../../policy_templates/vars/extract-vars.js')
const validations = require('../../policy_templates/validations/valid.js')
const raiseFault = require('../../policy_templates/raise-fault/raise.js')
const verifyApiKey = require('../../policy_templates/security/apikey.js')
const oauth2 = require('../../policy_templates/security/verifyAccessToken.js')
const removeHeaderAuthorization = require('../../policy_templates/security/removeHeaderAuthorization.js')
const async = require('async')

module.exports = function generatePolicies (apiProxy, options, api, cb) {
  let destination = options.destination || path.join(__dirname, '../../../api_bundles')
  if (destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1)
  }
  const rootDirectory = destination + '/' + apiProxy + '/apiproxy'
  let validationCount = 0
  const services = serviceUtils.servicesToArray(api)

  if (options.oauth === 'true') {
    const xmlStrings = []
    let xmlString = ''
    // Add cache Policies
    xmlString = oauth2.verifyAccessTokenGenTemplate([], 'verifyAccessToken')
    xmlStrings.push({ xmlString, serviceName: 'verifyAccessToken' })
    xmlString = removeHeaderAuthorization.removeHeaderAuthorizationGenTemplate([], 'removeHeaderAuthorization')
    xmlStrings.push({ xmlString, serviceName: 'removeHeaderAuthorization' })

    let writeCnt = 0
    xmlStrings.forEach(function writeFile (xmlString) {
      fs.writeFile(rootDirectory + '/policies/' + xmlString.serviceName + '.xml', xmlString.xmlString, function (err) {
        if (err) {
          throw new Error()
        }
        writeCnt++
        if (writeCnt === xmlStrings.length) {
          // cb(null, {})
        }
      })
    })
  }

  async.each(services, function (service, callback) {
    // Perform operation on file here.
    const xmlStrings = []
    const serviceName = service.name
    const provider = service.provider
    const serviceOptions = service.options
    let xmlString = ''
    if (provider.indexOf('quota') > -1) {
      // Add Quota Policy
      xmlString = quota.quotaGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString, serviceName })
    }
    if (provider.indexOf('spike') > -1) {
      // Add spike Policy
      xmlString = spike.spikeArrestGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString, serviceName })
    }
    if (provider.indexOf('cache') > -1) {
      // Add cache Policies
      xmlString = cache.responseCacheGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString, serviceName })
    }
    if (provider.indexOf('cors') > -1) {
      // Add cors Policies
      xmlString = cors.corsGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString, serviceName })
    }
    if (provider.indexOf('headers') > -1) {
      // Add header Policies
      xmlString = headers.headersGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString, serviceName })
    }
    if (provider.indexOf('regex') > -1) {
      // Add regex Policies
      xmlString = regex.regexGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString, serviceName })
      // filter
      mkdirp.sync(rootDirectory + '/resources/jsc')
      const js = path.join(__dirname, '../../resource_templates/jsc/JavaScriptFilter.js')
      fs.createReadStream(js).pipe(fs.createWriteStream(rootDirectory + '/resources/jsc/' + serviceName + '.js'))
      // regex
      const qs = path.join(__dirname, '../../../third_party/querystringDecode.js')
      fs.createReadStream(qs).pipe(fs.createWriteStream(rootDirectory + '/resources/jsc/' + serviceName + '-querystring.js'))
      const x = regex.regularExpressions()
      const wstream = fs.createWriteStream(rootDirectory + '/resources/jsc/regex.js')
      wstream.write(Buffer.from('var elements = ' + JSON.stringify(x) + ';'))
      wstream.end()
    }
    if (provider.indexOf('raiseFault') > -1) {
      // Add RaiseFault Policy
      xmlString = raiseFault.raiseFaultGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString, serviceName })
    }
    if (provider.indexOf('input-validation') > -1) {
      assign(serviceOptions, { resourceUrl: 'jsc://input-validation.js' })
      xmlString = validations.validationsGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString, serviceName })
      const extractVarsOptions = {
        name: 'Extract-Path-Parameters',
        displayName: 'Extract Path Parameters',
        api
      }
      xmlString = extractVars.extractVarsGenTemplate(extractVarsOptions, extractVarsOptions.name)
      xmlStrings.push({ xmlString, serviceName: 'extractPathParameters' })
    }
    if (provider.indexOf('output-validation') > -1) {
      assign(serviceOptions, { resourceUrl: 'jsc://schema-validation.js' })
      xmlString = validations.validationsGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString, serviceName })
    }
    if (validationCount === 0 && (provider.indexOf('input-validation') > -1 || provider.indexOf('output-validation') > -1)) {
      validationCount++ // Only do this once.
      mkdirp.sync(rootDirectory + '/resources/jsc')
      // output validation
      const bu = path.join(__dirname, '../../resource_templates/jsc/bundle-policify.js')
      fs.createReadStream(bu).pipe(fs.createWriteStream(rootDirectory + '/resources/jsc/bundle-policify.js'))
      let js = path.join(__dirname, '../../resource_templates/jsc/SchemaValidation.js')
      fs.createReadStream(js).pipe(fs.createWriteStream(rootDirectory + '/resources/jsc/schema-validation.js'))
      // var ru = path.join(__dirname, '../../resource_templates/jsc/Regex.js');
      // fs.createReadStream(ru).pipe(fs.createWriteStream(rootDirectory + '/resources/jsc/regex-utils.js'));
      // input validation
      js = path.join(__dirname, '../../resource_templates/jsc/InputValidation.js')
      fs.createReadStream(js).pipe(fs.createWriteStream(rootDirectory + '/resources/jsc/input-validation.js'))
      // api
      const x = validations.validationsSchemas(api)
      const wstream = fs.createWriteStream(rootDirectory + '/resources/jsc/api.js')
      wstream.write(Buffer.from('var api = ' + JSON.stringify(x) + ';'))
      wstream.end()
    }

    if (provider.indexOf('raiseInputValidationFault') > -1) {
      // Add RaiseFault Policy
      xmlString = raiseFault.raiseFaultGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString, serviceName })
    }
    if (provider.indexOf('raiseOutputValidationFault') > -1) {
      // Add RaiseFault Policy
      xmlString = raiseFault.raiseFaultGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString, serviceName })
    }
    if (provider.indexOf('oauth') > -1 && (serviceName === 'apiKeyQuery' || serviceName === 'apiKeyHeader')) {
      // Add cache Policies
      xmlString = verifyApiKey.apiKeyGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString, serviceName })
    }
    if (provider.indexOf('oauth') > -1 && (serviceName === 'oauth2')) {
      // Add cache Policies
      xmlString = oauth2.verifyAccessTokenGenTemplate(serviceOptions, 'verifyAccessToken')
      xmlStrings.push({ xmlString, serviceName })
    }

    let writeCnt = 0
    xmlStrings.forEach(function writeFile (xmlString) {
      fs.writeFile(rootDirectory + '/policies/' + xmlString.serviceName + '.xml', xmlString.xmlString, function (err) {
        if (err) {
          callback(err, {})
        }
        writeCnt++
        if (writeCnt === xmlStrings.length) {
          callback(null, {})
        }
      })
    })
  }, function (err) {
    // if any of the file processing produced an error, err would equal that error
    if (err) {
      cb(err, {})
    } else {
      cb(null, {})
    }
  })
}
