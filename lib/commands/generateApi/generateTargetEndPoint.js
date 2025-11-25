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

var builder = require('xmlbuilder')
var fs = require('fs')
var path = require('path')

module.exports = function generateTargetEndPoint (apiProxy, options, api, cb) {
  var destination = options.destination || path.join(__dirname, '../../../api_bundles')
  if (destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1)
  }
  var rootDirectory = destination + '/' + apiProxy + '/apiproxy'
  var root = builder.create('TargetEndpoint')
  root.att('name', 'default')
  root.ele('Description', {}, api.info.title)
  var preFlow = root.ele('PreFlow', {name: 'PreFlow'})

  // Add steps to preflow.
  var requestPipe = preFlow.ele('Request')
  preFlow.ele('Response')
  for (var service in api['x-a127-services']) {
    var serviceItem = api['x-a127-services'][service]
    if (serviceItem.provider === 'x-headers') {
      if (serviceItem['apply'] && serviceItem['apply'].endPoint.indexOf('target') > -1) {
        if (
          serviceItem['apply'] &&
          serviceItem['apply'].pipe.indexOf('request') > -1 &&
          serviceItem['options'].displayName) {
          var step = requestPipe.ele('Step', {})
          step.ele('Name', {}, serviceItem['options'].displayName)
        }
      }
    }
  }

  root.ele('Flows', {})

  var postFlow = root.ele('PostFlow', {name: 'PostFlow'})
  postFlow.ele('Request')
  postFlow.ele('Response')

  var httpTargetConn = root.ele('HTTPTargetConnection')

  if (options.kvm) {
    httpTargetConn.ele('URL', {}, "{" + apiProxy + "}")
  } else if (options.backendurl) {
    httpTargetConn.ele('URL', {}, options.backendurl)
  } else {
    if (api.openapi) {
      httpTargetConn.ele('URL', {}, api.servers[0].url)
    } else {
      httpTargetConn.ele('URL', {}, api.schemes[0] + '://' + api.host + api.basePath)
    }
  }

  var xmlString = root.end({ pretty: true, indent: '  ', newline: '\n' })
  fs.writeFile(rootDirectory + '/targets/default.xml', xmlString, function (err) {
    if (err) {
      return cb(err, {})
    }
    cb(null, {})
  })
}
