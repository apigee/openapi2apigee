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

module.exports = function generateProxy (apiProxy, options, api, cb) {
  var destination = options.destination || path.join(__dirname, '../../../api_bundles')
  if (destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1)
  }
  var rootDirectory = destination + '/' + apiProxy + '/apiproxy'
  var root = builder.create('APIProxy')
  root.att('revison', 1)
  root.att('name', apiProxy)
  root.ele('CreatedAt', {}, Math.floor(Date.now() / 1000))
  root.ele('Description', {}, api.info.title)
  var proxyEndPoints = root.ele('ProxyEndpoints', {})
  proxyEndPoints.ele('ProxyEndpoint', {}, 'default')
  var targetEndPoints = root.ele('TargetEndpoints', {})
  targetEndPoints.ele('TargetEndpoint', {}, 'default')
  var xmlString = root.end({ pretty: true, indent: '  ', newline: '\n' })
  fs.writeFile(rootDirectory + '/' + apiProxy + '.xml', xmlString, function (err) {
    if (err) {
      return cb(err, {})
    }
    cb(null, {})
  })
}
