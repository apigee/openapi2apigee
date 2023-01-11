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
var random = require('../../util/random.js')

module.exports = {
  removeHeaderAuthorizationTemplate: removeHeaderAuthorizationTemplate,
  removeHeaderAuthorizationGenTemplate: removeHeaderAuthorizationGenTemplate
}

function removeHeaderAuthorizationTemplate (options) {
  var name = options.name || 'removeHeaderAuthorization-' + random.randomText()

  var removeHeaderAuthorization = builder.create('AssignMessage')
  removeHeaderAuthorization.att('name', name)
  removeHeaderAuthorization.ele('DisplayName', {}, 'Remove Header Authorization')
  removeHeaderAuthorization.ele('IgnoreUnresolvedVariables', {}, true)
  removeHeaderAuthorization.ele('AssignTo', {createNew: false, transport: 'http', type: 'request'})
  removeHeaderAuthorization.ele('Remove')
          .ele('Headers')
          .ele('Header', {name: 'Authorization'})

  var xmlString = removeHeaderAuthorization.end({ pretty: true, indent: '  ', newline: '\n' })
  return xmlString
}

function removeHeaderAuthorizationGenTemplate (options, name) {
  var templateOptions = options
  templateOptions.name = name || 'removeHeaderAuthorization'
  return removeHeaderAuthorizationTemplate(templateOptions)
}
