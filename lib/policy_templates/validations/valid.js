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
const omit = require('lodash.omit')

// Get document, or throw exception on error
try {
  // noting to do
} catch (e) {
  console.log(e)
}

module.exports = {
  validationsTemplate,
  validationsGenTemplate,
  validationsSchemas: validationsSchema
}

function validationsSchema (api) {
  const denyList = ['host', 'x-a127-services']
  return omit(api, denyList)
}

function validationsTemplate (options) {
  const continueOnError = options.continueOnError || 'true'
  const enabled = options.enabled || 'true'
  const name = options.name
  const displayName = options.displayName || name
  const msg = builder.create('Javascript')
  const resourceUrl = options.resourceUrl
  msg.att('continueOnError', continueOnError)
  msg.att('enabled', enabled)
  msg.att('timeLimit', '200')
  msg.att('name', displayName)
  msg.ele('DisplayName', {}, displayName)
  msg.ele('Properties', {})
  msg.ele('ResourceURL', resourceUrl)
  msg.ele('IncludeURL', 'jsc://api.js')
  // msg.ele('IncludeURL', 'jsc://regex-utils.js');
  msg.ele('IncludeURL', 'jsc://bundle-policify.js')
  const xmlString = msg.end({ pretty: true, indent: '  ', newline: '\n' })
  return xmlString
}

function validationsGenTemplate (options, name) {
  const templateOptions = options
  templateOptions.count = options.allow
  templateOptions.name = name

  return validationsTemplate(templateOptions)
}
