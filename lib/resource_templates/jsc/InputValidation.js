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

/* global print, context, api, request */
// Template InputValidation.js
// include api.js

var bundle = context.getVariable('bundle')
var path = context.getVariable('proxy.pathsuffix').replace(/\/$/, '')
var resource = bundle.policify.getResourceForPath(api, path)
print('path', path, 'resource', resource)
var verb = context.getVariable('request.verb').toLowerCase()
var ParameterException = {}
var parameters

function wrapInput (parameter) {
  var wrappedParamValue = {}
  if (parameter['in'] === 'body') {
        // Assume json?
        // print('payload', request.content);
    wrappedParamValue = (request.content) ? request.content : {}
    wrappedParamValue = JSON.parse(wrappedParamValue)
  } else {
    var pathParamValue = context.getVariable('pathParam.' + parameter.name)
    if (pathParamValue) {
      wrappedParamValue[parameter.name] = pathParamValue
    } else {
      wrappedParamValue[parameter.name] = context.getVariable('request.queryparam.' + [parameter.name]) || ''
    }
  }
  return wrappedParamValue
}

if (resource) {
  if (!('parameters' in api['paths'][resource][verb])) {
    parameters = []
  } else {
    parameters = api['paths'][resource][verb]['parameters']
  }

  try {
      // loop through all defined parameters, throw exception when something fails
    parameters.forEach(function (parameter) {
      if (!(parameter['in'] === 'query' ||
            parameter['in'] === 'path' ||
            parameter['in'] === 'body')
         ) {
        // we only parse query, path and body params
        return false
      }

          // Create schema from parameter definition
      var pSchema = bundle.policify.paramToSchema(parameter)
      if (pSchema['$ref']) {
        print('resolve $ref', pSchema)
        pSchema = bundle.policify.schemaFromApi(api, { schema: pSchema })
      }
      var wrappedInput = wrapInput(parameter)
      print('parameter.name', parameter.name, 'wrappedInput', JSON.stringify(wrappedInput), JSON.stringify(pSchema))

          // Validate against the schema.
      var isValid = bundle.policify.validateSchema(wrappedInput, pSchema)
      print('valid?', isValid, JSON.stringify(wrappedInput))
      if (isValid) {
        print('Parameter value is conform the parameter schema')
      } else {
        var err = bundle.policify.getLastError()
        print('Parameter does not validate with the parameter schema')
        print('Error ' + JSON.stringify(err))
        throw ParameterException
      }
    })
  } catch (e) {
    if (e !== ParameterException) {
      throw e
    } else {
          // we got an error, let Apigee figure it out
      context.setVariable('INPUT.error', true)
    }
  }
} else {
  print('resource could not be found')
  context.setVariable('INPUT.error', true)
}
