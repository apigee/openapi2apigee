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
    getKvmEntry: getKvmEntry,
    getKvmGenEntry: getKvmGenEntry
}

function getKvmEntry (options) {
    var name = options.name || 'getKvmEntry-' + random.randomText()
    var aysnc = options.async || 'false'
    var continueOnError = options.continueOnError || 'false'
    var enabled = options.enabled || 'true'
    var kvmName = options.kvm
    var apiName = options.apiName



    var keyValueMapOperations = builder.create('KeyValueMapOperations')
    keyValueMapOperations.att('async', aysnc)
    keyValueMapOperations.att('continueOnError', continueOnError)
    keyValueMapOperations.att('enabled', enabled)
    keyValueMapOperations.att('name', name)
    keyValueMapOperations.att('mapIdentifier', kvmName)
    keyValueMapOperations.ele('DisplayName', {}, 'Get Target Endpoint')
    keyValueMapOperations.ele('ExclusiveCache', {}, false)
    keyValueMapOperations.ele('ExpiryTimeInSecs', {}, 300)
    keyValueMapOperations.ele('Get')
        .att('assignTo', apiName)
        .att('index', 1)
        .ele("Key")
        .ele("Parameter", {}, apiName)
    keyValueMapOperations.ele('Scope', {}, "environment")
    var xmlString = keyValueMapOperations.end({ pretty: true, indent: '  ', newline: '\n' })
    return xmlString
}

function getKvmGenEntry (options, name) {
    var templateOptions = options
    templateOptions.name = name || 'getKvmEntry'
    return getKvmEntry(templateOptions)
}
