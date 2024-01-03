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

var parser = require('@apidevtools/swagger-parser')
var generateSkeleton = require('./generateSkeleton.js')
var generateProxy = require('./generateProxy.js')
var generatePolicies = require('./generatePolicies.js')
var generateProxyEndPoint = require('./generateProxyEndPoint.js')
var generateTargetEndPoint = require('./generateTargetEndPoint.js')
var async = require('async')
var EasyZip = require('easy-zip').EasyZip
var path = require('path')

module.exports = {
  generateApi: generateApi
}

function generateApi (apiProxy, options, cb) {
  var destination = options.destination || path.join(__dirname, '../../../api_bundles')
  if (destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1)
  }
  var srcDirectory = destination + '/' + apiProxy + '/apiproxy/'
  var destDirectory = destination + '/' + apiProxy + '/apiproxy.zip'
  parser.parse(options.source, function (err, api, metadata) {
    if (!err) {
      console.log('Source specification is via: %s %s', (api.openapi ? 'OAS' : 'Swagger'), (api.openapi ? api.openapi : api.swagger))
      console.log('API name: %s, Version: %s', api.info.title, api.info.version)

      generateSkeleton(apiProxy, options, function (err, reply) {
        if (err) return cb(err)
        async.parallel([
          function (callback) {
            generateProxy(apiProxy, options, api, function (err, reply) {
              if (err) return callback(err)
              callback(null, 'genProxy')
            })
          },
          function (callback) {
            generateProxyEndPoint(apiProxy, options, api, function (err, reply) {
              if (err) return callback(err)
              callback(null, 'genProxyEndPoint')
            })
          },
          function (callback) {
            generateTargetEndPoint(apiProxy, options, api, function (err, reply) {
              if (err) return callback(err)
              callback(null, 'genTargetPoint')
            })
          },
          function (callback) {
            if (api['x-a127-services'] || options.oauth === 'true') {
              generatePolicies(apiProxy, options, api, function (err, reply) {
                if (err) return callback(err)
                callback(null, 'a127policies')
              })
            } else {
              callback(null, 'a127policies')
            }
          }
        ],
          function (err, results) {
            if (err) return cb(err)
            var zip5 = new EasyZip()
            zip5.zipFolder(srcDirectory, function (err) {
              if (err) {
                return cb(err, {})
              }
              zip5.writeToFile(destDirectory, function (err) {
                if (err) {
                  return cb(err, {})
                }
                return cb(null, results)
              })
            })
          }
        )
      })
    } else {
      return cb(err, { error: 'openapi parsing failed..' })
    }
  })
}
