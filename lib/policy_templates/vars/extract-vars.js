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

module.exports = {
  extractVarsTemplate,
  extractVarsGenTemplate
}

function extractVarsTemplate (options) {
  const continueOnError = options.continueOnError || 'true'
  const enabled = options.enabled || 'true'
  const name = options.name
  const displayName = options.displayName || name
  const msg = builder.create('ExtractVariables')
  msg.att('continueOnError', continueOnError)
  msg.att('enabled', enabled)
  msg.att('name', displayName)
  msg.ele('DisplayName', {}, displayName)
  msg.ele('Source', { clearPayload: 'false' }, 'request')

  const uri = msg.ele('URIPath', {})
  Object.keys(options.api.paths).forEach(function (path) {
    // Only add pattern if there is a parameter.
    if (path.indexOf('{') > -1) {
      uri.ele('Pattern', { ignoreCase: 'true' }, path)
    }
  })
  msg.ele('VariablePrefix', {}, 'pathParam')
  msg.ele('IgnoreUnresolvedVariables', {}, 'false')
  const xmlString = msg.end({ pretty: true, indent: '  ', newline: '\n' })
  return xmlString
}

function extractVarsGenTemplate (options, name) {
  const templateOptions = options
  templateOptions.count = options.allow
  templateOptions.name = name

  return extractVarsTemplate(templateOptions)
}
