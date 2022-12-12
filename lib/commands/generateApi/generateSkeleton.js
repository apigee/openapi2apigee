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

var mkdirp = require('mkdirp')
var async = require('async')
var path = require('path')

module.exports = function generateSkeleton (apiProxy, options, cb) {
  var destination = options.destination || path.join(__dirname, '../../../api_bundles')
  if (destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1)
  }
  var rootDirectory = destination + '/' + apiProxy + '/apiproxy'
  mkdirp.sync(rootDirectory)
  // Generate sub folders..
  var subFolders = ['proxies', 'targets', 'policies']

  async.map(subFolders, function (item, callback) {
    callback(null, this.rootDirectory + '/' + item)
  }.bind({ rootDirectory: rootDirectory }), function (err, results) {
    if (err) return cb(err)
    // Create sub folders
    async.map(results, mkdirp, function (err, results) {
      if (err) {
        cb(err, results)
      }
      cb(null, results)
    })
  })
}
