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

const builder = require('xmlbuilder')
const random = require('../../util/random.js')

module.exports = {
  corsTemplate,
  corsGenTemplate
}

function corsTemplate (options) {
  const aysnc = options.async || 'false'
  const continueOnError = options.continueOnError || 'false'
  const enabled = options.enabled || 'true'
  const name = options.name || 'Quota-' + random.randomText()
  const displayName = options.displayName || name
  let faultRules
  let properties
  const headers = options.headers || {
    'Access-Control-Allow-Origin':
     { default: '*' },
    'Access-Control-Allow-Credentials':
     { default: false },
    'Access-Control-Allow-Headers':
     { default: 'Content-Type, X-Powered-By' },
    'Access-Control-Allow-Methods':
     { default: 'GET, HEAD' },
    'Access-Control-Max-Age':
     { default: 86400 }
  }
  const msg = builder.create('AssignMessage')
  msg.att('async', aysnc)
  msg.att('continueOnError', continueOnError)
  msg.att('enabled', enabled)
  msg.att('name', name)
  msg.ele('DisplayName', {}, displayName)
  msg.ele('FaultRules', {}, faultRules)
  msg.ele('Properties', {}, properties)
  const corsHeaders =
    msg.ele('Add')
      .ele('Headers')
  Object.keys(headers).forEach(function (header) {
    corsHeaders.ele('Header', { name: header }, headers[header].default)
  })
  msg.ele('IgnoreUnresolvedVariables', {}, true)
  msg.ele('AssignTo', { createNew: false, transport: 'http', type: 'response' })
  const xmlString = msg.end({ pretty: true, indent: '  ', newline: '\n' })
  return xmlString
}

function corsGenTemplate (options, name) {
  const templateOptions = options
  templateOptions.count = options.allow
  templateOptions.name = name

  return corsTemplate(templateOptions)
}
