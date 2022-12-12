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

module.exports = {
  headersTemplate: headersTemplate,
  headersGenTemplate: headersGenTemplate
}

function headersTemplate (options) {
  var name = options.name
  var displayName = options.displayName || name
  var headers = options.headers
  var msg = builder.create('AssignMessage')
  msg.att('name', displayName)
  msg.ele('DisplayName', {}, displayName)
  msg.ele('AssignTo', {createNew: false, type: options.assignTo || 'request'})
  var addHeaders =
    msg.ele('Set')
       .ele('Headers')
  Object.keys(headers).forEach(function (header) {
    addHeaders.ele('Header', {name: header}, headers[header].default)
  })
  var xmlString = msg.end({ pretty: true, indent: '  ', newline: '\n' })
  return xmlString
}

function headersGenTemplate (options, name) {
  var templateOptions = options
  templateOptions.count = options.allow
  templateOptions.name = name

  return headersTemplate(templateOptions)
}
