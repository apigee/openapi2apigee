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
var path = require('path')

// Get document, or throw exception on error
try {
} catch (e) {
  console.log(e)
}

module.exports = {
  regexTemplate: regexTemplate,
  regexGenTemplate: regexGenTemplate,
  regularExpressions: regularExpressions
}

/*
  Reguired format of the json file:

  [{
    "element": "Header",
    "filters": [{
      "flags": "i",
      "rule": "(?:<script.*?>)"
    }, {
      "flags": "i",
      "rule": "(?:<style.*?>.*?((@[i\\\\\\\\])|(([:=]|(&#x?0*((58)|(3A)|(61)|(3D));?)).*?([(\\\\\\\\]|(&#x?0*((40)|(28)|(92)|(5C));?)))))"
    }],
    "name": "Cookie"
    }, {
    "element": "XMLPayload",
    "filters": [{
      "flags": "i",
      "rule": "(?:<script.*?[ /+\\t]*?((src)|(xlink:href)|(href))[ /+\\t]*=)"
    }, {
      "flags": "i",
      "rule": "(?:<[i]?frame.*?[ /+\\t]*?src[ /+\\t]*=)"
    }],
    "name": null
    }, {
    "element": "QueryParam",
    "filters": [{
      "flags": "i",
      "rule": "([\\s\\\"'`;\\/0-9\\=]+on\\w+\\s*=)"
    }, {
      "flags": "i",
      "rule": "(?:(?:procedure\\s+analyse\\s*?\\()|(?:;\\s*?(declare|open)\\s+[\\w-]+)|(?:create\\s+(procedure|function)\\s*?\\w+\\s*?\\(\\s*?\\)\\s*?-)|(?:declare[^\\w]+[@#]\\s*?\\w+)|(exec\\s*?\\(\\s*?@))"
    }, {
      "flags": "i",
      "rule": "(?:(?:create\\s+function\\s+\\w+\\s+returns)|(?:;\\s*?(?:select|create|rename|truncate|load|alter|delete|update|insert|desc)\\s*?[\\[(]?\\w{2,}))"
    }],
    "name": ".*"
  }]

*/

function regularExpressions () {
  var regexFile = path.join(process.cwd(), 'regex_rules.json')
  var regex = require(regexFile)
  return regex
}

function regexTemplate (options) {
  var continueOnError = options.continueOnError || 'true'
  var enabled = options.enabled || 'true'
  var name = options.name
  var displayName = options.displayName || name
  var msg = builder.create('Javascript')
  msg.att('continueOnError', continueOnError)
  msg.att('enabled', enabled)
  msg.att('timeLimit', '200')
  msg.att('name', displayName)
  msg.ele('DisplayName', {}, displayName)
  msg.ele('Properties', {})
  msg.ele('ResourceURL', 'jsc://' + name + '.js')
  msg.ele('IncludeURL', 'jsc://regex.js')
  msg.ele('IncludeURL', 'jsc://' + name + '-querystring.js')
  var xmlString = msg.end({ pretty: true, indent: '  ', newline: '\n' })
  return xmlString
}

function regexGenTemplate (options, name) {
  var templateOptions = options
  templateOptions.count = options.allow
  templateOptions.name = name

  return regexTemplate(templateOptions)
}
