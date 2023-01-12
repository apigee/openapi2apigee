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
  responseCacheTemplate,
  responseCacheGenTemplate
}

function responseCacheTemplate (options) {
  const aysnc = options.async || 'false'
  const continueOnError = options.continueOnError || 'false'
  const enabled = options.enabled || 'true'
  const name = options.name || 'responseCache-' + random.randomText()
  const displayName = options.displayName || name

  const keyFragment = options.keyFragment || ''
  const keyFragmentRef = options.keyFragmentRef || 'request.uri'

  const scope = options.scope || 'Exclusive'

  const timeoutInSec = options.timeoutInSec || '300'

  const cache = builder.create('ResponseCache')
  cache.att('async', aysnc)
  cache.att('continueOnError', continueOnError)
  cache.att('enabled', enabled)
  cache.att('name', name)

  cache.ele('DisplayName', {}, displayName)
  cache.ele('Properties', {})

  const cacheKey = cache.ele('CacheKey', {})
  cacheKey.ele('Prefix', {})
  cacheKey.ele('KeyFragment', { ref: keyFragmentRef, type: 'string' }, keyFragment)

  cache.ele('Scope', {}, scope)
  const expirySettings = cache.ele('ExpirySettings', {})
  expirySettings.ele('ExpiryDate', {})
  expirySettings.ele('TimeOfDay', {})
  expirySettings.ele('TimeoutInSec', {}, timeoutInSec)

  cache.ele('SkipCacheLookup', {})
  cache.ele('SkipCachePopulation', {})
  const xmlString = cache.end({ pretty: true, indent: '  ', newline: '\n' })
  return xmlString
}

function responseCacheGenTemplate (options, name) {
  const templateOptions = options
  templateOptions.keyFragment = options.name
  templateOptions.name = name
  templateOptions.timeoutInSec = Math.round(options.ttl / 1000)
  return responseCacheTemplate(templateOptions)
}
