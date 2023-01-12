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
  verifyAccessTokenTemplate,
  verifyAccessTokenGenTemplate
}

function verifyAccessTokenTemplate (options) {
  const aysnc = options.async || 'false'
  const continueOnError = options.continueOnError || 'false'
  const enabled = options.enabled || 'true'
  const name = options.name || 'verifyAccessToken-' + random.randomText()

  const verifyAccessToken = builder.create('OAuthV2')
  verifyAccessToken.att('async', aysnc)
  verifyAccessToken.att('continueOnError', continueOnError)
  verifyAccessToken.att('enabled', enabled)
  verifyAccessToken.att('name', name)

  verifyAccessToken.ele('DisplayName', {}, 'Verify OAuth v2.0 Access Token')
  verifyAccessToken.ele('Properties', {})
  verifyAccessToken.ele('ExternalAuthorization', {}, false)
  verifyAccessToken.ele('Operation', {}, 'VerifyAccessToken')
  verifyAccessToken.ele('SupportedGrantTypes', {})
  verifyAccessToken.ele('GenerateResponse', { enabled: true })
  verifyAccessToken.ele('Tokens', {})

  const xmlString = verifyAccessToken.end({ pretty: true, indent: '  ', newline: '\n' })
  return xmlString
}

function verifyAccessTokenGenTemplate (options, name) {
  const templateOptions = options
  templateOptions.name = name || 'verifyAccessToken'
  return verifyAccessTokenTemplate(templateOptions)
}
